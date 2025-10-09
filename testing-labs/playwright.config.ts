import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html' }],
    ['allure-playwright']
  ],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', ...devices['Desktop Chrome'] } }
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  outputDir: 'reports/test-results'
});