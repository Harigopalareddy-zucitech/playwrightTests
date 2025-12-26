import { test } from 'playwright/test';

test('sample test', async ({ page }) => {
    await page.goto("https://practicetestautomation.com/practice")
    await page.locator('//a[text()="Test Login Page"]').waitFor({ state: 'visible' })
    await page.locator('//a[text()="Test Login Page"]').click()
})