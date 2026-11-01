import { expect, test } from "@playwright/test";

test("visitor can search the catalog", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Water treatment products" })).toBeVisible();
  await page.getByRole("textbox", { name: "Search products" }).fill("membrane");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/products\?q=membrane/);
  await expect(page.getByRole("textbox", { name: "Search products" })).toHaveValue("membrane");
  await expect(page.getByText("Product listings are being verified")).toBeVisible();
});

test("visitor can submit a quote enquiry and see confirmation", async ({ page }) => {
  await page.route("**/api/enquiries", async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/contact");
  await page.getByLabel("Name *").fill("Test Visitor");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("visitor@example.com");
  await page.getByLabel("How can we help? *").fill("Please share information about water treatment components.");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByRole("status")).toContainText("Thanks — your enquiry was received.");
});

test("admin login remains invite-only", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByText("Public account registration is not available.")).toBeVisible();
  await expect(page.getByRole("link", { name: /sign up|register/i })).toHaveCount(0);
});

test("key SEO and security endpoints are present", async ({ page, request }) => {
  const response = await request.get("/contact");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");

  await page.goto("/contact");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://127.0.0.1:3100/contact");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Disallow: /admin");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("/products");
});

test("mobile navigation is available at a narrow viewport", async ({ page }) => {
  await page.goto("/");
  for (const width of [360, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden();
  await page.locator('summary[aria-label="Open navigation menu"]').click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
});
