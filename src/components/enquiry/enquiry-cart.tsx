"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type EnquiryCartItem = { productId: string; slug: string; name: string; quantity: number };
type CartContextValue = { items: EnquiryCartItem[]; hydrated: boolean; add: (item: Omit<EnquiryCartItem,"quantity">) => void; remove: (id: string) => void; setQuantity: (id: string, quantity: number) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hm-aqua-enquiry-cart-v1";

export function EnquiryCartProvider({ children }: { children: React.ReactNode }) {
  const [items,setItems] = useState<EnquiryCartItem[]>([]);
  const [hydrated,setHydrated] = useState(false);
  useEffect(()=>{
    const timer = window.setTimeout(()=>{
      try { const value = localStorage.getItem(STORAGE_KEY); if(value){ const parsed: unknown = JSON.parse(value); if(Array.isArray(parsed)) setItems(parsed.filter((x): x is EnquiryCartItem => x && typeof x.productId === "string" && typeof x.slug === "string" && typeof x.name === "string" && Number.isInteger(x.quantity) && x.quantity >= 1 && x.quantity <= 100000)); } }
      catch { localStorage.removeItem(STORAGE_KEY); }
      setHydrated(true);
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);
  useEffect(()=>{ if(hydrated) localStorage.setItem(STORAGE_KEY,JSON.stringify(items)); },[items,hydrated]);
  const add = useCallback((item: Omit<EnquiryCartItem,"quantity">)=>setItems((current)=>current.some((x)=>x.productId===item.productId)?current:[...current,{...item,quantity:1}]),[]);
  const remove = useCallback((id:string)=>setItems((current)=>current.filter((item)=>item.productId!==id)),[]);
  const setQuantity = useCallback((id:string,quantity:number)=>setItems((current)=>current.map((item)=>item.productId===id?{...item,quantity}:item)),[]);
  const clear = useCallback(()=>setItems([]),[]);
  const value = useMemo(()=>({items,hydrated,add,remove,setQuantity,clear}),[items,hydrated,add,remove,setQuantity,clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useEnquiryCart() {
  const value = useContext(CartContext);
  if(!value) throw new Error("useEnquiryCart must be used inside EnquiryCartProvider");
  return value;
}

export function EnquiryAddButton({ product }: { product: Omit<EnquiryCartItem,"quantity"> }) {
  const {items,add} = useEnquiryCart(); const added = items.some((item)=>item.productId===product.productId);
  return <button type="button" onClick={()=>add(product)} aria-pressed={added} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-navy transition hover:border-aqua hover:bg-aqua-light">{added?"Added to enquiry list":"Add to enquiry list"}</button>;
}

export function EnquiryCartCount() {
  const {items,hydrated} = useEnquiryCart();
  return <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-aqua px-1.5 py-0.5 text-[11px] font-bold text-navy">{hydrated?items.length:0}</span>;
}
