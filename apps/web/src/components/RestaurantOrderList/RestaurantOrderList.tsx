import type { Order, OrderStatus } from '../../types';
import { RestaurantOrderCard } from '../RestaurantOrderCard';

export type OrderGroup = {
  label: string;
  orders: Order[];
};

type RestaurantOrderListProps = {
  groups: OrderGroup[];
  emptyMessage?: string;
  onOrderClick: (orderId: string) => void;
};

export function RestaurantOrderList({
  groups,
  emptyMessage = 'No orders',
  onOrderClick,
}: RestaurantOrderListProps) {
  const hasOrders = groups.some((g) => g.orders.length > 0);

  if (!hasOrders) {
    return (
      <p className="py-8 text-center text-text-tertiary">{emptyMessage}</p>
    );
  }

  return (
    <>
      {groups.map((group) => {
        if (group.orders.length === 0) return null;
        return (
          <div key={group.label}>
            <h3 className="mb-2 text-sm font-semibold text-text-secondary">
              {group.label}
            </h3>
            <div className="flex flex-col gap-2">
              {group.orders.map((order) => (
                <RestaurantOrderCard
                  key={order.id}
                  orderId={order.id}
                  customerAddress={order.customerId}
                  totalPrice={order.totalPrice}
                  status={order.status}
                  itemCount={order.items.length}
                  canceledBy={order.canceledBy}
                  onClick={() => onOrderClick(order.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

const STATUS_BADGE_LABELS: Record<OrderStatus, string> = {
  PLACED: 'new',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready for pickup',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

const STATUS_ORDER: OrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
];

/**
 * Group orders by status in a predefined order.
 */
export function groupOrdersByStatus(orders: Order[]): OrderGroup[] {
  const grouped = new Map<OrderStatus, Order[]>();

  for (const order of orders) {
    const list = grouped.get(order.status) ?? [];
    list.push(order);
    grouped.set(order.status, list);
  }

  return STATUS_ORDER.map((status) => ({
    label: STATUS_BADGE_LABELS[status],
    orders: grouped.get(status) ?? [],
  }));
}

/**
 * Group orders by date (formatted as human-readable string).
 */
export function groupOrdersByDate(orders: Order[]): OrderGroup[] {
  const grouped = new Map<string, Order[]>();

  for (const order of orders) {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const list = grouped.get(dateStr) ?? [];
    list.push(order);
    grouped.set(dateStr, list);
  }

  return Array.from(grouped.entries()).map(([date, orderList]) => ({
    label: date,
    orders: orderList,
  }));
}
