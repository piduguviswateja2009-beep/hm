import { createHmac } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enquiryInputSchema } from "@/lib/validation/enquiry";

const MAX_BODY_BYTES = 20_000;

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try { const originHost = new URL(origin).host; const requestHost = request.headers.get("host"); return !!requestHost && originHost.toLowerCase() === requestHost.toLowerCase(); }
  catch { return false; }
}

function clientAddress(request: NextRequest) {
  return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!secret && !siteKey && process.env.NODE_ENV !== "production") return true;
  if (!secret || !siteKey || !token) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({secret,response:token}),cache:"no-store",signal:AbortSignal.timeout(8_000),
    });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "success" in result && result.success === true;
  } catch { return false; }
}

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY; const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails",{
      method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},
      body:JSON.stringify({from,to:[to],subject,text}),cache:"no-store",signal:AbortSignal.timeout(8_000),
    });
    return response.ok;
  } catch { return false; }
}

async function readBoundedBody(request: NextRequest, maxBytes: number): Promise<string | null> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  }
  const body = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { body.set(chunk,offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(body);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({error:"This request could not be verified."},{status:403});
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return NextResponse.json({error:"Send the enquiry as JSON."},{status:415});

  const bodyText = await readBoundedBody(request,MAX_BODY_BYTES);
  if (bodyText === null) return NextResponse.json({error:"The enquiry is too large."},{status:413});
  let body: unknown;
  try { body = JSON.parse(bodyText); } catch { return NextResponse.json({error:"The enquiry data is invalid."},{status:400}); }

  const admin = getSupabaseAdmin();
  const pepper = process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!admin || !pepper) return NextResponse.json({error:"Enquiry submission is temporarily unavailable. Please try again later."},{status:503});

  const keyHash = createHmac("sha256",pepper).update(clientAddress(request)).digest("hex");
  const now = new Date(); const windowStart = new Date(Math.floor(now.getTime()/60_000)*60_000).toISOString();
  let allowed: boolean | null = null; let rateError: { message: string } | null = null;
  try { const result = await admin.rpc("consume_public_rate_limit",{p_key_hash:keyHash,p_window_start:windowStart,p_limit:5}); allowed=result.data; rateError=result.error; }
  catch { console.error("Public enquiry rate limit check failed."); return NextResponse.json({error:"Enquiry submission is temporarily unavailable."},{status:503}); }
  if (rateError || allowed === null) { console.error("Public enquiry rate limit check failed."); return NextResponse.json({error:"Enquiry submission is temporarily unavailable."},{status:503}); }
  if (!allowed) return NextResponse.json({error:"Too many attempts. Please wait a minute and try again."},{status:429,headers:{"Retry-After":"60"}});

  const parsed = enquiryInputSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string,string> = {};
    for (const issue of parsed.error.issues) { const key = String(issue.path[0] ?? "form"); if (!fieldErrors[key]) fieldErrors[key] = issue.message; }
    return NextResponse.json({error:"Please check the enquiry details.",fieldErrors},{status:400});
  }
  const input = parsed.data;
  // Honeypot responses are deliberately indistinguishable from successful submissions.
  if (input.website.trim()) return NextResponse.json({ok:true},{status:202});
  const hasCaptchaConfig = !!process.env.TURNSTILE_SECRET_KEY && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if ((process.env.NODE_ENV === "production" || process.env.TURNSTILE_SECRET_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && !hasCaptchaConfig) {
    console.error("Enquiry spam-protection configuration is incomplete.");
    return NextResponse.json({error:"Enquiry submission is temporarily unavailable."},{status:503});
  }
  if (!await verifyTurnstile(input.turnstileToken)) return NextResponse.json({error:"Please complete the spam check and try again."},{status:400});

  const items = input.items.map((item)=>({product_id:item.productId,quantity:item.quantity,unit:item.unit,note:item.note}));
  let enquiryId: string | null = null; let insertError: { message: string } | null = null;
  try {
    const result = await admin.rpc("create_public_enquiry",{
      p_type:input.type,p_name:input.name,p_company:input.company,p_email:input.email.toLowerCase(),p_phone:input.phone,p_city:input.city,
      p_message:input.message,p_source_page:input.sourcePage,p_utm_source:input.utm.source,p_utm_medium:input.utm.medium,
      p_utm_campaign:input.utm.campaign,p_utm_term:input.utm.term,p_utm_content:input.utm.content,p_items:items,
    });
    enquiryId=result.data; insertError=result.error;
  } catch { console.error("Public enquiry could not be saved."); return NextResponse.json({error:"We couldn’t save your enquiry. Please try again shortly."},{status:503}); }
  if (insertError || !enquiryId) {
    if (insertError?.message.includes("products are unavailable")) return NextResponse.json({error:"One of the selected products is no longer available. Please update your enquiry list."},{status:422});
    console.error("Public enquiry could not be saved.");
    return NextResponse.json({error:"We couldn’t save your enquiry. Please try again shortly."},{status:503});
  }

  const teamEmail = process.env.ENQUIRY_TEAM_EMAIL;
  const itemNames = new Map<string,string>();
  if (items.length) {
    try {
      const {data:products} = await admin.from("products").select("id,name").in("id",items.map((item)=>item.product_id)).eq("is_active",true);
      for (const product of products ?? []) itemNames.set(product.id,product.name);
    } catch { /* The enquiry is already stored; email can still include safe product IDs. */ }
  }
  const summary = [
    `A new ${input.type} enquiry has been received.`,
    `Reference: ${enquiryId}`,
    `Name: ${input.name}`,
    `Company: ${input.company || "Not provided"}`,
    `Email: ${input.email || "Not provided"}`,
    `Phone: ${input.phone || "Not provided"}`,
    `City: ${input.city || "Not provided"}`,
    `Source page: ${input.sourcePage}`,
    `Message:`,input.message,
    ...(items.length ? ["Selected products:",...items.map((item)=>`${itemNames.get(item.product_id) ?? item.product_id} — quantity ${item.quantity}`)] : []),
  ].join("\n");
  const emailTasks: Promise<boolean>[] = [];
  let teamDeliveryFailed = !teamEmail;
  if (teamEmail) emailTasks.push(sendEmail(teamEmail,`New ${input.type} enquiry`,summary));
  if (input.email) emailTasks.push(sendEmail(input.email.toLowerCase(),"We received your enquiry","Thank you for contacting HM Aqua Chem. We have received your enquiry and the team will follow up using the details you provided."));
  if (emailTasks.length) {
    const results = await Promise.all(emailTasks);
    if (results.some((sent)=>!sent)) teamDeliveryFailed = true;
    if (teamDeliveryFailed) console.error("One or more enquiry notifications could not be delivered.");
  } else {
    console.error("Enquiry notification email is not configured.");
  }
  return NextResponse.json({ok:true},{status:201});
}
