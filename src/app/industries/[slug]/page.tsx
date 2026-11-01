import { notFound } from "next/navigation";
import Link from "next/link";
import { getIndustry } from "@/lib/catalog";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustry(slug);
  return industry ? { title: industry.seo_title ?? industry.name, description: industry.seo_description ?? industry.description ?? undefined, alternates: { canonical: `/industries/${industry.slug}` } } : { title: "Industry" };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const industry = await getIndustry(slug);
  if (!industry) notFound();
  return <article className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><Link href="/industries" className="text-sm font-semibold text-aqua">← All industries</Link><h1 className="mt-8 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{industry.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{industry.description ?? `Water treatment requirements in ${industry.name.toLowerCase()} depend on water source, usage and the system in place. Share your requirements with HM Aqua Chem to discuss suitable components.`}</p>{industry.content && <div className="mt-8 whitespace-pre-wrap text-sm leading-7 text-muted">{industry.content}</div>}<Link href="/contact" className="mt-8 inline-flex rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white">Discuss your requirements</Link></article>;
}
