import { z } from "zod";

export const newsletterSchema=z.object({email:z.string().trim().toLowerCase().email().max(254),website:z.string().max(200).optional().default(""),turnstileToken:z.string().max(4096).optional().default("")});
export const newsletterTokenSchema=z.string().min(32).max(128).regex(/^[A-Za-z0-9_-]+$/);
export type NewsletterInput=z.infer<typeof newsletterSchema>;
