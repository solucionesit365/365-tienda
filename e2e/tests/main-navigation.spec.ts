import { test, expect } from '@playwright/test';

test.describe('Main Navigation', () => {
  test('should navigate to website', async ({ page }) => {
    // Navigate to the home page
    await page.goto('https://demo.365equipo.com/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for navigation to complete
    await page.waitForURL('**.365equipo.com/**');

    // Verify the URL contains 'consultarFichaje'
    expect(page.url()).toContain('https://demo.365equipo.com/');
  });
});
