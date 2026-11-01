import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductList } from "@/components/catalog/product-list";
import { getCategories, getProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const categories = await getCategories(); const category = categories.find((item)=>item.slug===slug);
  return { title: category?.seo_title ?? category?.name ?? "Product category", description: category?.seo_description ?? category?.description ?? undefined };
}

export default async function ProductCategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string }> }) {
  const [{ slug }, filters, categories] = await Promise.all([params, searchParams, getCategories()]);
  const category = categories.find((item)=>item.slug===slug); if (!category) notFound();
  const products = await getProducts({ category: slug, query: filters.q });
  return <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><Link href="/products" className="text-sm font-semibold text-aqua">← All products</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-aqua">Product category</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{category.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted">{category.description ?? "Contact us to discuss products in this category."}</p><ProductList categories={categories} products={products} query={filters.q} categoryId={slug} /></section>;
}
