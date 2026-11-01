"use client";

import { useMemo, useState } from "react";
import { updateEnquiryAction } from "@/app/admin/(protected)/actions";
import type { Database } from "@/../types/database.types";

type Enquiry = Database["public"]["Tables"]["enquiries"]["Row"];
type Profile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "role">;
const statusNames = { new: "New", contacted: "Contacted", quoted: "Quoted", won: "Won", lost: "Lost" } as const;
const input = "mt-1 min-h-10 rounded-lg border border-line bg-white px-3 text-sm";

export function EnquiryList({ enquiries, profiles }: { enquiries: Enquiry[]; profiles: Profile[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return enquiries;
    return enquiries.filter((item) => [item.name, item.company, item.email, item.phone, item.city, item.message]
      .some((value) => value?.toLocaleLowerCase().includes(term)));
  }, [enquiries, search]);

  return <>
    <label className="mt-5 block max-w-xl text-sm font-medium text-navy">Search these latest enquiries
      <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={120} placeholder="Name, company, email, phone, city or message" className="mt-2 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm" />
    </label>
    <p className="mt-3 text-xs text-muted">Showing {filtered.length} of {enquiries.length} enquiries in this view.</p>
    <div className="mt-4 space-y-4">{filtered.map((item) => <details key={item.id} className="rounded-2xl border border-line bg-white p-5">
      <summary className="cursor-pointer"><span className="font-semibold text-navy">{item.name}</span><span className="ml-2 rounded-full bg-aqua-light px-2 py-1 text-xs text-navy">{statusNames[item.status as keyof typeof statusNames] ?? item.status}</span><span className="ml-3 text-xs text-muted">{item.type} · {new Date(item.created_at).toLocaleString("en-IN")}</span></summary>
      <div className="mt-4 grid gap-5 lg:grid-cols-2"><div className="space-y-2 text-sm">
        <p><span className="font-semibold text-navy">Company:</span> <span className="text-muted">{item.company ?? "—"}</span></p><p><span className="font-semibold text-navy">Email:</span> <span className="text-muted">{item.email ?? "—"}</span></p><p><span className="font-semibold text-navy">Phone:</span> <span className="text-muted">{item.phone ?? "—"}</span></p><p><span className="font-semibold text-navy">City:</span> <span className="text-muted">{item.city ?? "—"}</span></p><p className="pt-2 font-semibold text-navy">Message</p><p className="whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-6 text-ink">{item.message}</p>
      </div><form action={updateEnquiryAction} className="space-y-3"><input type="hidden" name="id" value={item.id} />
        <label className="block text-sm font-medium text-navy">Status<select name="status" defaultValue={item.status} className={`block w-full ${input}`}>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block text-sm font-medium text-navy">Assigned to<select name="assigned_to" defaultValue={item.assigned_to ?? ""} className={`block w-full ${input}`}><option value="">Unassigned</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.full_name ?? profile.id} ({profile.role})</option>)}</select></label>
        <label className="block text-sm font-medium text-navy">Internal notes<textarea name="notes" defaultValue={item.notes ?? ""} maxLength={5000} rows={4} className="mt-1 w-full rounded-lg border border-line bg-white p-3 text-sm" /></label>
        <button className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Save update</button>
      </form></div>
    </details>)}{!filtered.length && <p className="rounded-xl border border-dashed border-line p-8 text-sm text-muted">No enquiries match this search and status.</p>}</div>
  </>;
}
