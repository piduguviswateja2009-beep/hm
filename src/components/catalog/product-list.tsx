import Link from "next/link";
import type { Category, Product } from "@/lib/catalog";
import { EnquiryAddButton } from "@/components/enquiry/enquiry-cart";

export function ProductList({ products, categories, query = "", categoryId = "" }: { products: Product[]; categories: Category[]; query?: string; categoryId?: string }) {
  const names = new Map(categories.map((item) => [item.id, item.name]));
  return <>
    <form action="/products" className="mt-9 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_220px_auto]">
      <label className="sr-only" htmlFor="product-search">Search products</label><input id="product-search" name="q" defaultValue={query} placeholder="Search products and components" className="min-h-12 rounded-xl border border-line px-4 text-sm outline-none focus:border-aqua" />
      <label className="sr-only" htmlFor="product-category">Filter by category</label><select id="product-category" name="category" defaultValue={categoryId} className="min-h-12 rounded-xl border border-line bg-white px-4 text-sm"><option value="">All categories</option>{categories.map((item)=><option key={item.id} value={item.slug}>{item.name}</option>)}</select>
      <button className="min-h-12 rounded-xl bg-navy px-6 text-sm font-semibold text-white hover:bg-navy-strong">Search</button>
    </form>
    {products.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((item)=><article key={item.id} className="rounded-2xl border border-line bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-aqua">{names.get(item.category_id) ?? "Water treatment"}</p><h2 className="mt-3 text-xl font-semibold text-navy"><Link href={`/products/${item.slug}`} className="hover:text-aqua">{item.name}</Link></h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted">{item.short_description ?? "Product information is being prepared. Contact us to discuss your application."}</p><p className="mt-5 text-sm font-semibold text-navy">Request a quote</p><EnquiryAddButton product={{productId:item.id,slug:item.slug,name:item.name}} /></article>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center"><h2 className="text-xl font-semibold text-navy">Product listings are being verified</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">We are confirming current product specifications and availability before publishing listings. Contact HM Aqua Chem to discuss what you need.</p><Link href="/contact" className="mt-6 inline-flex rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Contact the team</Link></div>}
  </>;
}
