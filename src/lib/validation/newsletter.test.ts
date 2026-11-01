import { describe, expect, it } from "vitest";
import { newsletterSchema, newsletterTokenSchema } from "./newsletter";

describe("newsletter inputs",()=>{
  it("normalizes the address for its unique subscriber record",()=>{
    expect(newsletterSchema.parse({email:"  PERSON@EXAMPLE.COM  "}).email).toBe("person@example.com");
  });
  it("accepts only bounded base64url tokens",()=>{
    expect(newsletterTokenSchema.safeParse("a".repeat(43)).success).toBe(true);
    expect(newsletterTokenSchema.safeParse("short").success).toBe(false);
    expect(newsletterTokenSchema.safeParse("x".repeat(32)+"/").success).toBe(false);
  });
});
