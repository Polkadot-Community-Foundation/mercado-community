# Order

## Description

Represents a single order of a customer at a restaurant

## Data

Orders have the following data in smart contract:

- id
- customerId
- restaurantId
- selection: collection of selected dishes and their options
- totalPrice
- status:
  - PLACED
  - CONFIRMED
  - PREPARING
  - READY_FOR_PICKUP
  - COMPLETED
  - CANCELED
- matchmakerId (optional): ID of the matchmaker who referred this order
- matchmakerFeeSnapshot (optional): Fee percentage in basis points at time of order
- matchmakerFeeAmount (optional): Calculated fee amount for the matchmaker

### Matchmaker Fields

When an order is placed through a matchmaker referral:

1. `matchmakerId` is set to the matchmaker's ID
2. `matchmakerFeeSnapshot` captures the matchmaker's fee percentage at order time
3. `matchmakerFeeAmount` stores the calculated fee: `(subtotal * feeBps) / 10000`

These fields are immutable after order placement, ensuring fee changes don't affect existing orders.

## Lifecycle

- Orders are placed by customers
- Following state transitions are performed by the restaurant
  - PLACED -> CONFIRMED
  - CONFIRMED -> PREPARING
  - PREPARING -> READY_FOR_PICKUP
  - \<any state\> -> CANCELED
- Following state transitions are performed by the customer:
  - READY_FOR_PICKUP -> COMPLETED
  - \<any state\> -> CANCELED
