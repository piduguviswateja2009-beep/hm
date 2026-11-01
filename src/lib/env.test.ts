import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";

describe("public environment configuration", () => {
  it("defaults the site URL for local development", () => {
    expect(parsePublicEnv({})).toMatchObject({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
  });

  it("rejects an invalid public site URL", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow();
  });
});
