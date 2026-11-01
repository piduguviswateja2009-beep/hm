import type { Metadata } from "next";
import { requireStaff } from "@/lib/supabase/staff";
import { deleteProductAction, saveProductAction, setProductActiveAction } from "@/app/admin/(protected)/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ProductAssets } from "@/components/admin/product-assets";
import { getPublicSupabase } from "@/lib/supabase/public";

export const metadata:Metadata={title:"Manage products"};
const input="mt-1 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm";
const area="mt-1 w-full rounded-lg border border-line bg-white p-3 text-sm";

function ProductFields({product,categories}:{product?:{id:string;category_id:string;slug:string;name:string;short_description:string|null;description:string|null;brand:string|null;model:string|null;features:unknown;applications:unknown;packaging_options:unknown;specs:unknown;is_active:boolean;is_featured:boolean};categories:{id:string;name:string}[]}) {
  const lineText=(value:unknown)=>Array.isArray(value)?value.filter((item)=>typeof item==="string").join("\n"):"";
  return <>
    {product&&<input type="hidden" name="id" value={product.id}/>}
    <label className="text-sm font-medium text-navy">Name<input name="name" defaultValue={product?.name??""} required maxLength={160} className={input}/></label>
    <label className="text-sm font-medium text-navy">Slug<input name="slug" defaultValue={product?.slug??""} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} className={input}/></label>
    <label className="text-sm font-medium text-navy">Category<select name="category_id" defaultValue={product?.category_id??""} required className={input}><option value="" disabled>Select category</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-navy">Brand<input name="brand" defaultValue={product?.brand??""} maxLength={100} className={input}/></label><label className="text-sm font-medium text-navy">Model<input name="model" defaultValue={product?.model??""} maxLength={100} className={input}/></label></div>
    <label className="text-sm font-medium text-navy">Short description<input name="short_description" defaultValue={product?.short_description??""} maxLength={500} className={input}/></label>
    <label className="text-sm font-medium text-navy">Full description<textarea name="description" defaultValue={product?.description??""} maxLength={10000} rows={4} className={area}/></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-navy">Features <span className="font-normal text-muted">(one per line)</span><textarea name="features" defaultValue={lineText(product?.features)} rows={5} maxLength={5000} className={area}/></label><label className="text-sm font-medium text-navy">Applications <span className="font-normal text-muted">(one per line)</span><textarea name="applications" defaultValue={lineText(product?.applications)} rows={5} maxLength={5000} className={area}/></label><label className="text-sm font-medium text-navy">Packaging options <span className="font-normal text-muted">(one per line)</span><textarea name="packaging_options" defaultValue={lineText(product?.packaging_options)} rows={4} maxLength={5000} className={area}/></label><label className="text-sm font-medium text-navy">Specifications <span className="font-normal text-muted">(JSON object)</span><textarea name="specs" defaultValue={JSON.stringify(product?.specs??{},null,2)} rows={4} maxLength={10000} className={`${area} font-mono text-xs`}/></label></div>
    <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm font-medium text-navy"><input name="is_active" type="checkbox" defaultChecked={product?.is_active??false}/> Active on public catalog</label><label className="flex items-center gap-2 text-sm font-medium text-navy"><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured??false}/> Featured</label></div>
  </>;
}

export default async function AdminProductsPage({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}) {
  const staff=await requireStaff(); const params=await searchParams;
  const [{data:categories},{data:products}]=await Promise.all([
    staff.supabase.from("categories").select("id,name").is("deleted_at",null).order("sort_order"),
    staff.supabase.from("products").select("*").is("deleted_at",null).order("name"),
  ]);
  const productIds=(products??[]).map((product)=>product.id);
  const [imageResult,documentResult]=productIds.length?await Promise.all([
    staff.supabase.from("product_images").select("id,product_id,storage_path,alt_text,sort_order").in("product_id",productIds).order("sort_order"),
    staff.supabase.from("product_documents").select("id,product_id,storage_path,title,type,is_public").in("product_id",productIds).order("title"),
  ]):[{data:[]},{data:[]}];
  const publicClient=getPublicSupabase();
  return <><div><h2 className="text-2xl font-semibold text-navy">Products</h2><p className="mt-2 text-sm text-muted">Manage catalog descriptions, specifications and publication status. Prices remain hidden by default.</p></div>{params.saved&&<p role="status" className="mt-4 rounded-xl bg-aqua-light p-3 text-sm text-navy">Changes saved.</p>}{params.error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">Could not save that product. Check the category, slug and specifications JSON.</p>}<details open className="mt-6 rounded-2xl border border-line bg-white p-6"><summary className="cursor-pointer font-semibold text-navy">Add a product</summary><form action={saveProductAction} className="mt-5 grid gap-4">{categories?.length?<ProductFields categories={categories}/>:<p className="text-sm text-muted">Create a category first.</p>}<button disabled={!categories?.length} className="w-fit rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Create product</button></form></details><div className="mt-6 space-y-4">{(products??[]).map((product)=><details key={product.id} className="rounded-2xl border border-line bg-white p-5"><summary className="cursor-pointer font-semibold text-navy">{product.name}<span className="ml-2 text-xs font-normal text-muted">{product.is_active?"Active":"Inactive"}</span></summary><form action={saveProductAction} className="mt-5 grid gap-4"><ProductFields product={product} categories={categories??[]}/><button className="w-fit rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Save product</button></form><div className="mt-4 flex flex-wrap gap-4"><form action={setProductActiveAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="active" value={product.is_active?"false":"true"}/><button className="text-sm font-semibold text-aqua">{product.is_active?"Unpublish":"Publish"}</button></form><form action={deleteProductAction}><input type="hidden" name="id" value={product.id}/><ConfirmButton message={`Archive “${product.name}”? It will be hidden from the public catalog.`} className="text-sm font-semibold text-red-700">Archive</ConfirmButton></form></div><ProductAssets productId={product.id} images={(imageResult.data??[]).filter((image)=>image.product_id===product.id).map((image)=>({id:image.id,storage_path:image.storage_path,alt_text:image.alt_text,sort_order:image.sort_order,public_url:publicClient?.storage.from("public-media").getPublicUrl(image.storage_path).data.publicUrl??""}))} documents={(documentResult.data??[]).filter((document)=>document.product_id===product.id).map((document)=>({id:document.id,storage_path:document.storage_path,title:document.title,type:document.type,is_public:document.is_public}))}/></details>)}{!products?.length&&<p className="rounded-xl border border-dashed border-line p-8 text-sm text-muted">No products yet.</p>}</div></>;
}
