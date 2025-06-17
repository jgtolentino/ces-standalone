import { test, expect } from "@playwright/test";

const pages = [
  { route: "/", name: "overview" },
  { route: "/trends", name: "trends" },
  { route: "/products", name: "product-mix" },
  { route: "/consumers", name: "consumers" },
  { route: "/ces", name: "ces-chat" },
];

for (const p of pages) {
  test(`visual – ${p.name}`, async ({ page }) => {
    await page.goto(`http://localhost:3100${p.route}`);
    // wait for charts to settle
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}