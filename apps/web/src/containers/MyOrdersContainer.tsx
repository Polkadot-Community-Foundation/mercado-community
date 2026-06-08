import { useNavigate } from 'react-router';

import { useCustomerOrders } from '../hooks';
import { CustomerOrderCard } from '../components';
import type { CustomerOrder } from '../contexts/DataContext/DataContext';

function sortByCreatedAtDesc(a: CustomerOrder, b: CustomerOrder): number {
  return b.order.createdAt - a.order.createdAt;
}

export function MyOrdersContainer() {
  const { orders } = useCustomerOrders();
  const navigate = useNavigate();

  const activeOrders = orders
    .filter(
      (co) => co.order.status !== 'COMPLETED' && co.order.status !== 'CANCELED',
    )
    .sort(sortByCreatedAtDesc);

  const pastOrders = orders
    .filter(
      (co) => co.order.status === 'COMPLETED' || co.order.status === 'CANCELED',
    )
    .sort(sortByCreatedAtDesc);

  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-text-tertiary">No orders made yet</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {activeOrders.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-text-secondary">
            Active orders
          </h3>
          <div className="flex flex-col gap-2">
            {activeOrders.map((co) => (
              <CustomerOrderCard
                key={co.order.id}
                restaurantName={co.restaurantName}
                totalPrice={co.order.totalPrice}
                status={co.order.status}
                itemCount={co.order.items.length}
                canceledBy={co.order.canceledBy}
                hasDispute={!!co.order.disputeId}
                onClick={() => navigate(`/orders/${co.order.id}`)}
              />
            ))}
          </div>
        </section>
      )}
      {activeOrders.length > 0 && pastOrders.length > 0 && (
        <hr className="border-light-border" />
      )}
      {pastOrders.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-text-secondary">
            Past orders
          </h3>
          <div className="flex flex-col gap-2">
            {pastOrders.map((co) => (
              <CustomerOrderCard
                key={co.order.id}
                restaurantName={co.restaurantName}
                totalPrice={co.order.totalPrice}
                status={co.order.status}
                itemCount={co.order.items.length}
                canceledBy={co.order.canceledBy}
                hasDispute={!!co.order.disputeId}
                onClick={() => navigate(`/orders/${co.order.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
