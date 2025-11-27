import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: process.env.CI
      ? 'http://host.containers.internal:3000'
      : 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true, // Docker usually requires headless
    ...devices['Desktop Chrome'],
    channel: 'chromium',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
