import { test, expect } from "@playwright/test";

const pages = [
  { route: "/", name: "overview" },
  { route: "/trends", name: "trends" },
  { route: "/products", name: "product-mix" },
  { route: "/consumers", name: "consumers" },
  { route: "/ces", name: "ces-chat" },
];

// D2 Forecast-specific visual tests
const forecastPages = [
  { route: "/trends", name: "trends-forecast", waitFor: "#forecast-panel" },
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

// D2 Forecast visual regression tests
for (const p of forecastPages) {
  test(`D2 visual – ${p.name}`, async ({ page }) => {
    await page.goto(`http://localhost:3100${p.route}`);
    
    // Wait for forecast panel to load
    if (p.waitFor) {
      await page.waitForSelector(p.waitFor, { timeout: 10000 });
      await page.waitForTimeout(2000); // Wait for forecast data to load
    }
    
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}