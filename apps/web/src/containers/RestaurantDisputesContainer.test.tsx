import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts, disputes } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { useRestaurantDisputesSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { RestaurantDisputesContainer } from './RestaurantDisputesContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.charlie,
  disputes: [disputes.disputeOpen, disputes.disputeCustomerWins],
};

test('shows empty state when no disputes', async () => {
  useRestaurantDisputesSpy.mockReturnValue({ disputes: [] });

  renderRoute(
    [
      {
        path: '/restaurant-portal/disputes',
        element: <RestaurantDisputesContainer />,
      },
    ],
    {
      initialData: { ...BASE_DATA, disputes: [] },
      initialEntries: ['/restaurant-portal/disputes'],
    },
  );

  await expect
    .element(
      page.getByText('No disputes have been raised against your restaurant.'),
    )
    .toBeVisible();
});

test('shows disputes with view details button', async () => {
  renderRoute(
    [
      {
        path: '/restaurant-portal/disputes',
        element: <RestaurantDisputesContainer />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: ['/restaurant-portal/disputes'],
    },
  );

  // Should show disputes with View Details button
  await expect
    .element(page.getByRole('button', { name: /View Details/i }))
    .toBeVisible();
});

test('calls useRestaurantDisputes hook', async () => {
  renderRoute(
    [
      {
        path: '/restaurant-portal/disputes',
        element: <RestaurantDisputesContainer />,
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: ['/restaurant-portal/disputes'],
    },
  );

  await expect
    .element(page.getByRole('button', { name: /View Details/i }))
    .toBeVisible();
  expect(useRestaurantDisputesSpy).toHaveBeenCalled();
});
