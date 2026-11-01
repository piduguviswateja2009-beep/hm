import Link from "next/link";
import { requireStaff } from "@/lib/supabase/staff";

export default async function AdminOverviewPage() {
  const {supabase}=await requireStaff();
  const [enquiries,products,categories,publishedPosts]=await Promise.all([
    supabase.from("enquiries").select("id",{count:"exact",head:true}).eq("status","new"),
    supabase.from("products").select("id",{count:"exact",head:true}).eq("is_active",true).is("deleted_at",null),
    supabase.from("categories").select("id",{count:"exact",head:true}).eq("is_active",true).is("deleted_at",null),
    supabase.from("posts").select("id",{count:"exact",head:true}).eq("status","published").is("deleted_at",null),
  ]);
  const metrics=[{label:"New enquiries",value:enquiries.count??0,href:"/admin/enquiries"},{label:"Active products",value:products.count??0,href:"/admin/products"},{label:"Active categories",value:categories.count??0,href:"/admin/categories"},{label:"Published posts",value:publishedPosts.count??0,href:"/admin/posts"}];
  return <><div><h2 className="text-2xl font-semibold text-navy">Welcome back</h2><p className="mt-2 text-sm text-muted">Use the dashboard to manage the catalog and follow up on enquiries.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((item)=><Link key={item.label} href={item.href} className="rounded-2xl border border-line bg-white p-6 hover:border-aqua"><p className="text-sm text-muted">{item.label}</p><p className="mt-2 text-3xl font-semibold text-navy">{item.value}</p></Link>)}</div><section className="mt-8 rounded-2xl border border-line bg-white p-6"><h3 className="font-semibold text-navy">Quick actions</h3><div className="mt-4 flex flex-wrap gap-3"><Link href="/admin/products" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Manage products</Link><Link href="/admin/enquiries" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-navy">Open enquiry CRM</Link></div><p className="mt-5 text-xs leading-5 text-muted">Product view analytics and enquiry trend charts will be available after the analytics phase.</p></section></>;
}
