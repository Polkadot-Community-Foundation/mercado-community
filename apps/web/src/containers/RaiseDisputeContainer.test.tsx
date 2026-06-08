import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts, orders } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { useRaiseDisputeSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { RaiseDisputeContainer } from './RaiseDisputeContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.alice,
  orders: [orders.orderCompleted],
};

test('renders dispute form with stake button', async () => {
  renderRoute(
    [
      {
        path: '/orders/:orderId/dispute',
        element: (
          <RaiseDisputeContainer
            orderId={orders.orderCompleted.id}
            onCancel={() => {}}
          />
        ),
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/orders/${orders.orderCompleted.id}/dispute`],
    },
  );

  // Submit button text includes "Stake" and "Submit"
  await expect
    .element(page.getByRole('button', { name: /Stake.*Submit/i }))
    .toBeVisible();
});

test('shows stake amount in form', async () => {
  renderRoute(
    [
      {
        path: '/orders/:orderId/dispute',
        element: (
          <RaiseDisputeContainer
            orderId={orders.orderCompleted.id}
            onCancel={() => {}}
          />
        ),
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/orders/${orders.orderCompleted.id}/dispute`],
    },
  );

  await expect.element(page.getByText(/Stake Required/i)).toBeVisible();
});

test('calls useRaiseDispute hook', async () => {
  renderRoute(
    [
      {
        path: '/orders/:orderId/dispute',
        element: (
          <RaiseDisputeContainer
            orderId={orders.orderCompleted.id}
            onCancel={() => {}}
          />
        ),
      },
    ],
    {
      initialData: BASE_DATA,
      initialEntries: [`/orders/${orders.orderCompleted.id}/dispute`],
    },
  );

  await expect.element(page.getByText(/Stake Required/i)).toBeVisible();
  expect(useRaiseDisputeSpy).toHaveBeenCalled();
});
