import { expect, test, vi } from 'vitest';
import { page } from '@vitest/browser/context';
import { restaurants, orders, accounts } from '@mercado/mocks';
import type { Order } from '@mercado/types';

import { renderRoute } from '../test-utils/render';

import { OrderStatusContainer } from './OrderStatusContainer';

const TEST_DATA = {
  locations: ['New York'],
  restaurants: [restaurants.restaurantBurgerPalace],
  orders: [orders.orderPlaced],
};

function renderOrder(order: Order) {
  return renderRoute(
    [{ path: '/orders/:orderId', element: <OrderStatusContainer /> }],
    {
      initialData: { ...TEST_DATA, orders: [order] },
      initialEntries: [`/orders/${order.id}`],
    },
  );
}

test('shows order status with stepper', async () => {
  renderOrder(orders.orderPlaced);

  await expect.element(page.getByText('Order Status')).toBeVisible();
  await expect
    .element(page.getByText(restaurants.restaurantBurgerPalace.name))
    .toBeVisible();
});

test('shows pickup button when ready', async () => {
  const readyOrder: Order = {
    ...orders.orderPlaced,
    status: 'READY_FOR_PICKUP',
  };
  renderOrder(readyOrder);

  await expect
    .element(page.getByRole('button', { name: /Confirm Pickup/i }))
    .toBeVisible();

  // Order without pickupCodeHash completes without code (legacy support)
  await page.getByRole('button', { name: /Confirm Pickup/i }).click();
  await expect.element(page.getByText('Completed')).toBeVisible();
});

test('customer can cancel an order', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);

  renderRoute(
    [{ path: '/orders/:orderId', element: <OrderStatusContainer /> }],
    {
      initialData: {
        ...TEST_DATA,
        activeAccount: accounts.alice,
      },
      initialEntries: [`/orders/${orders.orderPlaced.id}`],
    },
  );

  await expect.element(page.getByText('Order Status')).toBeVisible();
  await page.getByRole('button', { name: /Cancel order/i }).click();
  await expect
    .element(page.getByText('You have cancelled the order'))
    .toBeVisible();
});

test('shows not found for unknown order', async () => {
  renderRoute(
    [{ path: '/orders/:orderId', element: <OrderStatusContainer /> }],
    {
      initialData: TEST_DATA,
      initialEntries: ['/orders/unknown-id'],
    },
  );

  await expect.element(page.getByText('Order not found.')).toBeVisible();
});
