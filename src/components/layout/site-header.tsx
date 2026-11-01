import Link from "next/link";
import { ArrowUpRight, Menu, Waves } from "lucide-react";
import { EnquiryCartCount } from "@/components/enquiry/enquiry-cart";

const links = [
  { href: "/products", label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/services", label: "Services" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="HM Aqua Chem home">
          <span className="grid size-10 place-items-center rounded-xl bg-navy text-aqua"><Waves size={22} /></span>
          <span className="leading-tight"><span className="block text-lg font-bold tracking-tight text-navy">HM <span className="text-aqua">AQUA CHEM</span></span><span className="text-[10px] font-semibold tracking-[.18em] text-muted">WATER COMPONENTS</span></span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-ink/80 transition hover:text-aqua">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/quote" className="hidden items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-strong sm:flex">Enquiry list <EnquiryCartCount /> <ArrowUpRight size={16} /></Link>
          <details className="group relative md:hidden">
            <summary aria-label="Open navigation menu" className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-line text-navy"><Menu size={21} /></summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-12 flex w-56 flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-xl">
              {links.map((link) => <Link key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-surface">{link.label}</Link>)}
              <Link href="/quote" className="mt-1 rounded-lg bg-navy px-3 py-3 text-sm font-semibold text-white">Enquiry list <EnquiryCartCount /></Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
