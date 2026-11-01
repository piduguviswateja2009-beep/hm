import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/../types/database.types";
import { publicEnv } from "@/lib/env";

export function getSupabaseAdmin() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
