import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EnquiryCartProvider } from "@/components/enquiry/enquiry-cart";
import { SiteSchema } from "@/components/seo/site-schema";
import { CookieConsent } from "@/components/seo/cookie-consent";
import { publicEnv } from "@/lib/env";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: "HM Aqua Chem | Water Treatment Components", template: "%s | HM Aqua Chem" },
  description: "Water treatment components and solutions for industrial and commercial applications.",
  openGraph: { type: "website", siteName: "HM Aqua Chem", locale: "en_IN", title: "HM Aqua Chem | Water Treatment Components", description: "Water treatment components and solutions for industrial and commercial applications." },
  twitter: { card: "summary", title: "HM Aqua Chem | Water Treatment Components", description: "Water treatment components and solutions for industrial and commercial applications." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.className} ${geist.variable}`}>
        <EnquiryCartProvider>
          <SiteSchema />
          <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3" href="#main">Skip to content</a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <CookieConsent />
        </EnquiryCartProvider>
      </body>
    </html>
  );
}
