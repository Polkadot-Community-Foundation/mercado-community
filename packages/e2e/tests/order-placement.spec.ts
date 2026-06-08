import { restaurants, dishes } from '@mercado/mocks';

import { test, expect, waitForApp } from './fixtures';
import {
  LandingPage,
  RestaurantMenuPage,
  CheckoutPage,
  OrderStatusPage,
} from './pages';

test.describe('OrderPlacement', () => {
  test('full happy path: select dish, customize, checkout, see order placed', async ({
    testHost,
  }) => {
    const app = await waitForApp(testHost);
    const landing = new LandingPage(app.frame);

    await landing.selectLocation('New York');
    await app.restaurantText(restaurants.restaurantBurgerPalace.name).click();

    const menu = new RestaurantMenuPage(app.frame);
    await menu.dishButton(dishes.dishBaconDeluxe.name).click();
    await expect(menu.addToOrderButton).toBeVisible();

    await menu.optionCheckbox('No bacon').click();
    await menu.optionCheckbox('Extra burger patty').click();
    await menu.addToOrderButton.click();
    await expect(menu.menuHeading).toBeVisible();

    await app.checkoutLink.click();
    const checkout = new CheckoutPage(app.frame);
    await expect(checkout.totalText).toBeVisible();
    await expect(app.dishText(dishes.dishBaconDeluxe.name)).toBeVisible();

    await checkout.placeOrder();

    const orderStatus = new OrderStatusPage(app.frame, testHost.page);
    await expect(orderStatus.statusText('Placed')).toBeVisible();
  });
});
