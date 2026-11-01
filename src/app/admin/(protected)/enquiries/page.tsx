import type { Metadata } from "next";
import { requireStaff } from "@/lib/supabase/staff";
import { EnquiryList } from "@/components/admin/enquiry-list";

export const metadata: Metadata = { title: "Enquiry CRM" };
const statusNames = { new: "New", contacted: "Contacted", quoted: "Quoted", won: "Won", lost: "Lost" } as const;
const input = "mt-1 min-h-10 rounded-lg border border-line bg-white px-3 text-sm";

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; saved?: string; error?: string }> }) {
  const staff = await requireStaff();
  const params = await searchParams;
  const activeStatus = Object.keys(statusNames).includes(params.status ?? "") ? params.status as keyof typeof statusNames : "";
  let query = staff.supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(100);
  if (activeStatus) query = query.eq("status", activeStatus);
  const [{ data: enquiries }, { data: profiles }] = await Promise.all([
    query,
    staff.supabase.from("profiles").select("id,full_name,role,is_active").eq("is_active", true),
  ]);
  const activeProfiles = (profiles ?? []).map(({ id, full_name, role }) => ({ id, full_name, role }));
  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold text-navy">Enquiry CRM</h2><p className="mt-2 text-sm text-muted">Review enquiries, update status, assign a staff member and add internal notes.</p></div><a href="/admin/enquiries/export" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-navy">Export CSV</a></div>
    {params.saved && <p role="status" className="mt-4 rounded-xl bg-aqua-light p-3 text-sm text-navy">Enquiry updated.</p>}{params.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">Could not update this enquiry.</p>}
    <form className="mt-6 flex flex-wrap items-center gap-3"><label className="text-sm font-medium text-navy">Status<select name="status" defaultValue={activeStatus} className={`ml-2 ${input}`}><option value="">All statuses</option>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Filter</button></form>
    <EnquiryList enquiries={enquiries ?? []} profiles={activeProfiles} />
  </>;
}
