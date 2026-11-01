import Link from "next/link";
import { ArrowUpRight, Waves } from "lucide-react";
import { NewsletterForm } from "@/components/resources/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="bg-navy-strong text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-aqua"><Waves size={21} /></span><span className="text-lg font-bold">HM <span className="text-aqua">AQUA CHEM</span></span></Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">We Understand Water Better. Water treatment components and solutions for business.</p>
        </div>
        <div><h2 className="text-sm font-semibold">Explore</h2><ul className="mt-4 space-y-3 text-sm text-white/65"><li><Link href="/products" className="hover:text-white">Products</Link></li><li><Link href="/solutions" className="hover:text-white">Water reuse & ZLD</Link></li><li><Link href="/industries" className="hover:text-white">Industries</Link></li><li><Link href="/services" className="hover:text-white">Services</Link></li><li><Link href="/resources" className="hover:text-white">Knowledge hub</Link></li><li><Link href="/resources/faqs" className="hover:text-white">FAQs</Link></li><li><Link href="/about" className="hover:text-white">About HM Aqua Chem</Link></li><li><Link href="/contact" className="hover:text-white">Contact</Link></li></ul></div>
        <div><h2 className="text-sm font-semibold">Let’s talk water</h2><p className="mt-4 text-sm leading-6 text-white/65">Tell us what your project needs. Our team can help you find the right components.</p><Link href="/quote" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-aqua">Request a quote <ArrowUpRight size={16} /></Link><div className="mt-8 border-t border-white/10 pt-6"><h3 className="text-sm font-semibold">Water treatment updates</h3><p className="mt-2 mb-3 text-xs leading-5 text-white/60">Occasional articles and practical resources. Confirm by email to subscribe.</p><NewsletterForm/></div></div>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} HM Water Components Pvt. Ltd.</span><span>Product details are subject to confirmation.</span></div></div>
    </footer>
  );
}
