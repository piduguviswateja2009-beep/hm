import { publicEnv } from "@/lib/env";
import { JsonLd } from "@/components/seo/json-ld";

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; path: string }> }) {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, base).toString() })) }} />;
}
