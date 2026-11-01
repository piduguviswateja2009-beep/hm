import type { Metadata } from "next";
import Link from "next/link";
import { signInAction } from "@/app/admin/login/actions";

export const metadata:Metadata={title:"Admin sign in"};

export default async function AdminLoginPage({searchParams}:{searchParams:Promise<{error?:string;next?:string}>}) {
  const params=await searchParams;
  const message=params.error==="setup"?"Admin sign-in needs the Supabase public URL and publishable key configured.":params.error==="not-authorized"?"This account does not have active staff access.":params.error?"Sign-in failed. Check your email and password, then try again.":"Sign in with an invited staff account.";
  return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5 py-16"><section className="w-full rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-9"><Link href="/" className="text-sm font-semibold text-aqua">← HM Aqua Chem</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-aqua">Staff portal</p><h1 className="mt-3 text-3xl font-semibold text-navy">Admin sign in</h1><p className="mt-3 text-sm leading-6 text-muted">{message}</p>{params.error!=="setup"&&<form action={signInAction} className="mt-7 space-y-4"><input type="hidden" name="next" value={params.next??""}/><label className="block text-sm font-medium text-navy">Email<input required name="email" type="email" autoComplete="username" maxLength={254} className="mt-2 min-h-12 w-full rounded-xl border border-line px-4 text-sm"/></label><label className="block text-sm font-medium text-navy">Password<input required name="password" type="password" autoComplete="current-password" maxLength={256} className="mt-2 min-h-12 w-full rounded-xl border border-line px-4 text-sm"/></label><button className="min-h-12 w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">Sign in</button></form>}<p className="mt-6 text-xs text-muted">Access is invite-only. Public account registration is not available.</p></section></main>;
}
