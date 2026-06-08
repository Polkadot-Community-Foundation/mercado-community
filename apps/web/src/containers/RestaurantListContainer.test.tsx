import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { useRestaurantsSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { RestaurantListContainer } from './RestaurantListContainer';

const TEST_DATA = {
  locations: ['New York', 'Los Angeles'],
  restaurants: [
    restaurants.restaurantBurgerPalace, // New York
    restaurants.restaurantPizzaCorner, // New York
    { ...restaurants.restaurantTacoFiesta, location: 'Los Angeles' }, // Los Angeles
  ],
};

test('shows restaurants for selected location', async () => {
  renderRoute(
    [{ path: '/restaurants', element: <RestaurantListContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: ['/restaurants?location=New York'],
    },
  );

  await expect
    .element(page.getByText(restaurants.restaurantBurgerPalace.name))
    .toBeVisible();
  await expect
    .element(page.getByText(restaurants.restaurantPizzaCorner.name))
    .toBeVisible();

  // Restaurant in different location should not appear
  await expect
    .element(page.getByText(restaurants.restaurantTacoFiesta.name))
    .not.toBeInTheDocument();
});

test('calls useRestaurants with correct location', async () => {
  renderRoute(
    [{ path: '/restaurants', element: <RestaurantListContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: ['/restaurants?location=New York'],
    },
  );

  await expect
    .element(page.getByText(restaurants.restaurantBurgerPalace.name))
    .toBeVisible();
  expect(useRestaurantsSpy).toHaveBeenCalledWith('New York', undefined);
});

test('shows empty state when no restaurants match', async () => {
  renderRoute(
    [{ path: '/restaurants', element: <RestaurantListContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: ['/restaurants?location=Ogdenville'],
    },
  );

  await expect.element(page.getByText('No restaurants found')).toBeVisible();
});
