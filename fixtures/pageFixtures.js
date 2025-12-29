import { test as base } from 'playwright/test';
import fs from 'fs';
import path from 'path';

export const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        await use(page);

        // 👇 Runs AFTER each test
        if (testInfo.status !== testInfo.expectedStatus) {
            const domSnippet = await page.evaluate(() => {
                const body = document.body;
                if (!body) return '';
                return body.innerHTML
            });
            const outputDir = path.join(
                process.cwd() + '/test-results/' + testInfo.title,
                'ai-context'
            );
            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(
                path.join(outputDir, `${testInfo.title}.html`),
                domSnippet
            );
            await page.screenshot({
                path: path.join(outputDir, 'failure.png'),
                fullPage: false,
                scale: 'css'
            });
            await testInfo.attach('trace', {
                path: path.join(outputDir, 'trace.zip'),
                contentType: 'application/zip'
            });
        }
    },
});
