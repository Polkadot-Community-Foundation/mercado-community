import { defineConfig, devices } from '@playwright/test';

/**
 * Multi-app E2E test configuration.
 *
 * Supports testing across:
 * - @mercado/web (main app) - port 5173
 * - @mercado/mockmobrule-admin (Mob Rule admin) - port 5174
 * - @mercado/mm-portal (matchmaker portal) - port 5175
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use */
  reporter: process.env.CI ? 'github' : 'list',
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
  },

  /* Configure projects for multi-app testing */
  projects: [
    {
      name: 'web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: /.*\.spec\.ts/,
      testIgnore: [/mm-portal/, /mobrule-admin/],
    },
    {
      name: 'mm-portal',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5175',
      },
      testMatch: /.*mm-portal.*\.spec\.ts/,
    },
    {
      name: 'mobrule-admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174',
      },
      testMatch: /.*mobrule-admin.*\.spec\.ts/,
    },
  ],

  /* Run web app dev server before starting the tests */
  webServer: [
    {
      command: 'pnpm --filter @mercado/web dev',
      url: 'http://localhost:5173',
      // Don't reuse existing server - we need specific env vars for mock data
      reuseExistingServer: false,
      timeout: 120 * 1000,
      // Use mock data for e2e tests
      env: {
        VITE_USE_REAL_CONTRACTS: 'false',
      },
    },
    {
      command: 'pnpm --filter @mercado/mm-portal dev',
      url: 'http://localhost:5175',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        VITE_USE_REAL_CONTRACTS: 'false',
      },
    },
    {
      command: 'pnpm --filter @mercado/mockmobrule-admin dev',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        VITE_USE_REAL_CONTRACTS: 'false',
      },
    },
  ],
});
