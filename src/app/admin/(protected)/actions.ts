"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Json } from "@/../types/database.types";
import { requireStaff } from "@/lib/supabase/staff";

const slug=z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const idField=z.union([z.literal(""),z.string().uuid()]).optional().default("");
const asText=(value:FormDataEntryValue|null)=>typeof value==="string"?value:"";
const lines=(value:string,max:number)=>value.split(/\r?\n/).map((item)=>item.trim()).filter(Boolean).slice(0,max);
function parseJsonObject(value:string):Record<string,Json>|null {
  try { const parsed:unknown=JSON.parse(value||"{}"); if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)) return null; return parsed as Record<string,Json>; }
  catch { return null; }
}

export async function saveCategoryAction(form:FormData) {
  const staff=await requireStaff();
  const parsed=z.object({id:idField,slug,name:z.string().trim().min(2).max(120),description:z.string().trim().max(2000).default(""),sort_order:z.coerce.number().int().min(0).max(10000),is_active:z.boolean()}).safeParse({id:asText(form.get("id")),slug:asText(form.get("slug")),name:asText(form.get("name")),description:asText(form.get("description")),sort_order:asText(form.get("sort_order"))||"0",is_active:form.get("is_active")==="on"});
  if(!parsed.success) redirect("/admin/categories?error=invalid");
  const row={slug:parsed.data.slug,name:parsed.data.name,description:parsed.data.description||null,sort_order:parsed.data.sort_order,is_active:parsed.data.is_active};
  const result=parsed.data.id?await staff.supabase.from("categories").update(row).eq("id",parsed.data.id):await staff.supabase.from("categories").insert(row);
  if(result.error) redirect("/admin/categories?error=save");
  revalidatePath("/admin/categories"); revalidatePath("/products"); redirect("/admin/categories?saved=1");
}

export async function setCategoryActiveAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid(),active:z.enum(["true","false"])}).safeParse({id:asText(form.get("id")),active:asText(form.get("active"))});
  if(!parsed.success) redirect("/admin/categories?error=invalid");
  const {error}=await staff.supabase.from("categories").update({is_active:parsed.data.active==="true"}).eq("id",parsed.data.id);
  if(error) redirect("/admin/categories?error=save"); revalidatePath("/products"); redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid()}).safeParse({id:asText(form.get("id"))});
  if(!parsed.success) redirect("/admin/categories?error=invalid");
  const {error}=await staff.supabase.from("categories").update({deleted_at:new Date().toISOString(),is_active:false}).eq("id",parsed.data.id);
  if(error) redirect("/admin/categories?error=delete"); revalidatePath("/products"); redirect("/admin/categories?saved=1");
}

export async function saveProductAction(form:FormData) {
  const staff=await requireStaff();
  const parsed=z.object({id:idField,category_id:z.string().uuid(),slug,name:z.string().trim().min(2).max(160),short_description:z.string().trim().max(500).default(""),description:z.string().trim().max(10000).default(""),brand:z.string().trim().max(100).default(""),model:z.string().trim().max(100).default(""),features:z.string().max(5000).default(""),applications:z.string().max(5000).default(""),packaging_options:z.string().max(5000).default(""),specs:z.string().max(10000).default("{}"),is_active:z.boolean(),is_featured:z.boolean()}).safeParse({id:asText(form.get("id")),category_id:asText(form.get("category_id")),slug:asText(form.get("slug")),name:asText(form.get("name")),short_description:asText(form.get("short_description")),description:asText(form.get("description")),brand:asText(form.get("brand")),model:asText(form.get("model")),features:asText(form.get("features")),applications:asText(form.get("applications")),packaging_options:asText(form.get("packaging_options")),specs:asText(form.get("specs")),is_active:form.get("is_active")==="on",is_featured:form.get("is_featured")==="on"});
  if(!parsed.success||!parseJsonObject(parsed.success?parsed.data.specs:"")) redirect("/admin/products?error=invalid");
  const data=parsed.data; const row={category_id:data.category_id,slug:data.slug,name:data.name,short_description:data.short_description||null,description:data.description||null,brand:data.brand||null,model:data.model||null,features:lines(data.features,80),applications:lines(data.applications,80),packaging_options:lines(data.packaging_options,40),specs:parseJsonObject(data.specs) as Json,price_visible:false,price_inr:null,is_active:data.is_active,is_featured:data.is_featured};
  const result=data.id?await staff.supabase.from("products").update(row).eq("id",data.id):await staff.supabase.from("products").insert(row);
  if(result.error) redirect("/admin/products?error=save");
  revalidatePath("/admin/products"); revalidatePath("/products"); redirect("/admin/products?saved=1");
}

