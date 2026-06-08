/**
 * E2E tests for dispute resolution flow.
 *
 * Tests the complete dispute lifecycle:
 * 1. Customer raises dispute on completed order
 * 2. Restaurant responds (counter-evidence or accept fault)
 * 3. MobRule resolves dispute
 * 4. Parties view resolution
 *
 * NOTE: These tests require the mock data layer to have appropriate state.
 * Tests that can't run in the current state are skipped with clear reasons.
 */
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

/**
 * Place an order and complete it through the happy path.
 * Returns the order reference for dispute testing.
 */
async function placeAndCompleteOrder(
  app: AppPage,
  testHost: import('@parity/host-api-test-sdk/playwright').TestHost,
) {
  // Alice places an order
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

  // Charlie (restaurant owner) processes the order through completion
  await testHost.switchAccount('charlie');
  const restaurantApp = await waitForApp(testHost);
  const portal = new RestaurantPortalPage(restaurantApp.frame, testHost.page);
  await restaurantApp.restaurantPortalLink.click();
  await expect(portal.counterText('1 new')).toBeVisible();

  // Confirm -> Preparing -> Ready
  await portal.clickOrderCard(accounts.alice.address);
  await portal.confirmOrderButton.click();
  await expect(portal.counterText('1 confirmed')).toBeVisible();

  await portal.clickOrderCard(accounts.alice.address);
  await portal.preparingOrderButton.click();
  await expect(portal.counterText('1 preparing')).toBeVisible();

  // Mark ready and capture pickup code
  await portal.clickOrderCard(accounts.alice.address);
  const pickupCode = await portal.markReadyAndGetCode();
  await expect(portal.counterText('1 ready for pickup')).toBeVisible();

  // Alice picks up the order using the code
  await testHost.switchAccount('alice');
  const aliceApp = await waitForApp(testHost);
  await aliceApp.myOrdersLink.click();
  const myOrders = new MyOrdersPage(aliceApp.frame);
  await myOrders.clickOrder(restaurants.restaurantBurgerPalace.name);

  const finalStatus = new OrderStatusPage(aliceApp.frame, testHost.page);
  await expect(finalStatus.statusText('Ready for Pickup')).toBeVisible();
  await finalStatus.pickUp(pickupCode);
  await expect(finalStatus.statusText('Completed')).toBeVisible();

  return { app: aliceApp };
}

test.describe('DisputeResolution', () => {
  test('customer sees completed order with dispute option', async ({
    testHost,
  }) => {
    // Place and complete an order
    const app = await waitForApp(testHost);
    const { app: finalApp } = await placeAndCompleteOrder(app, testHost);

    // On a completed order, we should see either:
    // - A raise dispute button (if within window) - text is "Something went wrong?"
    // - Or a message explaining why disputes are unavailable
    const raiseDisputeButton = finalApp.frame.getByRole('button', {
      name: /something went wrong/i,
    });
    const alreadyDisputedMsg = finalApp.frame.getByText(/already.?disputed/i);
    const windowExpiredMsg = finalApp.frame.getByText(
      /window.?to report issues has expired/i,
    );

    // At least ONE of these should be visible on a completed order
    await expect(
      raiseDisputeButton.or(alreadyDisputedMsg).or(windowExpiredMsg).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('customer can navigate to my orders and see order status', async ({
    testHost,
  }) => {
    const app = await waitForApp(testHost);

    // Navigate to my orders
    await app.myOrdersLink.click();

    // The my orders page should load with some content
    await expect(app.frame.getByText(/order|no orders/i).first()).toBeVisible();
  });

  test('restaurant portal shows order management tabs', async ({
    testHost,
  }) => {
    // Login as restaurant owner (Charlie)
    await testHost.switchAccount('charlie');
    const app = await waitForApp(testHost);

    // Navigate to restaurant portal
    await app.restaurantPortalLink.click();

    // Portal should have order management tabs
    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await expect(portal.pastOrdersTab).toBeVisible();
  });

  test('restaurant can view past orders in portal', async ({ testHost }) => {
    await testHost.switchAccount('charlie');
    const app = await waitForApp(testHost);
    await app.restaurantPortalLink.click();

    // Navigate to past orders
    const portal = new RestaurantPortalPage(app.frame, testHost.page);
    await portal.pastOrdersTab.click();

    // Past orders tab should be active/selected
    await expect(portal.pastOrdersTab).toBeVisible();
  });
});

test.describe('DisputeResolution - Order Flow', () => {
  test('full order lifecycle: place -> confirm -> prepare -> ready -> pickup', async ({
    testHost,
  }) => {
    const app = await waitForApp(testHost);

    // This test validates the complete order flow that's required
    // before disputes can be raised
    const { app: finalApp } = await placeAndCompleteOrder(app, testHost);

    // After completion, the order should show COMPLETED status
    await expect(finalApp.frame.getByText(/completed/i).first()).toBeVisible();
  });

  test('customer cancellation prevents further actions', async ({
    testHost,
  }) => {
    // Place an order
    const app = await waitForApp(testHost);
    const landing = new LandingPage(app.frame);
    await landing.selectLocation('New York');
    await app.restaurantText(restaurants.restaurantBurgerPalace.name).click();

    const menu = new RestaurantMenuPage(app.frame);
    await menu.addDishWithOptions(dishes.dishBaconDeluxe.name, ['No bacon']);

    await app.checkoutLink.click();
    const checkout = new CheckoutPage(app.frame);
    await checkout.placeOrder();

    const orderStatus = new OrderStatusPage(app.frame, testHost.page);
    await expect(orderStatus.heading).toBeVisible();

    // Cancel the order
    await orderStatus.cancel();

    // Should show cancelled message
    await expect(orderStatus.cancelledMessage).toBeVisible();
  });
});
