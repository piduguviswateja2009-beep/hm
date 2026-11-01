import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategories, getProductBySlug, getPublicProductDocuments, getPublicProductImages } from "@/lib/catalog";
import { EnquiryAddButton } from "@/components/enquiry/enquiry-cart";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.seo_title ?? product?.name ?? "Product", description: product?.seo_description ?? product?.short_description ?? undefined, ...(product ? { alternates: { canonical: `/products/${product.slug}` } } : {}) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()]);
  if (!product) notFound();
  const [documents, images] = await Promise.all([getPublicProductDocuments(product.id), getPublicProductImages(product.id)]);
  const category = categories.find((item) => item.id === product.category_id);
  const specs = typeof product.specs === "object" && product.specs !== null && !Array.isArray(product.specs) ? Object.entries(product.specs) : [];
  const features = Array.isArray(product.features) ? product.features.filter((value): value is string => typeof value === "string") : [];
  const applications = Array.isArray(product.applications) ? product.applications.filter((value): value is string => typeof value === "string") : [];
  const packaging = Array.isArray(product.packaging_options) ? product.packaging_options.filter((value): value is string => typeof value === "string") : [];
  return <article className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.short_description ?? product.description ?? undefined, category: category?.name, brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined, image: images.length ? images.map((image) => image.public_url) : undefined }} />
    <BreadcrumbSchema items={[{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, ...(category ? [{ name: category.name, path: `/products/categories/${category.slug}` }] : []), { name: product.name, path: `/products/${product.slug}` }]} />
    <Link href="/products" className="text-sm font-semibold text-aqua">← All products</Link>
    {images.length > 0 && <div className="mt-8 grid gap-3 sm:grid-cols-2">{images.slice(0, 4).map((image) => <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface"><Image src={image.public_url} alt={image.alt_text} fill sizes="(max-width: 640px) 100vw, 50vw" unoptimized className="object-cover" /></div>)}</div>}
    <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-aqua">{category?.name ?? "Water treatment"}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{product.name}</h1>
    <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{product.description ?? product.short_description ?? "Contact us to discuss this product and its suitability for your application."}</p>
    <div className="mt-8 flex flex-wrap gap-3">{product.brand && <span className="rounded-full bg-surface px-4 py-2 text-sm">Brand: {product.brand}</span>}{product.model && <span className="rounded-full bg-surface px-4 py-2 text-sm">Model: {product.model}</span>}</div>
    <EnquiryAddButton product={{ productId: product.id, slug: product.slug, name: product.name }} />
    {features.length > 0 && <section className="mt-12"><h2 className="text-2xl font-semibold text-navy">Features</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">{features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>}
    {applications.length > 0 && <section className="mt-10"><h2 className="text-2xl font-semibold text-navy">Applications</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">{applications.map((item) => <li key={item}>{item}</li>)}</ul></section>}
    {specs.length > 0 && <section className="mt-12"><h2 className="text-2xl font-semibold text-navy">Specifications</h2><dl className="mt-4 divide-y divide-line rounded-2xl border border-line">{specs.map(([label, value]) => <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr]"><dt className="text-sm font-medium text-navy">{label}</dt><dd className="text-sm text-muted">{typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}</dd></div>)}</dl></section>}
    {packaging.length > 0 && <section className="mt-10"><h2 className="text-xl font-semibold text-navy">Packaging options</h2><p className="mt-2 text-sm leading-6 text-muted">{packaging.join(" · ")}</p></section>}
    {documents.length > 0 && <section className="mt-12"><h2 className="text-2xl font-semibold text-navy">Downloads</h2><ul className="mt-4 space-y-2">{documents.map((document) => <li key={document.id}><Link href={`/api/documents/${document.id}`} className="inline-flex rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy hover:border-aqua">{document.title}<span className="ml-2 text-xs font-normal text-muted">{document.type.toUpperCase()} · PDF</span></Link></li>)}</ul></section>}
    <div className="mt-12 rounded-2xl bg-navy p-7 text-white"><h2 className="text-xl font-semibold">Ask about this product</h2><p className="mt-2 text-sm text-white/70">Availability, specifications and pricing are confirmed by the team for each enquiry.</p><Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="mt-5 inline-flex rounded-full bg-aqua px-5 py-3 text-sm font-bold text-navy">Contact us about this product</Link></div>
  </article>;
}
