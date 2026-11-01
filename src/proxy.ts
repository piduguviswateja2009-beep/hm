import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/../types/database.types";
import { publicEnv } from "@/lib/env";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/water-treatment-plants") {
    const legacyTarget = request.nextUrl.clone();
    legacyTarget.pathname = "/products";
    legacyTarget.search = "";
    return NextResponse.redirect(legacyTarget, 301);
  }
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  const url=publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key=publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLogin=request.nextUrl.pathname==="/admin/login";
  const isNoAccess=request.nextUrl.pathname==="/admin/no-access";
  if(!url||!key) return NextResponse.next();

  let response=NextResponse.next({request});
  const supabase=createServerClient<Database>(url,key,{
    cookies:{
      getAll(){return request.cookies.getAll();},
      setAll(cookiesToSet){
        cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));
        response=NextResponse.next({request});
        cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
    },
  });
  const {data}=await supabase.auth.getClaims();
  if(!data?.claims&&!isLogin&&!isNoAccess){
    const target=request.nextUrl.clone(); target.pathname="/admin/login"; target.searchParams.set("next",request.nextUrl.pathname);
    return NextResponse.redirect(target);
  }
  if(data?.claims&&isLogin){ const target=request.nextUrl.clone(); target.pathname="/admin"; target.search=""; return NextResponse.redirect(target); }
  return response;
}

export const config={matcher:["/admin/:path*","/water-treatment-plants"]};
