import { test, expect } from '@playwright/test';

test.describe('Forecast View', () => {
  test('Forecast panel renders and displays controls', async ({ page }) => {
    await page.goto('/trends');
    
    // Wait for forecast panel to load
    await expect(page.locator('#forecast-panel')).toBeVisible();
    
    // Check for main heading
    await expect(page.locator('text=🔮 Predictive Analytics')).toBeVisible();
    
    // Verify metric selection buttons are present
    await expect(page.locator('text=Revenue')).toBeVisible();
    await expect(page.locator('text=ROI')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
    await expect(page.locator('text=AOV')).toBeVisible();
    
    // Verify period selection buttons are present
    await expect(page.locator('text=30 Days')).toBeVisible();
    await expect(page.locator('text=60 Days')).toBeVisible();
    await expect(page.locator('text=90 Days')).toBeVisible();
  });

  test('Forecast chart loads with data', async ({ page }) => {
    await page.goto('/trends');
    
    // Wait for forecast panel and chart to load
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    await page.waitForSelector('.forecast-chart-container', { timeout: 15000 });
    
    // Check if chart canvas is present (Chart.js creates canvas elements)
    await expect(page.locator('.forecast-chart-container canvas')).toBeVisible();
  });

  test('Metric selection changes forecast', async ({ page }) => {
    await page.goto('/trends');
    
    // Wait for forecast panel to load
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    
    // Click on ROI metric
    await page.click('text=ROI');
    
    // Wait for chart to update
    await page.waitForTimeout(2000);
    
    // Verify the button is selected (has blue background)
    const roiButton = page.locator('button:has-text("ROI")');
    await expect(roiButton).toHaveClass(/bg-blue-500/);
  });

  test('Period selection updates forecast timeframe', async ({ page }) => {
    await page.goto('/trends');
    
    // Wait for forecast panel to load
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    
    // Click on 90 Days period
    await page.click('text=90 Days');
    
    // Wait for forecast to update
    await page.waitForTimeout(2000);
    
    // Verify the button is selected
    const periodButton = page.locator('button:has-text("90 Days")');
    await expect(periodButton).toHaveClass(/bg-blue-500/);
  });

  test('Summary cards display forecast insights', async ({ page }) => {
    await page.goto('/trends');
    
    // Wait for forecast panel to load
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    
    // Wait for forecast data to load and summary cards to appear
    await page.waitForTimeout(3000);
    
    // Check if summary cards are present
    await expect(page.locator('text=Predicted Change')).toBeVisible();
    await expect(page.locator('text=Confidence Level')).toBeVisible();
    await expect(page.locator('text=Forecast Period')).toBeVisible();
  });

  test('Insights and risk factors are displayed', async ({ page }) => {
    await page.goto('/trends');
    
    // Wait for forecast panel to load
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    
    // Wait for forecast analysis to complete
    await page.waitForTimeout(3000);
    
    // Check for insights section
    await expect(page.locator('text=Key Insights')).toBeVisible();
    
    // Check for risk factors section
    await expect(page.locator('text=Risk Factors')).toBeVisible();
  });

  test('Error handling displays appropriate message', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/trends');
    
    // Wait for forecast panel to load
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    
    // Wait for error state to appear
    await page.waitForTimeout(3000);
    
    // Check if error message is displayed
    await expect(page.locator('text=Forecast Error')).toBeVisible();
  });

  test('Loading state displays during forecast generation', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    await page.goto('/trends');
    
    // Wait for forecast panel to appear
    await page.waitForSelector('#forecast-panel', { timeout: 10000 });
    
    // Check for loading indicator
    await expect(page.locator('text=Generating forecast...')).toBeVisible({ timeout: 3000 });
  });
});