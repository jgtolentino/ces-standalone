import { test, expect } from '@playwright/test';

const routes = ['/', '/trends', '/products', '/consumers', '/retailbot', '/ai-assist', '/vibe'];

for (const path of routes) {
  test(`route ${path} renders`, async ({ page }) => {
    const resp = await page.goto(path);
    expect(resp?.ok()).toBeTruthy();         // HTTP 2xx
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for any loading states to complete
    await page.waitForLoadState('networkidle');
    
    // Ensure the page has some content (not just a blank page)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(10);
  });
}
