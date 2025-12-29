import { defineConfig } from 'playwright/test';

export default defineConfig({
    testDir: './tests',
    reporter: [['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
    // retries: 1,
    use: {
        headless: false,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        browserName: 'firefox'
    },

});
