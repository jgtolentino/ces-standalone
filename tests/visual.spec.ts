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

// D3 RAG Memory-specific visual tests  
const ragMemoryPages = [
  { route: "/", name: "overview-with-memory", triggerMemory: true },
  { route: "/trends", name: "trends-with-memory", triggerMemory: true },
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

// D3 RAG Memory visual regression tests
for (const p of ragMemoryPages) {
  test(`D3 visual – ${p.name}`, async ({ page }) => {
    await page.goto(`http://localhost:3100${p.route}`);
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Trigger memory panel if specified
    if (p.triggerMemory) {
      // Click the GenieBot memory button
      await page.click('button[title="Open Insight Memory Assistant"]');
      await page.waitForTimeout(2000); // Wait for memory panel to load
    }
    
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}