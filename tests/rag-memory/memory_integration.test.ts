import { test, expect } from '@playwright/test';

test.describe('RAG Memory Integration', () => {
  test('GenieBot memory panel opens and displays interface', async ({ page }) => {
    await page.goto('/');
    
    // Check for GenieBot memory button
    await expect(page.locator('button[title="Open Insight Memory Assistant"]')).toBeVisible();
    
    // Click to open memory panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    
    // Verify memory panel is visible
    await expect(page.locator('text=GenieBot Memory')).toBeVisible();
    
    // Check for search functionality
    await expect(page.locator('input[placeholder="Search campaign insights..."]')).toBeVisible();
    
    // Verify search button is present
    await expect(page.locator('button:has-text("🔍")')).toBeVisible();
  });

  test('Memory panel shows contextual information', async ({ page }) => {
    await page.goto('/trends');
    
    // Open memory panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    
    // Wait for panel to load
    await page.waitForSelector('text=GenieBot Memory', { timeout: 5000 });
    
    // Check for context section
    await expect(page.locator('text=Current Context:')).toBeVisible();
    
    // Verify context shows trends page
    await expect(page.locator('text=trends')).toBeVisible();
  });

  test('Search functionality works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Open memory panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    
    // Wait for panel to load
    await page.waitForTimeout(2000);
    
    // Enter search query
    await page.fill('input[placeholder="Search campaign insights..."]', 'facebook targeting');
    
    // Click search button
    await page.click('button:has-text("🔍")');
    
    // Wait for search results
    await page.waitForTimeout(3000);
    
    // Check if results are displayed (either insights or empty state)
    const hasResults = await page.locator('text=Historical Insights').isVisible();
    const hasEmptyState = await page.locator('text=No Insights Found').isVisible();
    
    expect(hasResults || hasEmptyState).toBeTruthy();
  });

  test('Memory panel closes properly', async ({ page }) => {
    await page.goto('/');
    
    // Open memory panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    
    // Verify panel is open
    await expect(page.locator('text=GenieBot Memory')).toBeVisible();
    
    // Close panel using X button
    await page.click('button:has-text("✕")');
    
    // Verify panel is closed and button is visible again
    await expect(page.locator('button[title="Open Insight Memory Assistant"]')).toBeVisible();
    await expect(page.locator('text=GenieBot Memory')).not.toBeVisible();
  });

  test('Contextual loading works on different pages', async ({ page }) => {
    // Test on overview page
    await page.goto('/');
    await page.click('button[title="Open Insight Memory Assistant"]');
    await page.waitForSelector('text=GenieBot Memory');
    
    // Check for contextual button
    await expect(page.locator('button:has-text("Load Contextual Insights")')).toBeVisible();
    
    // Close panel
    await page.click('button:has-text("✕")');
    
    // Navigate to trends page
    await page.goto('/trends');
    await page.click('button[title="Open Insight Memory Assistant"]');
    await page.waitForSelector('text=GenieBot Memory');
    
    // Context should show trends
    await expect(page.locator('text=trends')).toBeVisible();
  });

  test('API endpoint is accessible', async ({ page }) => {
    // Test the insights API endpoint
    const response = await page.request.get('/api/insights/search?meta=true');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.endpoint).toBe('/api/insights/search');
    expect(data.methods).toContain('GET');
    expect(data.methods).toContain('POST');
  });

  test('Memory panel handles loading states', async ({ page }) => {
    await page.goto('/');
    
    // Open memory panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    await page.waitForSelector('text=GenieBot Memory');
    
    // Trigger search to see loading state
    await page.fill('input[placeholder="Search campaign insights..."]', 'performance optimization');
    await page.click('button:has-text("🔍")');
    
    // Check for loading indicator (may be brief)
    const loadingVisible = await page.locator('text=Searching insights...').isVisible();
    
    // Wait for results or empty state
    await page.waitForTimeout(3000);
    
    // Should show either results or empty state, not loading
    await expect(page.locator('text=Searching insights...')).not.toBeVisible();
  });

  test('Recommendations section appears when available', async ({ page }) => {
    await page.goto('/trends');
    
    // Open memory panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    await page.waitForSelector('text=GenieBot Memory');
    
    // Click contextual insights button
    const contextButton = page.locator('button:has-text("Load Contextual Insights")');
    if (await contextButton.isVisible()) {
      await contextButton.click();
      await page.waitForTimeout(3000);
      
      // Check if recommendations appeared
      const hasRecommendations = await page.locator('text=AI Recommendations').isVisible();
      const hasInsights = await page.locator('text=Historical Insights').isVisible();
      
      // Should have either recommendations or insights
      expect(hasRecommendations || hasInsights).toBeTruthy();
    }
  });

  test('Memory panel is responsive on different screen sizes', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Memory button should still be visible
    await expect(page.locator('button[title="Open Insight Memory Assistant"]')).toBeVisible();
    
    // Open panel
    await page.click('button[title="Open Insight Memory Assistant"]');
    
    // Panel should be visible and usable
    await expect(page.locator('text=GenieBot Memory')).toBeVisible();
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Panel should still work
    await expect(page.locator('text=GenieBot Memory')).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1366, height: 768 });
  });
});