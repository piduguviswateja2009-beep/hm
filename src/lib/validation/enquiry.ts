import { z } from "zod";

const cleanText = (max: number) => z.string().trim().max(max).transform((value)=>value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,""));

export const enquiryInputSchema = z.object({
  type: z.enum(["contact","quote"]),
  name: cleanText(120).pipe(z.string().min(2,"Enter your name.")),
  company: cleanText(120).optional().default(""),
  email: z.union([z.literal(""),z.string().trim().email("Enter a valid email address.").max(254)]).optional().default(""),
  phone: cleanText(32).optional().default(""),
  city: cleanText(100).optional().default(""),
  message: cleanText(4000).pipe(z.string().min(10,"Please add a little more detail (at least 10 characters).")),
  sourcePage: z.string().trim().max(200).regex(/^\/[a-zA-Z0-9/_?=&%.-]*$/,"Invalid source page.").optional().default("/contact"),
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(4096).optional().default(""),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100000),
    unit: cleanText(32).optional().default(""),
    note: cleanText(500).optional().default(""),
  })).max(50).optional().default([]),
  utm: z.object({
    source: cleanText(120).optional().default(""),
    medium: cleanText(120).optional().default(""),
    campaign: cleanText(120).optional().default(""),
    term: cleanText(120).optional().default(""),
    content: cleanText(120).optional().default(""),
  }).optional().default({ source:"",medium:"",campaign:"",term:"",content:"" }),
}).superRefine((value,context)=>{
  if(!value.email && !value.phone) context.addIssue({code:"custom",path:["phone"],message:"Add an email address or phone number so the team can reply."});
});

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;
