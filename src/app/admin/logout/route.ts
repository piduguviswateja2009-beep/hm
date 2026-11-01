import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request:NextRequest) {
  const origin=request.headers.get("origin");
  if(!origin) return NextResponse.json({error:"Origin is required."},{status:403});
  try {
    const parsedOrigin=new URL(origin);
    if(!["http:","https:"].includes(parsedOrigin.protocol)||parsedOrigin.host!==request.headers.get("host")) return NextResponse.json({error:"Invalid origin."},{status:403});
  } catch {
    return NextResponse.json({error:"Invalid origin."},{status:403});
  }
  const supabase=await createSupabaseServerClient();
  await supabase?.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login",request.url),{status:303});
}
