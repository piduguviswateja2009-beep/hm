import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";

export const metadata: Metadata = { title: "Contact HM Aqua Chem", description: "Contact HM Aqua Chem about water treatment products and projects.", alternates: { canonical: "/contact" } };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  return <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-20"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">Contact</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Let’s talk about your water needs.</h1><p className="mt-5 max-w-xl text-base leading-7 text-muted">Share the type of application, water source and location. The HM Aqua Chem team can follow up about your enquiry.</p>{product && <p className="mt-5 rounded-xl bg-aqua-light p-4 text-sm text-navy">You’re asking about: <strong>{product}</strong>. Mention this in your message.</p>}<div className="mt-8 rounded-2xl border border-line bg-white p-6"><h2 className="text-lg font-semibold text-navy">Business contact details</h2><p className="mt-3 text-sm leading-6 text-muted">The team’s current public address and contact channels are being confirmed. Please use this form to send your enquiry.</p></div><Link href="/products" className="mt-6 inline-flex text-sm font-semibold text-aqua">Browse products →</Link></div><aside className="rounded-3xl bg-surface p-7 sm:p-9"><h2 className="mb-6 text-xl font-semibold text-navy">Send an enquiry</h2><EnquiryForm initialMessage={product ? `I would like information about ${product}. ` : ""} /></aside></section>;
}
