import { test, expect, waitForApp } from './fixtures';
import { RegisterRestaurantPage, RestaurantPortalPage } from './pages';

test.describe('RestaurantRegistration', () => {
  test('Correct restaurant account detection', async ({ testHost }) => {
    const app = await waitForApp(testHost);

    await expect(app.joinAsRestaurantLink).toBeVisible();
    await app.joinAsRestaurantLink.click();

    const registerPage = new RegisterRestaurantPage(app.frame);
    await expect(registerPage.heading).toBeVisible();
  });

  test('Already registered', async ({ testHost }) => {
    await testHost.switchAccount('charlie');
    const app = await waitForApp(testHost);

    await expect(app.joinAsRestaurantLink).not.toBeVisible();
    await app.restaurantPortalLink.click();

    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await expect(portal.heading).toBeVisible();
  });

  test('Already registered - redirect from register page', async ({
    testHost,
  }) => {
    await testHost.switchAccount('charlie');
    const app = await waitForApp(testHost);

    await app.restaurantPortalLink.click();

    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await expect(portal.heading).toBeVisible();
  });
});
