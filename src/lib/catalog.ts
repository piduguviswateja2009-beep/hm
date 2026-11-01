import type { Tables } from "@/../types/database.types";
import { getPublicSupabase } from "@/lib/supabase/public";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Industry = Tables<"industries">;
export type Service = Tables<"services">;

export async function getCategories(): Promise<Category[]> {
  const client = getPublicSupabase();
  if (!client) return [];
  const { data } = await client.from("categories").select("*").eq("is_active", true).is("deleted_at", null).order("sort_order");
  return data ?? [];
}

export async function getProducts(filters: { category?: string; query?: string } = {}): Promise<Product[]> {
  const client = getPublicSupabase();
  if (!client) return [];
  const selectedCategory = filters.category ? (await client.from("categories").select("id").eq("slug", filters.category).eq("is_active", true).maybeSingle()).data?.id : undefined;
  if (filters.category && !selectedCategory) return [];
  if (filters.query?.trim()) {
    const { data: matches } = await client.rpc("search_products", { search_query: filters.query.trim(), max_results: 60 });
    const ids = matches?.map((item) => item.id) ?? [];
    if (!ids.length) return [];
    let query = client.from("products").select("*").eq("is_active", true).is("deleted_at", null).in("id", ids);
    if (selectedCategory) query = query.eq("category_id", selectedCategory);
    const { data } = await query.order("name");
    return data ?? [];
  }
  let query = client.from("products").select("*").eq("is_active", true).is("deleted_at", null);
  if (selectedCategory) query = query.eq("category_id", selectedCategory);
  const { data } = await query.order("name");
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getPublicSupabase();
  if (!client) return null;
  const { data } = await client.from("products").select("*").eq("slug", slug).eq("is_active", true).is("deleted_at", null).maybeSingle();
  return data;
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  const client = getPublicSupabase();
  if (!client) return null;
  const { data } = await client.from("industries").select("*").eq("slug", slug).eq("is_active", true).is("deleted_at", null).maybeSingle();
  return data;
}

export async function getIndustries(): Promise<Industry[]> {
  const client = getPublicSupabase();
  if (!client) return [];
  const { data } = await client.from("industries").select("*").eq("is_active", true).is("deleted_at", null).order("name");
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  const client = getPublicSupabase();
  if (!client) return [];
  const { data } = await client.from("services").select("*").eq("is_active", true).is("deleted_at", null).order("name");
  return data ?? [];
}
