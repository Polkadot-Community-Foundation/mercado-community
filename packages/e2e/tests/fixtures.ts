import { test as base, expect } from '@playwright/test';
import {
  createTestHostFixture,
  type TestHost,
  type Account,
} from '@parity/host-api-test-sdk/playwright';

import { AppPage } from './pages';

/**
 * App URLs for multi-app testing.
 */
export const APP_URLS = {
  web: 'http://localhost:5173',
  mmPortal: 'http://localhost:5175',
  mobruleAdmin: 'http://localhost:5174',
} as const;

/**
 * Default fixture for web app testing.
 */
const defaultFixture = createTestHostFixture({
  productUrl: APP_URLS.web,
  accounts: ['alice'],
});

export const test = base.extend<{ testHost: TestHost }>(defaultFixture);
export { expect };

/**
 * Create a fixture for a specific app with custom accounts.
 */
export function createAppFixture(
  appUrl: string,
  accounts: Account[] = ['alice'],
) {
  return createTestHostFixture({
    productUrl: appUrl,
    accounts,
  });
}

/**
 * Fixture for matchmaker portal testing.
 */
const mmPortalFixture = createTestHostFixture({
  productUrl: APP_URLS.mmPortal,
  accounts: ['alice'],
});

export const mmPortalTest = base.extend<{ testHost: TestHost }>(
  mmPortalFixture,
);

/**
 * Fixture for MobRule admin testing.
 */
const mobruleAdminFixture = createTestHostFixture({
  productUrl: APP_URLS.mobruleAdmin,
  accounts: ['alice'],
});

export const mobruleAdminTest = base.extend<{ testHost: TestHost }>(
  mobruleAdminFixture,
);

/**
 * Wait for the web app to be ready and authenticated.
 */
export async function waitForApp(testHost: TestHost): Promise<AppPage> {
  await testHost.waitForConnection();
  const frame = testHost.productFrame();
  const app = new AppPage(frame);
  await expect(app.mercadoLink).toBeVisible();
  await app.waitForAuth();
  return app;
}

/**
 * Wait for any app to be connected (no auth check).
 */
export async function waitForConnection(testHost: TestHost) {
  await testHost.waitForConnection();
  return testHost.productFrame();
}
