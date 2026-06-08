import { expect, test, vi } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';
import { restaurants, accounts } from '@mercado/mocks';
import type { Order } from '@mercado/types';

import { renderRoute } from '../test-utils/render';

import { RestaurantPortalContainer } from './RestaurantPortalContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  activeAccount: accounts.charlie,
};

let orderIdCounter = 100;

function makeOrder(overrides: Partial<Order>): Order {
  const id = overrides.id ?? String(++orderIdCounter);
  return {
    id,
    customerId: accounts.alice.address,
    restaurantId: '1',
    items: [{ dishId: 'd2', selectedOptionIds: ['o8', 'o9'] }],
    totalPrice: 1800n,
    status: 'PLACED',
    createdAt: Date.now(),
    ...overrides,
  };
}

test('empty portal shows zero orders', async () => {
  renderRoute(
    [{ path: '/restaurant-portal', element: <RestaurantPortalContainer /> }],
    {
      initialData: { ...BASE_DATA, orders: [] },
      initialEntries: ['/restaurant-portal'],
    },
  );

  await expect.element(page.getByText('0 new')).toBeVisible();
  await expect.element(page.getByText('No active orders')).toBeVisible();
});

test('shows orders with correct badge counts and grouping', async () => {
  const testOrders: Order[] = [
    makeOrder({ id: '101', status: 'PLACED' }),
    makeOrder({ id: '102', status: 'PLACED' }),
    makeOrder({ id: '103', status: 'CONFIRMED' }),
    makeOrder({ id: '104', status: 'COMPLETED' }),
    makeOrder({ id: '105', status: 'CANCELED', canceledBy: 'customer' }),
  ];

  renderRoute(
    [{ path: '/restaurant-portal', element: <RestaurantPortalContainer /> }],
    {
      initialData: { ...BASE_DATA, orders: testOrders },
      initialEntries: ['/restaurant-portal'],
    },
  );

  await expect.element(page.getByText('2 new')).toBeVisible();
  await expect.element(page.getByText('1 confirmed')).toBeVisible();
  await expect.element(page.getByText('1 completed')).toBeVisible();
  await expect.element(page.getByText('1 canceled')).toBeVisible();

  // Active tab shows new and confirmed
  await expect.element(page.getByText('101')).toBeVisible();
  await expect.element(page.getByText('102')).toBeVisible();
  await expect.element(page.getByText('103')).toBeVisible();

  // Switch to past tab
  await page.getByRole('button', { name: /Past orders/i }).click();
  await expect.element(page.getByText('104')).toBeVisible();
  await expect.element(page.getByText('105')).toBeVisible();
});

test('advance order through statuses from portal', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);

  renderRoute(
    [{ path: '/restaurant-portal', element: <RestaurantPortalContainer /> }],
    {
      initialData: {
        ...BASE_DATA,
        orders: [makeOrder({ id: '201', status: 'PLACED' })],
      },
      initialEntries: ['/restaurant-portal'],
    },
  );

  // Open modal
  await page.getByRole('button', { name: '201' }).click();
  await expect
    .element(page.getByRole('button', { name: 'Confirm order' }))
    .toBeVisible();
  await page.getByRole('button', { name: 'Confirm order' }).click();

  // Modal should close, badge count should change
  await expect.element(page.getByText('1 confirmed')).toBeVisible();

  // Reopen and advance
  await page.getByRole('button', { name: '201' }).click();
  await page.getByRole('button', { name: 'Preparing order' }).click();
  await expect.element(page.getByText('1 preparing')).toBeVisible();

  // Reopen and advance to ready - this shows the pickup code, modal stays open
  await page.getByRole('button', { name: '201' }).click();
  await page.getByRole('button', { name: 'Order is ready for pickup' }).click();

  // Modal stays open to show pickup code
  await expect
    .element(page.getByText('Give this code to the customer:'))
    .toBeVisible();

  // Close the modal by clicking outside or pressing escape
  await userEvent.keyboard('{Escape}');

  // Now check the badge count
  await expect.element(page.getByText('1 ready for pickup')).toBeVisible();
});

test('cancel order from restaurant portal', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);

  renderRoute(
    [{ path: '/restaurant-portal', element: <RestaurantPortalContainer /> }],
    {
      initialData: {
        ...BASE_DATA,
        orders: [makeOrder({ id: '301', status: 'PLACED' })],
      },
      initialEntries: ['/restaurant-portal'],
    },
  );

  await page.getByRole('button', { name: '301' }).click();
  await page.getByRole('button', { name: 'Cancel order' }).click();

  // Order should show as canceled in the badge
  await expect.element(page.getByText('1 canceled')).toBeVisible();

  // Switch to past tab and click on order
  await page.getByRole('button', { name: /Past orders/i }).click();
  await page.getByRole('button', { name: '301' }).click();
  await expect
    .element(page.getByText('Canceled by the restaurant', { exact: true }))
    .toBeVisible();
});

test('completed/canceled orders have no action buttons', async () => {
  renderRoute(
    [{ path: '/restaurant-portal', element: <RestaurantPortalContainer /> }],
    {
      initialData: {
        ...BASE_DATA,
        orders: [
          makeOrder({ id: '401', status: 'COMPLETED' }),
          makeOrder({
            id: '402',
            status: 'CANCELED',
            canceledBy: 'customer',
          }),
        ],
      },
      initialEntries: ['/restaurant-portal'],
    },
  );

  // Switch to past tab
  await page.getByRole('button', { name: /Past orders/i }).click();

  // Open completed order
  await page.getByRole('button', { name: '401' }).click();
  await expect
    .element(page.getByRole('button', { name: 'Cancel order' }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Confirm order' }))
    .not.toBeInTheDocument();

  await expect
    .element(page.getByText('Order 401', { exact: true }))
    .toBeVisible();

  // Close modal via Escape
  await userEvent.keyboard('{Escape}');

  // Open canceled order
  await page.getByRole('button', { name: '402' }).click();
  await expect
    .element(page.getByText('Canceled by the customer', { exact: true }))
    .toBeVisible();
  await expect
    .element(page.getByRole('button', { name: 'Cancel order' }))
    .not.toBeInTheDocument();
});
