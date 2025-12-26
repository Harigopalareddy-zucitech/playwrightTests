import { test } from 'playwright/test';

test('sample test', async ({ page }) => {
    await page.goto("https://flipkart.com")
    await page.locator("//span[text()='Login']").hover()
    await page.locator("//span[text()='Sign Up']").click()
    await page.waitForTimeout(10000)
})   