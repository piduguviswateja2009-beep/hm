import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { getIndustries, getProducts, getPublishedPosts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const [products, industries, posts] = await Promise.all([getProducts(), getIndustries(), getPublishedPosts()]);
  const staticRoutes = ["", "/about", "/products", "/industries", "/services", "/solutions", "/resources", "/resources/faqs", "/calculators/softener-load", "/contact", "/privacy", "/terms", "/cookies"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path || "/"}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.6 })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: product.updated_at, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...industries.map((industry) => ({ url: `${base}/industries/${industry.slug}`, lastModified: industry.updated_at, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((post) => ({ url: `${base}/resources/${post.slug}`, lastModified: post.updated_at, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
