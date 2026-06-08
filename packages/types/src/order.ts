import type { OrderItem } from './order-item';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELED';

export type Order = {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: bigint;
  status: OrderStatus;
  canceledBy?: 'customer' | 'restaurant';
  createdAt: number;
  completedAt?: number;
  disputeId?: string;
  restaurantRating?: number; // 1-5 rating, undefined if not rated
  matchmakerId?: string;
  matchmakerFeeSnapshot?: number; // basis points at time of order
  matchmakerFeeAmount?: bigint;
  pickupCodeHash?: string; // keccak256(orderId, secret) - set when marked ready
};
