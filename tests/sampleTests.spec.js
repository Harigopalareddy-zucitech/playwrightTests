import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext()
const page = await context.newPage()
await page.goto("https://practicetestautomation.com/practice")
await page.locator('//a[text()="Test Login Page"]').waitFor({ state: 'visible' })
await page.locator('//a[text()="Test Login Page"]').click()
await page.waitForTimeout(10000)
await browser.close()