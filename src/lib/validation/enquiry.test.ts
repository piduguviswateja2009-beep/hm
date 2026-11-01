import { describe, expect, it } from "vitest";
import { enquiryInputSchema } from "./enquiry";

const base = {type:"quote" as const,name:"Asha Patel",company:"",email:"asha@example.com",phone:"",city:"",message:"Please advise on water treatment for our project.",sourcePage:"/quote",items:[]};

describe("enquiry input validation",()=>{
  it("accepts a valid quote enquiry with one reply channel",()=>{
    expect(enquiryInputSchema.safeParse(base).success).toBe(true);
  });

  it("requires a valid way for the team to reply",()=>{
    const result=enquiryInputSchema.safeParse({...base,email:"",phone:""});
    expect(result.success).toBe(false);
    if(!result.success) expect(result.error.issues.some((issue)=>issue.path[0]==="phone")).toBe(true);
  });

  it("rejects invalid email and malformed product IDs",()=>{
    expect(enquiryInputSchema.safeParse({...base,email:"not-an-email"}).success).toBe(false);
    expect(enquiryInputSchema.safeParse({...base,items:[{productId:"bad-id",quantity:1}]}).success).toBe(false);
  });

  it("strips control bytes from free text",()=>{
    const parsed=enquiryInputSchema.parse({...base,message:"Please review\u0000 this requirement carefully."});
    expect(parsed.message).not.toContain("\u0000");
  });
});
