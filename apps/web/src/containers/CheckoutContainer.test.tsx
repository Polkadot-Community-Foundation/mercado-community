import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, dishes } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';

import { RestaurantDetailContainer } from './RestaurantDetailContainer';
import { CheckoutContainer } from './CheckoutContainer';
import { OrderStatusContainer } from './OrderStatusContainer';

const TEST_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
};

test('full checkout flow: add to cart, checkout, place order', async () => {
  renderRoute(
    [
      { path: '/restaurants/:id', element: <RestaurantDetailContainer /> },
      { path: '/checkout', element: <CheckoutContainer /> },
      { path: '/orders/:orderId', element: <OrderStatusContainer /> },
    ],
    {
      initialData: TEST_DATA,
      initialEntries: [`/restaurants/${restaurants.restaurantBurgerPalace.id}`],
    },
  );

  // Click on Bacon Deluxe to open modal
  await expect
    .element(page.getByText(dishes.dishBaconDeluxe.name))
    .toBeVisible();
  await page.getByRole('button', { name: dishes.dishBaconDeluxe.name }).click();

  // Modal opens — verify Add to order button is visible
  await expect
    .element(page.getByRole('button', { name: /Add to order/i }))
    .toBeVisible();

  // Toggle options
  await page.getByRole('checkbox', { name: /No bacon/i }).click();
  await page.getByRole('checkbox', { name: /Extra burger patty/i }).click();

  // Add to cart
  await page.getByRole('button', { name: /Add to order/i }).click();

  // View cart link appears
  await page.getByRole('link', { name: /View cart/i }).click();

  // See order summary
  await expect.element(page.getByText('Your Order')).toBeVisible();
  await expect.element(page.getByText('Total', { exact: true })).toBeVisible();
  await expect
    .element(page.getByText(dishes.dishBaconDeluxe.name))
    .toBeVisible();

  // Place order
  await page.getByRole('button', { name: /Place Order/i }).click();

  // Navigated to order status page
  await expect.element(page.getByText('Order Status')).toBeVisible();
  await expect.element(page.getByText('Placed')).toBeVisible();
});
