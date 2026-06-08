import { restaurants, dishes, accounts } from '@mercado/mocks';

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
  page: import('@playwright/test').Page,
) {
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

  const orderStatus = new OrderStatusPage(app.frame, page);
  await expect(orderStatus.heading).toBeVisible();
}

test.describe('OrderManagement', () => {
  test('positive route: place order, restaurant advances, customer picks up', async ({
    testHost,
  }) => {
    // Stage 0: Charlie checks portal, 0 new orders
    await testHost.switchAccount('charlie');
    let app = await waitForApp(testHost);
    const portal0 = new RestaurantPortalPage(app.frame, testHost.page);
    await app.restaurantPortalLink.click();
    await expect(portal0.counterText('0 new')).toBeVisible();

    // Stage 1: Alice places order
    await testHost.switchAccount('alice');
    app = await waitForApp(testHost);
    await placeOrderAtBurgerPalace(app, testHost.page);

    // Stage 2: Charlie sees 1 new, confirms
    await testHost.switchAccount('charlie');
    app = await waitForApp(testHost);
    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await app.restaurantPortalLink.click();
    await expect(portal.counterText('1 new')).toBeVisible();
    await expect(app.frame.getByText(accounts.alice.address)).toBeVisible();

    await portal.clickOrderCard(accounts.alice.address);
    await expect(app.dishText(dishes.dishBaconDeluxe.name)).toBeVisible();
    await expect(
      portal.modalCustomerAddress(accounts.alice.address),
    ).toBeVisible();
    await portal.confirmOrderButton.click();
    await expect(portal.counterText('1 confirmed')).toBeVisible();

    // Stage 3: Preparing
    await portal.clickOrderCard(accounts.alice.address);
    await portal.preparingOrderButton.click();
    await expect(portal.counterText('1 preparing')).toBeVisible();

    // Stage 4: Ready for pickup - capture the pickup code
    await portal.clickOrderCard(accounts.alice.address);
    const pickupCode = await portal.markReadyAndGetCode();
    await expect(portal.counterText('1 ready for pickup')).toBeVisible();

    // Stage 5: Alice picks up using the code
    await testHost.switchAccount('alice');
    app = await waitForApp(testHost);
    await app.myOrdersLink.click();
    const myOrders = new MyOrdersPage(app.frame);
    await myOrders.clickOrder(restaurants.restaurantBurgerPalace.name);
    const orderStatus = new OrderStatusPage(app.frame, testHost.page);
    await expect(orderStatus.statusText('Ready for Pickup')).toBeVisible();
    await orderStatus.pickUp(pickupCode);
    await expect(orderStatus.statusText('Completed')).toBeVisible();

    // Stage 6: Charlie sees completed in past
    await testHost.switchAccount('charlie');
    app = await waitForApp(testHost);
    const portal2 = new RestaurantPortalPage(app.frame, testHost.page);
    await app.restaurantPortalLink.click();
    await expect(portal2.counterText('1 completed')).toBeVisible();
    await portal2.pastOrdersTab.click();
    await portal2.clickOrderCard(accounts.alice.address);
    await expect(portal2.confirmOrderButton).not.toBeVisible();
    await expect(portal2.cancelOrderButton).not.toBeVisible();
  });

  test('customer cancellation', async ({ testHost }) => {
    let app = await waitForApp(testHost);
    await placeOrderAtBurgerPalace(app, testHost.page);

    const orderStatus = new OrderStatusPage(app.frame, testHost.page);
    await orderStatus.cancel();
    await expect(orderStatus.cancelledMessage).toBeVisible();

    // Charlie sees canceled
    await testHost.switchAccount('charlie');
    app = await waitForApp(testHost);
    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await app.restaurantPortalLink.click();
    await expect(portal.counterText('1 canceled')).toBeVisible();
    await portal.pastOrdersTab.click();
    await portal.clickOrderCard(accounts.alice.address);
    await expect(portal.cancelledByText('customer')).toBeVisible();
  });

  test('restaurant cancellation', async ({ testHost }) => {
    let app = await waitForApp(testHost);
    await placeOrderAtBurgerPalace(app, testHost.page);

    await testHost.switchAccount('charlie');
    app = await waitForApp(testHost);
    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await app.restaurantPortalLink.click();
    await expect(portal.counterText('1 new')).toBeVisible();

    await portal.clickOrderCard(accounts.alice.address);
    await portal.cancelOrder();

    await expect(portal.counterText('1 canceled')).toBeVisible();
    await portal.pastOrdersTab.click();
    await portal.clickOrderCard(accounts.alice.address);
    await expect(portal.cancelledByText('restaurant')).toBeVisible();
  });
});
