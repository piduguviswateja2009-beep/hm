"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { publicEnv } from "@/lib/env";

const CONSENT_KEY = "hm-analytics-consent";
type Choice = "accepted" | "rejected" | null;
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("hm-consent-update", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("hm-consent-update", callback); };
}
function getChoice(): Choice {
  if (typeof window === "undefined") return null;
  try { const value = window.localStorage.getItem(CONSENT_KEY); return value === "accepted" || value === "rejected" ? value : null; } catch { return null; }
}
function saveChoice(value: Exclude<Choice, null>) {
  try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* Browser storage may be disabled. */ }
  if (value === "rejected" && window.gtag) { window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); clearAnalyticsCookies(); }
  window.dispatchEvent(new Event("hm-consent-update"));
}
function clearAnalyticsCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name?.startsWith("_ga")) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${location.hostname}; SameSite=Lax`;
    }
  }
}

function useConsentChoice() { return useSyncExternalStore(subscribe, getChoice, () => null); }

function GoogleAnalytics({ measurementId, onReady }: { measurementId: string; onReady: () => void }) {
  const safeId = /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : "";
  if (!safeId) return null;
  const bootstrap = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('consent','update',{analytics_storage:'granted'});gtag('js',new Date());gtag('config','${safeId}',{anonymize_ip:true,send_page_view:false});`;
  return <><Script id="hm-ga-bootstrap" strategy="afterInteractive" onReady={onReady} dangerouslySetInnerHTML={{ __html: bootstrap }} /><Script id="hm-ga-loader" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(safeId)}`} strategy="afterInteractive" /></>;
}

export function CookieConsent() {
  const choice = useConsentChoice();
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const measurementId = publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const [analyticsReady, setAnalyticsReady] = useState(false);
  useEffect(() => {
    if (choice !== "accepted") { previousPath.current = null; return; }
    if (!analyticsReady || !window.gtag) return;
    if (previousPath.current !== pathname) window.gtag("event", "page_view", { page_path: pathname });
    previousPath.current = pathname;
  }, [analyticsReady, choice, pathname]);
  return <>{choice === "accepted" && measurementId && <GoogleAnalytics measurementId={measurementId} onReady={() => setAnalyticsReady(true)} />}{measurementId && choice === null && <aside aria-labelledby="cookie-title" className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white p-4 shadow-2xl sm:p-6"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="cookie-title" className="font-semibold text-navy">Analytics preferences</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Allow optional Google Analytics to help us understand site use. Analytics is off until you choose. Read our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/cookies" className="underline">Cookie Policy</Link>.</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => saveChoice("rejected")} className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-navy">Decline</button><button type="button" onClick={() => saveChoice("accepted")} className="rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white">Allow analytics</button></div></div></aside>}</>;
}

export function CookiePreferences() {
  const choice = useConsentChoice();
  const hasAnalytics = !!publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return <div className="mt-6 rounded-2xl border border-line bg-white p-5"><p role="status" className="text-sm text-muted">Current preference: {choice ?? "not set"}</p>{hasAnalytics ? <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => saveChoice("accepted")} className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Allow analytics</button><button type="button" onClick={() => { saveChoice("rejected"); window.location.reload(); }} className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-navy">Decline analytics</button></div> : <p className="mt-2 text-xs text-muted">Analytics is not configured on this deployment.</p>}</div>;
}

