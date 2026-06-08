import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { OrderItem } from '@mercado/types';

type CartState = {
  restaurantId: string | null;
  items: OrderItem[];
};

type CartContextValue = {
  cart: CartState;
  addItem: (
    restaurantId: string,
    dishId: string,
    selectedOptionIds: string[],
  ) => void;
  clearCart: () => void;
  cartItemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: CartState = { restaurantId: null, items: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);

  const addItem = useCallback(
    (restaurantId: string, dishId: string, selectedOptionIds: string[]) => {
      setCart((prev) => {
        const items = prev.restaurantId === restaurantId ? prev.items : [];

        return {
          restaurantId,
          items: [...items, { dishId, selectedOptionIds }],
        };
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem,
      clearCart,
      cartItemCount: cart.items.length,
    }),
    [cart, addItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('CartProvider is required');
  return ctx;
}