const productImagePath=(productId:string,path:string)=>path.startsWith(`products/${productId}/`)&&/^products\/[0-9a-f-]+\/[0-9a-f-]+\.(jpg|png|webp|avif)$/i.test(path);
const productDocumentPath=(productId:string,path:string)=>path.startsWith(`products/${productId}/`)&&/^products\/[0-9a-f-]+\/[0-9a-f-]+\.pdf$/i.test(path);

export async function registerProductImageAction(input:{productId:string;path:string;altText:string}) {
  const staff=await requireStaff(); const parsed=z.object({productId:z.string().uuid(),path:z.string().max(300),altText:z.string().trim().min(3).max(300)}).safeParse(input);
  if(!parsed.success||!productImagePath(parsed.data.productId,parsed.data.path)) return {ok:false,message:"Check the image and alt text, then try again."};
  const {data:current}=await staff.supabase.from("product_images").select("sort_order").eq("product_id",parsed.data.productId).order("sort_order",{ascending:false}).limit(1).maybeSingle();
  const {error}=await staff.supabase.from("product_images").insert({product_id:parsed.data.productId,storage_path:parsed.data.path,alt_text:parsed.data.altText,sort_order:(current?.sort_order??-1)+1});
  if(error) return {ok:false,message:"The image record could not be saved."};
  revalidatePath("/admin/products"); revalidatePath("/products"); return {ok:true};
}

export async function updateProductImageAction(input:{id:string;productId:string;altText:string;sortOrder:number}) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid(),productId:z.string().uuid(),altText:z.string().trim().min(3).max(300),sortOrder:z.number().int().min(0).max(10000)}).safeParse(input);
  if(!parsed.success) return {ok:false,message:"Check the image details."};
  const {error}=await staff.supabase.from("product_images").update({alt_text:parsed.data.altText,sort_order:parsed.data.sortOrder}).eq("id",parsed.data.id).eq("product_id",parsed.data.productId);
  if(error) return {ok:false,message:"The image details could not be saved."}; revalidatePath("/admin/products"); return {ok:true};
}

export async function deleteProductImageAction(input:{id:string;productId:string}) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid(),productId:z.string().uuid()}).safeParse(input);
  if(!parsed.success) return {ok:false,message:"The image could not be removed."};
  const {data:image}=await staff.supabase.from("product_images").select("storage_path").eq("id",parsed.data.id).eq("product_id",parsed.data.productId).maybeSingle();
  if(!image) return {ok:false,message:"The image could not be found."};
  const {error}=await staff.supabase.from("product_images").delete().eq("id",parsed.data.id).eq("product_id",parsed.data.productId);
  if(error) return {ok:false,message:"The image could not be removed."};
  await staff.supabase.storage.from("public-media").remove([image.storage_path]);
  revalidatePath("/admin/products"); revalidatePath("/products"); return {ok:true};
}

export async function registerProductDocumentAction(input:{productId:string;path:string;title:string;type:"datasheet"|"msds"|"brochure"|"certificate";isPublic:boolean}) {
  const staff=await requireStaff(); const parsed=z.object({productId:z.string().uuid(),path:z.string().max(300),title:z.string().trim().min(2).max(180),type:z.enum(["datasheet","msds","brochure","certificate"]),isPublic:z.boolean()}).safeParse(input);
  if(!parsed.success||!productDocumentPath(parsed.data.productId,parsed.data.path)) return {ok:false,message:"Check the PDF details and try again."};
  const {error}=await staff.supabase.from("product_documents").insert({product_id:parsed.data.productId,storage_path:parsed.data.path,title:parsed.data.title,type:parsed.data.type,is_public:parsed.data.isPublic});
  if(error) return {ok:false,message:"The document record could not be saved."}; revalidatePath("/admin/products"); revalidatePath("/products"); return {ok:true};
}

export async function deleteProductDocumentAction(input:{id:string;productId:string}) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid(),productId:z.string().uuid()}).safeParse(input);
  if(!parsed.success) return {ok:false,message:"The document could not be removed."};
  const {data:doc}=await staff.supabase.from("product_documents").select("storage_path").eq("id",parsed.data.id).eq("product_id",parsed.data.productId).maybeSingle();
  if(!doc) return {ok:false,message:"The document could not be found."};
  const {error}=await staff.supabase.from("product_documents").delete().eq("id",parsed.data.id).eq("product_id",parsed.data.productId);
  if(error) return {ok:false,message:"The document could not be removed."};
  await staff.supabase.storage.from("documents").remove([doc.storage_path]);
  revalidatePath("/admin/products"); revalidatePath("/products"); return {ok:true};
}

export async function setProductActiveAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid(),active:z.enum(["true","false"])}).safeParse({id:asText(form.get("id")),active:asText(form.get("active"))});
  if(!parsed.success) redirect("/admin/products?error=invalid");
  const {error}=await staff.supabase.from("products").update({is_active:parsed.data.active==="true"}).eq("id",parsed.data.id);
  if(error) redirect("/admin/products?error=save"); revalidatePath("/products"); redirect("/admin/products?saved=1");
}

