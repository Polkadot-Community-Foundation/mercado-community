import { restaurants, dishes } from '@mercado/mocks';

import { test, expect, waitForApp } from './fixtures';
import {
  LandingPage,
  RestaurantMenuPage,
  CheckoutPage,
  OrderStatusPage,
  MyOrdersPage,
  RestaurantPortalPage,
  AppPage,
} from './pages';

async function placeOrderAtBurgerPalace(
  app: AppPage,
  testHost: { page: import('@playwright/test').Page },
) {
  await app.navigateHome();
  const landing = new LandingPage(app.frame);
  await landing.selectLocation('New York');
  await app.restaurantText(restaurants.restaurantBurgerPalace.name).click();

  const menu = new RestaurantMenuPage(app.frame);
  await menu.addDishWithOptions(dishes.dishBaconDeluxe.name, [
    'No bacon',
    'Extra burger patty',
  ]);

  await app.checkoutLink.click();
  const checkout = new CheckoutPage(app.frame);
  await checkout.placeOrder();

  const orderStatus = new OrderStatusPage(app.frame, testHost.page);
  await expect(orderStatus.heading).toBeVisible();
}

async function placeOrderAtPizzaCorner(
  app: AppPage,
  testHost: { page: import('@playwright/test').Page },
) {
  await app.navigateHome();
  const landing = new LandingPage(app.frame);
  await landing.selectLocation('New York');
  await app.restaurantText(restaurants.restaurantPizzaCorner.name).click();

  const menu = new RestaurantMenuPage(app.frame);
  await menu.addDish(dishes.dishMargherita.name);

  await app.checkoutLink.click();
  const checkout = new CheckoutPage(app.frame);
  await checkout.placeOrder();

  const orderStatus = new OrderStatusPage(app.frame, testHost.page);
  await expect(orderStatus.heading).toBeVisible();
}

test.describe('MyOrders', () => {
  test('order links are correct', async ({ testHost }) => {
    const app = await waitForApp(testHost);
    await placeOrderAtBurgerPalace(app, testHost);

    await app.myOrdersLink.click();
    const myOrders = new MyOrdersPage(app.frame);
    await expect(myOrders.activeOrdersHeading).toBeVisible();

    await myOrders.clickOrder(restaurants.restaurantBurgerPalace.name);
    const orderStatus = new OrderStatusPage(app.frame, testHost.page);
    await expect(orderStatus.heading).toBeVisible();
  });

  test('order grouping, statuses and counters', async ({ testHost }) => {
    // Stage 0: No orders
    const app = await waitForApp(testHost);
    const myOrders = new MyOrdersPage(app.frame);

    await expect(app.myOrdersLink).toBeVisible();
    await expect(app.myOrdersBadge).not.toBeVisible();

    await app.myOrdersLink.click();
    await expect(myOrders.emptyStateText).toBeVisible();

    // Stage 1: Create orders
    await placeOrderAtBurgerPalace(app, testHost);
    await expect(app.myOrdersBadgeCount('1')).toBeVisible();

    await placeOrderAtPizzaCorner(app, testHost);
    await expect(app.myOrdersBadgeCount('2')).toBeVisible();

    // Stage 2: See 2 active, cancel pizza
    await app.myOrdersLink.click();
    await expect(myOrders.activeOrdersHeading).toBeVisible();
    await expect(myOrders.pastOrdersHeading).not.toBeVisible();

    await myOrders.clickOrder(restaurants.restaurantPizzaCorner.name);
    const orderStatus = new OrderStatusPage(app.frame, testHost.page);
    await orderStatus.cancel();

    await expect(app.myOrdersBadgeCount('1')).toBeVisible();

    await app.myOrdersLink.click();
    await expect(myOrders.pastOrdersHeading).toBeVisible();
    await expect(myOrders.statusText('canceled by you')).toBeVisible();

    // Stage 3: Charlie advances burger order
    await testHost.switchAccount('charlie');
    let app2 = await waitForApp(testHost);
    const portal = new RestaurantPortalPage(app2.frame, testHost.page);
    await app2.restaurantPortalLink.click();

    await portal.orderCardByStatus('new').click();
    await portal.confirmOrderButton.click();
    await portal.orderCardByStatus('confirmed').click();
    await portal.preparingOrderButton.click();
    await portal.orderCardByStatus('preparing').click();
    // Mark ready and capture pickup code
    const pickupCode = await portal.markReadyAndGetCode();

    // Stage 4: Alice picks up using the code
    await testHost.switchAccount('alice');
    app2 = await waitForApp(testHost);
    const myOrders2 = new MyOrdersPage(app2.frame);
    await app2.myOrdersLink.click();
    await expect(myOrders2.statusText('ready for pickup')).toBeVisible();
    await expect(myOrders2.activeOrdersHeading).toBeVisible();

    await myOrders2.clickOrder(restaurants.restaurantBurgerPalace.name);
    const orderStatus2 = new OrderStatusPage(app2.frame, testHost.page);
    await orderStatus2.pickUp(pickupCode);

    await expect(app2.myOrdersBadge).not.toBeVisible();

    await app2.myOrdersLink.click();
    await expect(myOrders2.activeOrdersHeading).not.toBeVisible();
    await expect(myOrders2.pastOrdersHeading).toBeVisible();
    await expect(myOrders2.statusText('completed')).toBeVisible();
  });
});
