import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, dishes, accounts } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';

import { RestaurantDetailContainer } from './RestaurantDetailContainer';

const TEST_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.alice,
};

test('adds item to cart with selected options', async () => {
  renderRoute(
    [
      { path: '/restaurants/:id', element: <RestaurantDetailContainer /> },
      { path: '/checkout', element: <div>Checkout page</div> },
    ],
    {
      initialData: TEST_DATA,
      initialEntries: [`/restaurants/${restaurants.restaurantBurgerPalace.id}`],
    },
  );

  // Click dish with options to open modal
  await page.getByRole('button', { name: dishes.dishBaconDeluxe.name }).click();

  // Modal opens
  await expect
    .element(page.getByRole('button', { name: /Add to order/i }))
    .toBeVisible();

  // Toggle an option
  await page.getByRole('checkbox', { name: /No bacon/i }).click();

  // Add to cart
  await page.getByRole('button', { name: /Add to order/i }).click();

  // Modal closes — view cart link appears (item was added)
  await expect
    .element(page.getByRole('link', { name: /View cart/i }))
    .toBeVisible();
});

test('closes modal on cancel', async () => {
  renderRoute(
    [{ path: '/restaurants/:id', element: <RestaurantDetailContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: [`/restaurants/${restaurants.restaurantBurgerPalace.id}`],
    },
  );

  // Click dish to open modal
  await page.getByRole('button', { name: dishes.dishBaconDeluxe.name }).click();

  // Modal opens
  await expect
    .element(page.getByRole('button', { name: /Cancel/i }))
    .toBeVisible();

  // Cancel
  await page.getByRole('button', { name: /Cancel/i }).click();

  // Modal closes — "Add to order" button should disappear
  await expect
    .element(page.getByRole('button', { name: /Add to order/i }))
    .not.toBeInTheDocument();
});

test('unauthenticated user sees "Log in to order" instead of "Add to order"', async () => {
  renderRoute(
    [{ path: '/restaurants/:id', element: <RestaurantDetailContainer /> }],
    {
      initialData: {
        ...TEST_DATA,
        activeAccount: null,
      },
      initialEntries: [`/restaurants/${restaurants.restaurantBurgerPalace.id}`],
    },
  );

  // Click dish to open modal
  await page.getByRole('button', { name: dishes.dishBaconDeluxe.name }).click();

  // Should see "Log in to order" button (disabled)
  await expect
    .element(page.getByRole('button', { name: /Log in to order/i }))
    .toBeVisible();

  // Should NOT see "Add to order" button
  await expect
    .element(page.getByRole('button', { name: /Add to order/i }))
    .not.toBeInTheDocument();
});
