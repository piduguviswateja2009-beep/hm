"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(256),next:z.string().max(200).optional()});

export async function signInAction(formData:FormData) {
  const parsed=loginSchema.safeParse({email:formData.get("email"),password:formData.get("password"),next:formData.get("next")});
  if(!parsed.success) redirect("/admin/login?error=invalid");
  const supabase=await createSupabaseServerClient();
  if(!supabase) redirect("/admin/login?error=setup");
  const {data,error}=await supabase.auth.signInWithPassword({email:parsed.data.email,password:parsed.data.password});
  if(error||!data.user) redirect("/admin/login?error=invalid");
  const {data:profile}=await supabase.from("profiles").select("role,is_active").eq("id",data.user.id).maybeSingle();
  if(!profile||!profile.is_active||!(profile.role==="admin"||profile.role==="editor")) {
    await supabase.auth.signOut();
    redirect("/admin/no-access");
  }
  const next=parsed.data.next;
  redirect(next?.startsWith("/admin/")&&!next.startsWith("//")?next:"/admin");
}
