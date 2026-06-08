import { expect, test } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, accounts } from '@mercado/mocks';
import type { Order } from '@mercado/types';

import { renderRoute } from '../test-utils/render';

import { MyOrdersContainer } from './MyOrdersContainer';

const BASE_DATA = {
  locations: ['New York'],
  restaurants: [
    restaurants.restaurantBurgerPalace,
    restaurants.restaurantPizzaCorner,
  ],
  activeAccount: accounts.alice,
};

function makeOrder(overrides: Partial<Order>): Order {
  return {
    id: 'order-test',
    customerId: accounts.alice.address,
    restaurantId: '1',
    items: [{ dishId: 'd2', selectedOptionIds: ['o8', 'o9'] }],
    totalPrice: 1800n,
    status: 'PLACED',
    createdAt: Date.now(),
    ...overrides,
  };
}

test('shows empty state when customer has no orders', async () => {
  renderRoute([{ path: '/my-orders', element: <MyOrdersContainer /> }], {
    initialData: { ...BASE_DATA, orders: [] },
    initialEntries: ['/my-orders'],
  });

  await expect.element(page.getByText('No orders made yet')).toBeVisible();
  await expect.element(page.getByText('Active orders')).not.toBeInTheDocument();
  await expect.element(page.getByText('Past orders')).not.toBeInTheDocument();
});

test('shows active and past orders grouped correctly', async () => {
  const testOrders: Order[] = [
    makeOrder({ id: 'o1', status: 'PLACED', restaurantId: '1' }),
    makeOrder({ id: 'o2', status: 'CONFIRMED', restaurantId: '2' }),
    makeOrder({ id: 'o3', status: 'COMPLETED', restaurantId: '1' }),
    makeOrder({
      id: 'o4',
      status: 'CANCELED',
      canceledBy: 'customer',
      restaurantId: '2',
    }),
  ];

  renderRoute([{ path: '/my-orders', element: <MyOrdersContainer /> }], {
    initialData: { ...BASE_DATA, orders: testOrders },
    initialEntries: ['/my-orders'],
  });

  await expect.element(page.getByText('Active orders')).toBeVisible();
  await expect.element(page.getByText('Past orders')).toBeVisible();

  await expect
    .element(page.getByText(restaurants.restaurantBurgerPalace.name).first())
    .toBeVisible();
  await expect
    .element(page.getByText(restaurants.restaurantPizzaCorner.name).first())
    .toBeVisible();
});

test('hides active section when all orders are past', async () => {
  const testOrders: Order[] = [
    makeOrder({ id: 'o1', status: 'COMPLETED' }),
    makeOrder({ id: 'o2', status: 'CANCELED', canceledBy: 'restaurant' }),
  ];

  renderRoute([{ path: '/my-orders', element: <MyOrdersContainer /> }], {
    initialData: { ...BASE_DATA, orders: testOrders },
    initialEntries: ['/my-orders'],
  });

  await expect.element(page.getByText('Active orders')).not.toBeInTheDocument();
  await expect.element(page.getByText('Past orders')).toBeVisible();
});

test('hides past section when all orders are active', async () => {
  const testOrders: Order[] = [
    makeOrder({ id: 'o1', status: 'PLACED' }),
    makeOrder({ id: 'o2', status: 'PREPARING' }),
  ];

  renderRoute([{ path: '/my-orders', element: <MyOrdersContainer /> }], {
    initialData: { ...BASE_DATA, orders: testOrders },
    initialEntries: ['/my-orders'],
  });

  await expect.element(page.getByText('Active orders')).toBeVisible();
  await expect.element(page.getByText('Past orders')).not.toBeInTheDocument();
});

test('clicking order navigates to order page', async () => {
  renderRoute(
    [
      { path: '/my-orders', element: <MyOrdersContainer /> },
      {
        path: '/orders/:orderId',
        element: <div>Order detail page</div>,
      },
    ],
    {
      initialData: {
        ...BASE_DATA,
        orders: [makeOrder({ id: 'order-nav-test', status: 'PLACED' })],
      },
      initialEntries: ['/my-orders'],
    },
  );

  await page
    .getByRole('button', { name: restaurants.restaurantBurgerPalace.name })
    .click();

  await expect.element(page.getByText('Order detail page')).toBeVisible();
});

test('orders sorted by creation date descending', async () => {
  const now = Date.now();
  const testOrders: Order[] = [
    makeOrder({ id: 'o-old', status: 'PLACED', createdAt: now - 3000 }),
    makeOrder({ id: 'o-new', status: 'PLACED', createdAt: now }),
    makeOrder({ id: 'o-mid', status: 'PLACED', createdAt: now - 1000 }),
  ];

  renderRoute([{ path: '/my-orders', element: <MyOrdersContainer /> }], {
    initialData: { ...BASE_DATA, orders: testOrders },
    initialEntries: ['/my-orders'],
  });

  await expect.element(page.getByText('Active orders')).toBeVisible();

  const buttons = page.getByRole('button').elements();
  const orderButtons = buttons.filter((el) =>
    el.closest('[class*="flex w-full"]'),
  );
  expect(orderButtons.length).toBe(3);
});
