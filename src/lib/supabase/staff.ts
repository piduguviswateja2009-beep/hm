import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getStaffContext() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {data:claimsData,error:claimsError}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(claimsError||typeof userId!=="string") return null;
  const {data:profile,error}=await supabase.from("profiles").select("id,full_name,role,is_active").eq("id",userId).maybeSingle();
  if(error||!profile||!profile.is_active||!(profile.role==="admin"||profile.role==="editor")) return null;
  return {supabase,userId,profile};
}

export async function requireStaff() {
  const staff=await getStaffContext();
  if(!staff) redirect("/admin/no-access");
  return staff;
}
