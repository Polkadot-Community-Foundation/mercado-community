import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, dishes } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { useRestaurantSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { RestaurantDetailContainer } from './RestaurantDetailContainer';

const TEST_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
};

test('shows restaurant details and menu', async () => {
  renderRoute(
    [{ path: '/restaurants/:id', element: <RestaurantDetailContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: [`/restaurants/${restaurants.restaurantBurgerPalace.id}`],
    },
  );

  // Restaurant info
  await expect
    .element(
      page.getByRole('heading', {
        name: restaurants.restaurantBurgerPalace.name,
        exact: true,
      }),
    )
    .toBeVisible();
  await expect
    .element(page.getByText(restaurants.restaurantBurgerPalace.description))
    .toBeVisible();

  // Dishes - Burger Palace has dishClassicBurger and dishBaconDeluxe
  await expect
    .element(page.getByText(dishes.dishClassicBurger.name))
    .toBeVisible();
  await expect.element(page.getByText('12.00 pUSD')).toBeVisible();
  await expect
    .element(page.getByText(dishes.dishBaconDeluxe.name))
    .toBeVisible();
});

test('calls useRestaurant with correct id', async () => {
  renderRoute(
    [{ path: '/restaurants/:id', element: <RestaurantDetailContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: [`/restaurants/${restaurants.restaurantBurgerPalace.id}`],
    },
  );

  await expect
    .element(
      page.getByRole('heading', {
        name: restaurants.restaurantBurgerPalace.name,
        exact: true,
      }),
    )
    .toBeVisible();
  expect(useRestaurantSpy).toHaveBeenCalledWith(
    restaurants.restaurantBurgerPalace.id,
  );
});

test('shows not found for unknown restaurant', async () => {
  renderRoute(
    [{ path: '/restaurants/:id', element: <RestaurantDetailContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: ['/restaurants/999'],
    },
  );

  await expect.element(page.getByText('Restaurant not found.')).toBeVisible();
});