export async function deleteProductAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid()}).safeParse({id:asText(form.get("id"))});
  if(!parsed.success) redirect("/admin/products?error=invalid");
  const {error}=await staff.supabase.from("products").update({deleted_at:new Date().toISOString(),is_active:false}).eq("id",parsed.data.id);
  if(error) redirect("/admin/products?error=delete"); revalidatePath("/products"); redirect("/admin/products?saved=1");
}

export async function updateEnquiryAction(form:FormData) {
  const staff=await requireStaff();
  const parsed=z.object({id:z.string().uuid(),status:z.enum(["new","contacted","quoted","won","lost"]),notes:z.string().trim().max(5000),assigned_to:z.union([z.literal(""),z.string().uuid()])}).safeParse({id:asText(form.get("id")),status:asText(form.get("status")),notes:asText(form.get("notes")),assigned_to:asText(form.get("assigned_to"))});
  if(!parsed.success) redirect("/admin/enquiries?error=invalid");
  const previous=await staff.supabase.from("enquiries").select("status").eq("id",parsed.data.id).maybeSingle();
  const {error}=await staff.supabase.from("enquiries").update({status:parsed.data.status,notes:parsed.data.notes||null,assigned_to:parsed.data.assigned_to||null}).eq("id",parsed.data.id);
  if(error) redirect("/admin/enquiries?error=save");
  if(previous.data?.status!==parsed.data.status){
    await staff.supabase.from("enquiry_events").insert({enquiry_id:parsed.data.id,actor_id:staff.userId,event:"status_changed",note:`Status changed to ${parsed.data.status}`});
  }
  revalidatePath("/admin"); revalidatePath("/admin/enquiries"); redirect("/admin/enquiries?saved=1");
}

export async function savePostAction(form:FormData) {
  const staff=await requireStaff();
  const parsed=z.object({id:idField,slug,title:z.string().trim().min(3).max(180),excerpt:z.string().trim().max(500).default(""),content:z.string().max(50000),status:z.enum(["draft","published"]),tags:z.string().max(1000).default("")}).safeParse({id:asText(form.get("id")),slug:asText(form.get("slug")),title:asText(form.get("title")),excerpt:asText(form.get("excerpt")),content:asText(form.get("content")),status:asText(form.get("status")),tags:asText(form.get("tags"))});
  if(!parsed.success) redirect("/admin/posts?error=invalid"); const data=parsed.data;
  const row={slug:data.slug,title:data.title,excerpt:data.excerpt||null,content:data.content,status:data.status,published_at:data.status==="published"?new Date().toISOString():null,tags:lines(data.tags,30)};
  const result=data.id?await staff.supabase.from("posts").update(row).eq("id",data.id):await staff.supabase.from("posts").insert(row);
  if(result.error) redirect("/admin/posts?error=save"); revalidatePath("/admin/posts"); redirect("/admin/posts?saved=1");
}

export async function saveFaqAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:idField,question:z.string().trim().min(5).max(500),answer:z.string().trim().min(5).max(5000),category:z.string().trim().max(120).default(""),sort_order:z.coerce.number().int().min(0).max(10000)}).safeParse({id:asText(form.get("id")),question:asText(form.get("question")),answer:asText(form.get("answer")),category:asText(form.get("category")),sort_order:asText(form.get("sort_order"))||"0"});
  if(!parsed.success) redirect("/admin/faqs?error=invalid"); const data=parsed.data; const row={question:data.question,answer:data.answer,category:data.category||null,sort_order:data.sort_order};
  const {error}=data.id?await staff.supabase.from("faqs").update(row).eq("id",data.id):await staff.supabase.from("faqs").insert({...row,is_active:false});
  if(error) redirect("/admin/faqs?error=save"); revalidatePath("/admin/faqs"); redirect("/admin/faqs?saved=1");
}

export async function setFaqActiveAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:z.string().uuid(),active:z.enum(["true","false"])}).safeParse({id:asText(form.get("id")),active:asText(form.get("active"))});
  if(!parsed.success) redirect("/admin/faqs?error=invalid"); const {error}=await staff.supabase.from("faqs").update({is_active:parsed.data.active==="true"}).eq("id",parsed.data.id);
  if(error) redirect("/admin/faqs?error=save"); revalidatePath("/admin/faqs"); redirect("/admin/faqs?saved=1");
}

