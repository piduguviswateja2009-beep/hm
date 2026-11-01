"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/../types/database.types";
import { publicEnv } from "@/lib/env";

export function createSupabaseBrowserAuthClient() {
  const url=publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key=publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) throw new Error("Supabase browser configuration is missing.");
  return createBrowserClient<Database>(url,key);
}
