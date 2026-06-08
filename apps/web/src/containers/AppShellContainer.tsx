import { useLocation } from 'react-router';

import { useAccountInfo, useCustomerOrders } from '../hooks';
import { useCart } from '../contexts/CartContext';
import { AppShell } from '../components';

export function AppShellContainer() {
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const { cartItemCount } = useCart();
  const { account, restaurantId } = useAccountInfo();
  const isAuthenticated = account !== null;
  const isCustomer = restaurantId === null;
  const { orders: customerOrders } = useCustomerOrders();
  const activeOrderCount =
    isAuthenticated && isCustomer
      ? customerOrders.filter(
          (co) =>
            co.order.status !== 'COMPLETED' && co.order.status !== 'CANCELED',
        ).length
      : 0;

  return (
    <AppShell
      isLanding={isLanding}
      cartItemCount={cartItemCount}
      isCustomer={isCustomer}
      isAuthenticated={isAuthenticated}
      activeOrderCount={activeOrderCount}
    />
  );
}
