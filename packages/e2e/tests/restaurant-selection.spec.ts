import { restaurants, dishes } from '@mercado/mocks';

import { test, expect, waitForApp } from './fixtures';
import { LandingPage } from './pages';

test.describe('RestaurantSelection', () => {
  test('shows correct restaurants for selected location', async ({
    testHost,
  }) => {
    const app = await waitForApp(testHost);
    const landing = new LandingPage(app.frame);

    await landing.selectLocation('New York');

    // All 4 test restaurants are in New York
    await expect(
      app.restaurantText(restaurants.restaurantBurgerPalace.name),
    ).toBeVisible();
    await expect(
      app.restaurantText(restaurants.restaurantPizzaCorner.name),
    ).toBeVisible();
    await expect(
      app.restaurantText(restaurants.restaurantTacoFiesta.name),
    ).toBeVisible();
    await expect(
      app.restaurantText(restaurants.restaurantSushiExpress.name),
    ).toBeVisible();
  });

  test('shows correct menu for selected restaurant', async ({ testHost }) => {
    const app = await waitForApp(testHost);
    const landing = new LandingPage(app.frame);

    await landing.selectLocation('New York');
    await app.restaurantText(restaurants.restaurantBurgerPalace.name).click();

    // Burger Palace has Classic Burger and Bacon Deluxe
    await expect(app.dishText(dishes.dishClassicBurger.name)).toBeVisible();
    await expect(app.dishText(dishes.dishBaconDeluxe.name)).toBeVisible();
    // Margherita is from Pizza Corner, not Burger Palace
    await expect(app.dishText(dishes.dishMargherita.name)).not.toBeVisible();
  });
});
