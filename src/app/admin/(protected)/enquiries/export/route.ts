import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/supabase/staff";

function csv(value:string|null) {
  const safe=value??"";
  const spreadsheetSafe=/^[\s]*[=+@\-]/.test(safe)?`'${safe}`:safe;
  return `"${spreadsheetSafe.replace(/"/g,'""')}"`;
}

export async function GET() {
  const staff=await requireStaff();
  const {data,error}=await staff.supabase.from("enquiries").select("created_at,type,status,name,company,email,phone,city,message,source_page,notes").order("created_at",{ascending:false}).limit(5000);
  if(error) return NextResponse.json({error:"Export unavailable."},{status:503});
  const header=["Created at","Type","Status","Name","Company","Email","Phone","City","Message","Source page","Internal notes"];
  const rows=(data??[]).map((row)=>[row.created_at,row.type,row.status,row.name,row.company,row.email,row.phone,row.city,row.message,row.source_page,row.notes].map(csv).join(","));
  return new NextResponse([header.map(csv).join(","),...rows].join("\r\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=hm-enquiries.csv","Cache-Control":"private, no-store"}});
}
