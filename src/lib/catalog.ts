import type { Tables } from "@/../types/database.types";
import { getPublicSupabase } from "@/lib/supabase/public";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Industry = Tables<"industries">;
export type Service = Tables<"services">;
export type Post = Tables<"posts">;
export type Faq = Tables<"faqs">;
export type ProductDocument = Tables<"product_documents">;
export type ProductImage = Tables<"product_images">;

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

export async function getPublishedPosts(): Promise<Post[]> {
  const client=getPublicSupabase(); if(!client) return [];
  const {data}=await client.from("posts").select("*").eq("status","published").is("deleted_at",null).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false}).limit(30);
  return data??[];
}

export async function getPublishedPostBySlug(slug:string): Promise<Post|null> {
  const client=getPublicSupabase(); if(!client) return null;
  const {data}=await client.from("posts").select("*").eq("slug",slug).eq("status","published").is("deleted_at",null).lte("published_at",new Date().toISOString()).maybeSingle();
  return data;
}

export async function getActiveFaqs(): Promise<Faq[]> {
  const client=getPublicSupabase(); if(!client) return [];
  const {data}=await client.from("faqs").select("*").eq("is_active",true).is("deleted_at",null).order("sort_order");
  return data??[];
}

export async function getPublicProductDocuments(productId:string): Promise<ProductDocument[]> {
  const client=getPublicSupabase(); if(!client) return [];
  const {data}=await client.from("product_documents").select("*").eq("product_id",productId).eq("is_public",true).order("title");
  return data??[];
}

export async function getPublicProductImages(productId:string): Promise<Array<ProductImage&{public_url:string}>> {
  const client=getPublicSupabase(); if(!client) return [];
  const {data}=await client.from("product_images").select("*").eq("product_id",productId).order("sort_order");
  return (data??[]).map((image)=>({...image,public_url:client.storage.from("public-media").getPublicUrl(image.storage_path).data.publicUrl}));
}

export async function getPublishedTestimonials() {
  const client=getPublicSupabase(); if(!client) return [];
  const {data}=await client.from("testimonials").select("id,name,company,location,quote,rating,product_ref,source,created_at,updated_at,deleted_at,is_published").eq("is_published",true).is("deleted_at",null).order("created_at",{ascending:false}).limit(12);
  return data??[];
}
