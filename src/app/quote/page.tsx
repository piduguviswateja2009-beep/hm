import type { Metadata } from "next";
import { QuoteCart } from "@/components/enquiry/quote-cart";

export const metadata: Metadata = { title: "Request a Quote", description: "Select water treatment products and send HM Aqua Chem a quote enquiry." };

export default function QuotePage() {
  return <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">Quote request</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Your enquiry list</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted">No online payment is required. The team will follow up to discuss availability and pricing.</p><QuoteCart /></section>;
}
