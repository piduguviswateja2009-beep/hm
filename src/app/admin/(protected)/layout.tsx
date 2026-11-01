import Link from "next/link";
import { requireStaff } from "@/lib/supabase/staff";

const nav=[{href:"/admin",label:"Overview"},{href:"/admin/enquiries",label:"Enquiries"},{href:"/admin/products",label:"Products"},{href:"/admin/categories",label:"Categories"},{href:"/admin/posts",label:"Posts"},{href:"/admin/faqs",label:"FAQs"},{href:"/admin/testimonials",label:"Testimonials"},{href:"/admin/clients",label:"Clients"},{href:"/admin/newsletter",label:"Newsletter"},{href:"/admin/settings",label:"Site settings"}];

export default async function AdminLayout({children}:{children:React.ReactNode}) {
  const {profile}=await requireStaff();
  return <div className="min-h-[70vh] bg-surface"><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">HM Aqua Chem</p><h1 className="mt-1 text-2xl font-semibold text-navy">Admin dashboard</h1></div><div className="flex items-center gap-3"><span className="text-sm text-muted">{profile.full_name??"Staff"} · {profile.role}</span><form action="/admin/logout" method="post"><button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy">Sign out</button></form></div></div><nav aria-label="Admin navigation" className="mt-6 flex gap-2 overflow-x-auto border-b border-line pb-3">{nav.map((item)=><Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-aqua-light">{item.label}</Link>)}</nav><div className="py-8">{children}</div></div></div>;
}
