import { expect } from "playwright/test";
import { test } from "../fixtures/pageFixtures";

test('signup test', async ({ page }) => {
    await page.goto("https://flipkart.com");
    await page.locator("//a[contains(@title, 'Login')]//span[contains(text(), 'Login')]").hover();
    await page.locator("//a[@title='Sign Up']//span[contains(text(), 'Sign Up')]").click();
    expect(page.url()).toEqual('https://www.flipkart.com/account/login?signup=true&ret=/')
})

test('Seller test', async ({ page }) => {
    await page.goto("https://flipkart.com");
    await page.locator("//a[contains(text(), 'Become a Seller')]").click();
    await page.waitForLoadState('load')
    expect(await page.locator("//button[text()='Start Selling']").isVisible()).toBeTruthy();
})