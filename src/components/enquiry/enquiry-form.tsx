"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { enquiryInputSchema, type EnquiryInput } from "@/lib/validation/enquiry";

declare global {
  interface Window { turnstile?: { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string; remove: (id: string) => void } }
}

type FormItem = { productId: string; quantity: number; unit?: string; note?: string };
export function EnquiryForm({ type = "contact", items = [], initialMessage = "", submitLabel = "Send enquiry", onSuccess }: { type?: "contact"|"quote"; items?: FormItem[]; initialMessage?: string; submitLabel?: string; onSuccess?: () => void }) {
  const [turnstileToken,setTurnstileToken] = useState("");
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [message,setMessage] = useState(initialMessage);
  const [pending,setPending] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null); const widgetId = useRef<string | undefined>(undefined);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(()=>{
    if(!siteKey || !widgetRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(widgetRef.current,{sitekey:siteKey,callback:setTurnstileToken,"expired-callback":()=>setTurnstileToken(""),"error-callback":()=>setTurnstileToken("")});
    return ()=>{ if(widgetId.current && window.turnstile){ window.turnstile.remove(widgetId.current); widgetId.current=undefined; } };
  },[siteKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const params = new URLSearchParams(window.location.search);
    const raw = { type, name: String(form.get("name")??""), company: String(form.get("company")??""), email: String(form.get("email")??""), phone: String(form.get("phone")??""), city: String(form.get("city")??""), message, website: String(form.get("website")??""), turnstileToken, items, utm:{source:params.get("utm_source")??"",medium:params.get("utm_medium")??"",campaign:params.get("utm_campaign")??"",term:params.get("utm_term")??"",content:params.get("utm_content")??""} };
    const parsed = enquiryInputSchema.safeParse(raw);
    if(!parsed.success){ const next: Record<string,string>={}; for(const issue of parsed.error.issues){ const field=String(issue.path[0]??"form"); if(!next[field]) next[field]=issue.message; } setErrors(next); setError("Please check the highlighted fields."); return; }
    if(siteKey && !turnstileToken){ setError("Please complete the spam check."); return; }
    setErrors({}); setPending(true);
    try {
      const response = await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...parsed.data,sourcePage:window.location.pathname,turnstileToken})});
      if(!response.ok){ const body = await response.json().catch(()=>null); setError(body?.error ?? "We couldn’t send your enquiry right now. Please try again shortly."); return; }
      setSuccess(true); setMessage(""); formElement.reset(); setTurnstileToken(""); onSuccess?.();
    } catch { setError("We couldn’t connect. Please check your connection and try again."); }
    finally { setPending(false); }
  }

  const fieldClass="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-aqua";
  return <>
    {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={()=>{ if(widgetRef.current && window.turnstile && !widgetId.current){ widgetId.current=window.turnstile.render(widgetRef.current,{sitekey:siteKey,callback:setTurnstileToken,"expired-callback":()=>setTurnstileToken(""),"error-callback":()=>setTurnstileToken("")}); } }}/ >}
    {success ? <div role="status" className="rounded-2xl border border-aqua/30 bg-aqua-light p-6"><h3 className="text-lg font-semibold text-navy">Thanks — your enquiry was received.</h3><p className="mt-2 text-sm leading-6 text-ink">The team will follow up using the contact details you provided.</p></div> : <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-navy">Name *<input className={fieldClass} name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} />{errors.name&&<span className="mt-1 block text-xs text-red-700">{errors.name}</span>}</label><label className="text-sm font-medium text-navy">Company<input className={fieldClass} name="company" autoComplete="organization" maxLength={120} /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-navy">Email<input className={fieldClass} name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={!!errors.email} />{errors.email&&<span className="mt-1 block text-xs text-red-700">{errors.email}</span>}</label><label className="text-sm font-medium text-navy">Phone<input className={fieldClass} name="phone" type="tel" autoComplete="tel" maxLength={32} aria-invalid={!!errors.phone} />{errors.phone&&<span className="mt-1 block text-xs text-red-700">{errors.phone}</span>}</label></div>
      <label className="block text-sm font-medium text-navy">City<input className={fieldClass} name="city" autoComplete="address-level2" maxLength={100} /></label>
      <label className="block text-sm font-medium text-navy">How can we help? *<textarea className="mt-2 min-h-32 w-full rounded-xl border border-line bg-white p-4 text-sm outline-none focus:border-aqua" name="message" value={message} onChange={(e)=>setMessage(e.target.value)} required maxLength={4000} aria-invalid={!!errors.message} />{errors.message&&<span className="mt-1 block text-xs text-red-700">{errors.message}</span>}</label>
      <label aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {siteKey && <div><div ref={widgetRef} /><span className="sr-only">Complete the Cloudflare spam check.</span></div>}
      {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-strong disabled:cursor-wait disabled:opacity-60">{pending?"Sending…":submitLabel}</button>
      <p className="text-xs leading-5 text-muted">By submitting, you agree that HM Aqua Chem may use your details to respond to this enquiry.</p>
    </form>}
  </>;
}

export type { EnquiryInput };
