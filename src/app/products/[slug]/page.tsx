import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductBySlug } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const product = await getProductBySlug(slug);
  return { title: product?.seo_title ?? product?.name ?? "Product", description: product?.seo_description ?? product?.short_description ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()]);
  if (!product) notFound();
  const category = categories.find((item) => item.id === product.category_id);
  const specs = typeof product.specs === "object" && product.specs !== null && !Array.isArray(product.specs) ? Object.entries(product.specs) : [];
  const features = Array.isArray(product.features) ? product.features.filter((value): value is string => typeof value === "string") : [];
  return <article className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><Link href="/products" className="text-sm font-semibold text-aqua">← All products</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-aqua">{category?.name ?? "Water treatment"}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{product.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{product.description ?? product.short_description ?? "Contact us to discuss this product and its suitability for your application."}</p><div className="mt-8 flex flex-wrap gap-3">{product.brand && <span className="rounded-full bg-surface px-4 py-2 text-sm">Brand: {product.brand}</span>}{product.model && <span className="rounded-full bg-surface px-4 py-2 text-sm">Model: {product.model}</span>}</div>{features.length > 0 && <section className="mt-12"><h2 className="text-2xl font-semibold text-navy">Features</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">{features.map((feature)=><li key={feature}>{feature}</li>)}</ul></section>}{specs.length > 0 && <section className="mt-12"><h2 className="text-2xl font-semibold text-navy">Specifications</h2><dl className="mt-4 divide-y divide-line rounded-2xl border border-line">{specs.map(([label,value])=><div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr]"><dt className="text-sm font-medium text-navy">{label}</dt><dd className="text-sm text-muted">{typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}</dd></div>)}</dl></section>}<div className="mt-12 rounded-2xl bg-navy p-7 text-white"><h2 className="text-xl font-semibold">Ask about this product</h2><p className="mt-2 text-sm text-white/70">Availability, specifications and pricing are confirmed by the team for each enquiry.</p><Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="mt-5 inline-flex rounded-full bg-aqua px-5 py-3 text-sm font-bold text-navy">Request product information</Link></div></article>;
}