export async function saveTestimonialAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:idField,name:z.string().trim().min(2).max(120),company:z.string().trim().max(160).default(""),location:z.string().trim().max(120).default(""),quote:z.string().trim().min(10).max(3000),source:z.string().trim().max(200).default(""),rating:z.union([z.literal(""),z.coerce.number().int().min(1).max(5)]).optional()}).safeParse({id:asText(form.get("id")),name:asText(form.get("name")),company:asText(form.get("company")),location:asText(form.get("location")),quote:asText(form.get("quote")),source:asText(form.get("source")),rating:asText(form.get("rating"))});
  if(!parsed.success) redirect("/admin/testimonials?error=invalid"); const d=parsed.data;
  const row={name:d.name,company:d.company||null,location:d.location||null,quote:d.quote,source:d.source||null,rating:d.rating===""||d.rating===undefined?null:d.rating};
  const {error}=d.id?await staff.supabase.from("testimonials").update(row).eq("id",d.id):await staff.supabase.from("testimonials").insert({...row,is_published:false});
  if(error) redirect("/admin/testimonials?error=save"); revalidatePath("/admin/testimonials"); redirect("/admin/testimonials?saved=1");
}

export async function saveClientAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({id:idField,name:z.string().trim().min(2).max(160),logo_url:z.union([z.literal(""),z.string().url().max(1000)]).default("")}).safeParse({id:asText(form.get("id")),name:asText(form.get("name")),logo_url:asText(form.get("logo_url"))});
  if(!parsed.success) redirect("/admin/clients?error=invalid"); const row={name:parsed.data.name,logo_url:parsed.data.logo_url||null};
  const {error}=parsed.data.id?await staff.supabase.from("clients").update(row).eq("id",parsed.data.id):await staff.supabase.from("clients").insert({...row,is_published:false});
  if(error) redirect("/admin/clients?error=save"); revalidatePath("/admin/clients"); redirect("/admin/clients?saved=1");
}

export async function updateSiteSettingAction(form:FormData) {
  const staff=await requireStaff(); const keySchema=z.string().trim().min(2).max(120).regex(/^[a-z0-9_.-]+$/);
  const key=keySchema.safeParse(asText(form.get("key"))); const value=parseJsonObject(asText(form.get("value")));
  if(!key.success||!value) redirect("/admin/settings?error=invalid");
  const {error}=await staff.supabase.from("site_settings").upsert({key:key.data,value,is_public:form.get("is_public")==="on"});
  if(error) redirect("/admin/settings?error=save"); revalidatePath("/admin/settings"); revalidatePath("/contact"); redirect("/admin/settings?saved=1");
}

export async function deleteSiteSettingAction(form:FormData) {
  const staff=await requireStaff(); const key=z.string().trim().min(2).max(120).regex(/^[a-z0-9_.-]+$/).safeParse(asText(form.get("key")));
  if(!key.success) redirect("/admin/settings?error=invalid"); const {error}=await staff.supabase.from("site_settings").delete().eq("key",key.data);
  if(error) redirect("/admin/settings?error=delete"); revalidatePath("/admin/settings"); redirect("/admin/settings?saved=1");
}

export async function setPublishedAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({table:z.enum(["testimonials","clients"]),id:z.string().uuid(),published:z.enum(["true","false"])}).safeParse({table:asText(form.get("table")),id:asText(form.get("id")),published:asText(form.get("published"))});
  if(!parsed.success) redirect("/admin?error=invalid");
  const result=parsed.data.table==="clients"?await staff.supabase.from("clients").update({is_published:parsed.data.published==="true"}).eq("id",parsed.data.id):await staff.supabase.from("testimonials").update({is_published:parsed.data.published==="true"}).eq("id",parsed.data.id);
  if(result.error) redirect(`/admin/${parsed.data.table}?error=save`); revalidatePath(`/admin/${parsed.data.table}`); redirect(`/admin/${parsed.data.table}?saved=1`);
}

export async function archiveContentAction(form:FormData) {
  const staff=await requireStaff(); const parsed=z.object({table:z.enum(["posts","faqs","testimonials","clients"]),id:z.string().uuid()}).safeParse({table:asText(form.get("table")),id:asText(form.get("id"))});
  if(!parsed.success) redirect("/admin?error=invalid");
  const result=parsed.data.table==="posts"?await staff.supabase.from("posts").update({deleted_at:new Date().toISOString(),status:"draft"}).eq("id",parsed.data.id):parsed.data.table==="faqs"?await staff.supabase.from("faqs").update({deleted_at:new Date().toISOString(),is_active:false}).eq("id",parsed.data.id):parsed.data.table==="clients"?await staff.supabase.from("clients").update({deleted_at:new Date().toISOString(),is_published:false}).eq("id",parsed.data.id):await staff.supabase.from("testimonials").update({deleted_at:new Date().toISOString(),is_published:false}).eq("id",parsed.data.id);
  if(result.error) redirect(`/admin/${parsed.data.table}?error=delete`); revalidatePath(`/admin/${parsed.data.table}`); redirect(`/admin/${parsed.data.table}?saved=1`);
}
