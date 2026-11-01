import type { Metadata } from "next";
import Link from "next/link";
import { getIndustries } from "@/lib/catalog";

export const metadata: Metadata = { title: "Industries", description: "Water treatment component enquiries for industrial, commercial and institutional settings.", alternates: { canonical: "/industries" } };

export default async function IndustriesPage() {
  const industries = await getIndustries();
  return <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">Industries</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Water needs across different settings.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted">Explore the environments HM Aqua Chem serves. Requirements vary by water source, usage and system design.</p>{industries.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{industries.map((item)=><Link key={item.id} href={`/industries/${item.slug}`} className="rounded-2xl border border-line bg-white p-6 transition hover:border-aqua"><h2 className="text-lg font-semibold text-navy">{item.name}</h2><p className="mt-3 text-sm leading-6 text-muted">{item.description ?? "Discuss your water treatment requirements with the HM Aqua Chem team."}</p><span className="mt-5 inline-block text-sm font-semibold text-aqua">Explore needs →</span></Link>)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-line bg-white p-8 text-sm text-muted">Industry information is being prepared.</div>}</section>;
}
