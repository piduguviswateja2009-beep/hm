import Link from "next/link";

export default function NoAdminAccessPage() {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-aqua">Staff portal</p><h1 className="mt-3 text-3xl font-semibold text-navy">This account has no admin access</h1><p className="mt-4 text-sm leading-6 text-muted">Ask an HM Aqua Chem administrator to invite your account and assign an active staff role.</p><Link href="/admin/login" className="mt-7 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">Return to sign in</Link></main>;
}
