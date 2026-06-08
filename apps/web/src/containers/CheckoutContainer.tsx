import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useCart, useRestaurant, usePlaceOrder, useMatchMaker } from '../hooks';
import { CartSummary } from '../components';
import {
  resolveOrderItem,
  resolveOrderTotal,
  validateCartItems,
  calculatePriceBreakdown,
} from '../lib';

export function CheckoutContainer() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { restaurant, isLoading: isRestaurantLoading } = useRestaurant(
    cart.restaurantId ?? '',
  );
  const { placeOrder } = usePlaceOrder();
  // Default matchmaker (Mercado official)
  const { matchMaker } = useMatchMaker('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute values (safe even when restaurant is null)
  const subtotal = restaurant
    ? resolveOrderTotal(cart.items, restaurant)
    : BigInt(0);
  const { total } = calculatePriceBreakdown(
    subtotal,
    matchMaker?.feePercentage,
  );

  // Early return narrows restaurantId to string for rest of component
  if (!cart.restaurantId || cart.items.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">Your cart is empty.</p>
    );
  }

  const restaurantId = cart.restaurantId;

  if (isRestaurantLoading) {
    return (
      <p className="py-12 text-center text-gray-500">Loading checkout...</p>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">
          Unable to load restaurant. It may have been removed.
        </p>
        <button
          type="button"
          onClick={() => {
            clearCart();
            navigate('/');
          }}
          className="text-brand hover:text-brand-dark transition-colors"
        >
          Return to restaurants
        </button>
      </div>
    );
  }

  const resolvedItems = cart.items.map((item) =>
    resolveOrderItem(item, restaurant),
  );
  const { feePercentage, feeAmount } = calculatePriceBreakdown(
    subtotal,
    matchMaker?.feePercentage,
  );
  const { valid: cartValid, errorMessage: staleItemError } = validateCartItems(
    cart.items,
    restaurant,
  );

  const handleConfirm = async () => {
    if (!cartValid) {
      setError(staleItemError);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const orderId = await placeOrder(restaurantId, cart.items, total);
      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  return (
    <CartSummary
      items={resolvedItems}
      subtotal={subtotal}
      feeAmount={feeAmount}
      feePercentage={feePercentage}
      total={total}
      restaurantName={restaurant.name}
      onConfirm={handleConfirm}
      isLoading={isSubmitting}
      error={error || staleItemError}
      disabled={!cartValid}
    />
  );
}
