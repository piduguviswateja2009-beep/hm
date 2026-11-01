import type { Metadata } from "next";
import { getServices } from "@/lib/catalog";

export const metadata: Metadata = { title: "Services", description: "Water treatment services and support offered by HM Aqua Chem.", alternates: { canonical: "/services" } };

export default async function ServicesPage() {
  const services = await getServices();
  return <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">Services</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Support for water treatment projects.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted">Service details are published only after the team confirms the scope and availability.</p>{services.length ? <div className="mt-9 grid gap-4 sm:grid-cols-2">{services.map((service)=><article key={service.id} className="rounded-2xl border border-line bg-white p-6"><h2 className="text-xl font-semibold text-navy">{service.name}</h2><p className="mt-3 text-sm leading-6 text-muted">{service.description ?? "Contact us to confirm scope and availability."}</p></article>)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-line bg-white p-8 text-sm leading-6 text-muted">Service offerings are awaiting confirmation. Contact us about your project, and we will clarify the support currently available.</div>}</section>;
}
