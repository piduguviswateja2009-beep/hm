"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/browser-auth";
import { deleteProductDocumentAction, deleteProductImageAction, registerProductDocumentAction, registerProductImageAction, updateProductImageAction } from "@/app/admin/(protected)/actions";

type ProductImage={id:string;storage_path:string;alt_text:string;sort_order:number;public_url:string};
type ProductDocument={id:string;storage_path:string;title:string;type:string;is_public:boolean};

function validImage(file:File,bytes:Uint8Array) {
  if(file.size>5*1024*1024) return false;
  const type=file.type.toLowerCase();
  if(type==="image/jpeg") return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  if(type==="image/png") return bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47;
  if(type==="image/webp") return String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
  if(type==="image/avif") return String.fromCharCode(...bytes.slice(4,8))==="ftyp"&&String.fromCharCode(...bytes.slice(8,12))==="avif";
  return false;
}

export function ProductAssets({productId,images,documents}:{productId:string;images:ProductImage[];documents:ProductDocument[]}) {
  const router=useRouter();const [altText,setAltText]=useState("");const [docTitle,setDocTitle]=useState("");const [docType,setDocType]=useState<"datasheet"|"msds"|"brochure"|"certificate">("datasheet");const [isPublic,setIsPublic]=useState(false);const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);const [sort,setSort]=useState<Record<string,number>>({});

  async function uploadImage(file?:File) {
    if(!file)return;setNotice("");
    if(altText.trim().length<3){setNotice("Add meaningful alt text before uploading.");return;}
    const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
    if(!validImage(file,bytes)){setNotice("Choose a valid JPEG, PNG, WEBP or AVIF image up to 5 MB.");return;}
    setBusy(true);
    try{
      const extension=file.type==="image/jpeg"?"jpg":file.type.split("/")[1];const path=`products/${productId}/${crypto.randomUUID()}.${extension}`;const client=createSupabaseBrowserAuthClient();
      const uploaded=await client.storage.from("public-media").upload(path,file,{contentType:file.type,upsert:false});
      if(uploaded.error){setNotice("Upload failed. Check staff access and try again.");return;}
      const saved=await registerProductImageAction({productId,path,altText:altText.trim()});
      if(!saved.ok){await client.storage.from("public-media").remove([path]);setNotice(saved.message??"The image record could not be saved.");return;}
      setAltText("");setNotice("Image uploaded.");router.refresh();
    }catch{setNotice("Upload failed. Check your connection and try again.");}
    finally{setBusy(false);}
  }

  async function uploadDocument(file?:File) {
    if(!file)return;setNotice("");
    if(docTitle.trim().length<2){setNotice("Enter a document title before uploading.");return;}
    if(file.size>10*1024*1024||file.type!=="application/pdf"||!(String.fromCharCode(...new Uint8Array(await file.slice(0,5).arrayBuffer()))==="%PDF-")){setNotice("Choose a valid PDF file up to 10 MB.");return;}
    setBusy(true);
    try{
      const path=`products/${productId}/${crypto.randomUUID()}.pdf`;const client=createSupabaseBrowserAuthClient();
      const uploaded=await client.storage.from("documents").upload(path,file,{contentType:"application/pdf",upsert:false});
      if(uploaded.error){setNotice("Upload failed. Check staff access and try again.");return;}
      const saved=await registerProductDocumentAction({productId,path,title:docTitle.trim(),type:docType,isPublic});
      if(!saved.ok){await client.storage.from("documents").remove([path]);setNotice(saved.message??"The document record could not be saved.");return;}
      setDocTitle("");setNotice("Document uploaded.");router.refresh();
    }catch{setNotice("Upload failed. Check your connection and try again.");}
    finally{setBusy(false);}
  }

  async function signedUrl(path:string) {
    try{const client=createSupabaseBrowserAuthClient();const {data,error}=await client.storage.from("documents").createSignedUrl(path,120);if(error||!data?.signedUrl){setNotice("Could not open that document.");return;}window.open(data.signedUrl,"_blank","noopener,noreferrer");}
    catch{setNotice("Could not open that document.");}
  }

  return <section className="mt-5 rounded-2xl border border-line bg-surface p-5"><h3 className="font-semibold text-navy">Images & documents</h3><div className="mt-4 grid gap-5 lg:grid-cols-2"><div><h4 className="text-sm font-semibold text-navy">Product images</h4><label className="mt-3 block text-xs font-medium text-muted">Alt text<input value={altText} onChange={(e)=>setAltText(e.target.value)} maxLength={300} className="mt-1 min-h-10 w-full rounded-lg border border-line bg-white px-3 text-sm"/></label><label className="mt-3 block text-xs font-medium text-muted">Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={(e)=>{void uploadImage(e.target.files?.[0]);e.currentTarget.value="";}} className="mt-1 block w-full text-sm"/><span className="mt-1 block">JPEG, PNG, WEBP or AVIF · up to 5 MB</span></label><ul className="mt-4 space-y-3">{images.map((image)=><li key={image.id} className="flex items-center gap-3 rounded-xl bg-white p-3"><Image src={image.public_url} alt={image.alt_text} width={76} height={64} unoptimized className="h-16 w-20 rounded-md object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-navy">{image.alt_text}</p><label className="mt-1 flex items-center gap-2 text-[11px] text-muted">Order<input type="number" min={0} value={sort[image.id]??image.sort_order} onChange={(e)=>setSort((current)=>({...current,[image.id]:Number(e.target.value)}))} className="w-16 rounded border border-line px-2 py-1 text-navy"/><button type="button" onClick={async()=>{const result=await updateProductImageAction({id:image.id,productId,altText:image.alt_text,sortOrder:sort[image.id]??image.sort_order});setNotice(result.ok?"Image order saved.":result.message??"Could not update image.");router.refresh();}} className="font-semibold text-aqua">Save</button></label></div><button type="button" onClick={async()=>{if(!window.confirm("Remove this product image?"))return;const result=await deleteProductImageAction({id:image.id,productId});setNotice(result.ok?"Image removed.":result.message??"Could not remove image.");router.refresh();}} className="text-xs font-semibold text-red-700">Remove</button></li>)}{!images.length&&<li className="text-xs text-muted">No images uploaded.</li>}</ul></div><div><h4 className="text-sm font-semibold text-navy">Product documents</h4><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-muted">Title<input value={docTitle} onChange={(e)=>setDocTitle(e.target.value)} maxLength={180} className="mt-1 min-h-10 w-full rounded-lg border border-line bg-white px-3 text-sm"/></label><label className="text-xs font-medium text-muted">Type<select value={docType} onChange={(e)=>setDocType(e.target.value as typeof docType)} className="mt-1 min-h-10 w-full rounded-lg border border-line bg-white px-3 text-sm"><option value="datasheet">Datasheet</option><option value="msds">MSDS</option><option value="brochure">Brochure</option><option value="certificate">Certificate</option></select></label></div><label className="mt-3 flex items-center gap-2 text-xs font-medium text-navy"><input type="checkbox" checked={isPublic} onChange={(e)=>setIsPublic(e.target.checked)}/> Public download (visible to visitors when product is active)</label><label className="mt-3 block text-xs font-medium text-muted">Upload PDF<input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e)=>{void uploadDocument(e.target.files?.[0]);e.currentTarget.value="";}} className="mt-1 block w-full text-sm"/><span className="mt-1 block">PDF only · up to 10 MB</span></label><ul className="mt-4 space-y-2">{documents.map((doc)=><li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"><div><p className="text-sm font-medium text-navy">{doc.title}</p><p className="text-xs text-muted">{doc.type} · {doc.is_public?"Public":"Private"}</p></div><div className="flex gap-3"><button type="button" onClick={()=>void signedUrl(doc.storage_path)} className="text-xs font-semibold text-aqua">Open</button><button type="button" onClick={async()=>{if(!window.confirm("Remove this document?"))return;const result=await deleteProductDocumentAction({id:doc.id,productId});setNotice(result.ok?"Document removed.":result.message??"Could not remove document.");router.refresh();}} className="text-xs font-semibold text-red-700">Remove</button></div></li>)}{!documents.length&&<li className="text-xs text-muted">No documents uploaded.</li>}</ul></div></div>{notice&&<p role="status" className="mt-4 text-sm text-navy">{notice}</p>}{busy&&<p className="mt-2 text-xs text-muted" aria-live="polite">Uploading…</p>}</section>;
}
