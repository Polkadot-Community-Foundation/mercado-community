import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts, disputes } from '@mercado/mocks';

import { renderRoute } from '../test-utils/render';
import { useCustomerDisputesSpy } from '../contexts/DataContext/mockHooks.test-utils';

import { CustomerDisputesContainer } from './CustomerDisputesContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.alice,
  disputes: [disputes.disputeOpen],
};

test('shows empty state when no disputes', async () => {
  useCustomerDisputesSpy.mockReturnValue({ disputes: [] });

  renderRoute([{ path: '/disputes', element: <CustomerDisputesContainer /> }], {
    initialData: { ...BASE_DATA, disputes: [] },
    initialEntries: ['/disputes'],
  });

  await expect
    .element(page.getByText("You haven't raised any disputes yet."))
    .toBeVisible();
});

test('shows list of customer disputes', async () => {
  renderRoute([{ path: '/disputes', element: <CustomerDisputesContainer /> }], {
    initialData: BASE_DATA,
    initialEntries: ['/disputes'],
  });

  // DisputeCard shows "Order #" + orderId.slice(0,8)
  // disputeOpen.orderId is "order-completed-1", slice(0,8) = "order-co"
  await expect.element(page.getByText(/Order #order-co/i)).toBeVisible();
  await expect
    .element(page.getByRole('button', { name: /View Details/i }))
    .toBeVisible();
});

test('calls useCustomerDisputes hook', async () => {
  renderRoute([{ path: '/disputes', element: <CustomerDisputesContainer /> }], {
    initialData: BASE_DATA,
    initialEntries: ['/disputes'],
  });

  await expect.element(page.getByText(/Order #order-co/i)).toBeVisible();
  expect(useCustomerDisputesSpy).toHaveBeenCalled();
});
