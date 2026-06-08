import { describe, expect, it } from 'vitest';

import type { Order } from '../../types';

import { groupOrdersByStatus, groupOrdersByDate } from './RestaurantOrderList';

const createOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  customerId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  restaurantId: 'rest-1',
  items: [{ dishId: 'dish-1', selectedOptionIds: [] }],
  totalPrice: 1000n,
  status: 'PLACED',
  createdAt: Date.now(),
  ...overrides,
});

describe('groupOrdersByStatus', () => {
  it('groups orders by their status in correct order', () => {
    const orders: Order[] = [
      createOrder({ id: '1', status: 'PREPARING' }),
      createOrder({ id: '2', status: 'PLACED' }),
      createOrder({ id: '3', status: 'CONFIRMED' }),
      createOrder({ id: '4', status: 'READY_FOR_PICKUP' }),
    ];

    const groups = groupOrdersByStatus(orders);

    expect(groups).toHaveLength(4);
    expect(groups[0].label).toBe('new');
    expect(groups[0].orders).toHaveLength(1);
    expect(groups[0].orders[0].id).toBe('2');

    expect(groups[1].label).toBe('confirmed');
    expect(groups[1].orders[0].id).toBe('3');

    expect(groups[2].label).toBe('preparing');
    expect(groups[2].orders[0].id).toBe('1');

    expect(groups[3].label).toBe('ready for pickup');
    expect(groups[3].orders[0].id).toBe('4');
  });

  it('returns empty arrays for statuses with no orders', () => {
    const orders: Order[] = [createOrder({ status: 'PLACED' })];

    const groups = groupOrdersByStatus(orders);

    expect(groups[0].orders).toHaveLength(1);
    expect(groups[1].orders).toHaveLength(0);
    expect(groups[2].orders).toHaveLength(0);
    expect(groups[3].orders).toHaveLength(0);
  });

  it('handles empty input', () => {
    const groups = groupOrdersByStatus([]);

    expect(groups).toHaveLength(4);
    groups.forEach((g) => expect(g.orders).toHaveLength(0));
  });

  it('groups multiple orders with same status', () => {
    const orders: Order[] = [
      createOrder({ id: '1', status: 'PLACED' }),
      createOrder({ id: '2', status: 'PLACED' }),
      createOrder({ id: '3', status: 'PLACED' }),
    ];

    const groups = groupOrdersByStatus(orders);

    expect(groups[0].orders).toHaveLength(3);
  });
});

describe('groupOrdersByDate', () => {
  it('groups orders by date string', () => {
    const jan1 = new Date('2024-01-01T12:00:00').getTime();
    const jan2 = new Date('2024-01-02T14:00:00').getTime();

    const orders: Order[] = [
      createOrder({ id: '1', createdAt: jan1 }),
      createOrder({ id: '2', createdAt: jan2 }),
      createOrder({ id: '3', createdAt: jan1 }),
    ];

    const groups = groupOrdersByDate(orders);

    expect(groups).toHaveLength(2);
    const jan1Group = groups.find((g) => g.label.includes('January 1'));
    const jan2Group = groups.find((g) => g.label.includes('January 2'));

    expect(jan1Group?.orders).toHaveLength(2);
    expect(jan2Group?.orders).toHaveLength(1);
  });

  it('handles empty input', () => {
    const groups = groupOrdersByDate([]);
    expect(groups).toHaveLength(0);
  });

  it('preserves order within same date group', () => {
    const sameDay = new Date('2024-01-15T12:00:00').getTime();

    const orders: Order[] = [
      createOrder({ id: 'first', createdAt: sameDay }),
      createOrder({ id: 'second', createdAt: sameDay + 1000 }),
      createOrder({ id: 'third', createdAt: sameDay + 2000 }),
    ];

    const groups = groupOrdersByDate(orders);

    expect(groups).toHaveLength(1);
    expect(groups[0].orders[0].id).toBe('first');
    expect(groups[0].orders[1].id).toBe('second');
    expect(groups[0].orders[2].id).toBe('third');
  });
});
