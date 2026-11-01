import type { Metadata } from "next";
import { ProductList } from "@/components/catalog/product-list";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Water Treatment Products", description: "Browse HM Aqua Chem water treatment components and request product information.", alternates: { canonical: "/products" } };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([getCategories(), getProducts({ query: params.q, category: params.category })]);
  return <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">Catalog</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Water treatment products</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted">Explore product categories and enquire about solutions for your water treatment requirements. Pricing is shared on request.</p>{categories.length > 0 && <nav aria-label="Product categories" className="mt-6 flex flex-wrap gap-2">{categories.map((item)=><a key={item.id} href={`/products/categories/${item.slug}`} className="rounded-full bg-aqua-light px-4 py-2 text-xs font-semibold text-navy hover:bg-aqua/20">{item.name}</a>)}</nav>}<ProductList categories={categories} products={products} query={params.q} categoryId={params.category} /></section>;
}
