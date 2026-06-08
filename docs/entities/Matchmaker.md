# Matchmaker Entity

## Overview

A **Matchmaker** is a referral partner who earns a fee on orders placed through their referral. Matchmakers register via the mm-portal app and receive a percentage of each order attributed to them.

## Data Structure

```typescript
type MatchMaker = {
  id: string;
  owner: string; // wallet address
  name: string;
  feePercentage: number; // basis points (100 = 1%, max 1000 = 10%)
  registeredAt: number; // timestamp
  active: boolean;
  feesAccumulated: bigint;
};
```

### Fields

| Field           | Type    | Description                                |
| --------------- | ------- | ------------------------------------------ |
| id              | string  | Unique identifier (auto-incremented)       |
| owner           | string  | Wallet address that owns the matchmaker    |
| name            | string  | Display name for the matchmaker            |
| feePercentage   | number  | Fee in basis points (100 = 1%, max 10%)    |
| registeredAt    | number  | Unix timestamp of registration             |
| active          | boolean | Whether the matchmaker is currently active |
| feesAccumulated | bigint  | Total unclaimed fees accumulated           |

## Fee Mechanics

### Basis Points

Fees are stored in **basis points (bps)** for precision:

- 1 basis point = 0.01%
- 100 basis points = 1%
- 500 basis points = 5%
- 1000 basis points = 10% (maximum)

### Fee Calculation

```typescript
feeAmount = (orderSubtotal * feePercentage) / 10000n;
totalPrice = orderSubtotal + feeAmount;
```

### Fee Snapshot

When an order is placed:

1. The current matchmaker fee percentage is **snapshotted** on the order
2. This ensures fee changes don't affect in-flight orders
3. The `matchmakerFeeSnapshot` field on Order stores this value

## Lifecycle

```
Registration → Active → Fee Updates → Order Attribution → Fee Accumulation → Claim
```

### 1. Registration

- Wallet owner registers via mm-portal
- Provides: name, initial fee percentage (0-10%)
- Receives: unique matchmaker ID
- Status: active = true

### 2. Fee Updates

- Owner can update fee percentage at any time
- Only affects future orders
- Existing orders retain their snapshotted fee

### 3. Order Attribution

- Orders include `matchmakerId` when placed via matchmaker referral
- Direct orders (no matchmaker) have `matchmakerId = undefined`
- Fee is calculated and stored on the order

### 4. Fee Accumulation

- When an order completes, the matchmaker fee is accumulated
- `feesAccumulated` increases by the order's `matchmakerFeeAmount`

### 5. Claiming Fees

- Owner can claim accumulated fees at any time
- Fees are transferred to specified wallet address
- `feesAccumulated` resets to 0

## Relationship to Orders

Order fields related to matchmakers:

```typescript
// On Order type
matchmakerId?: string;
matchmakerFeeSnapshot?: number; // basis points at order creation
matchmakerFeeAmount?: bigint; // calculated fee amount
```

## Contract: MercadoMatchmakers

The `MercadoMatchmakers.sol` contract is an extension contract (like MercadoRatings and MercadoDisputes):

### Write Methods

- `registerMatchMaker(name, feeBps)` - Register as matchmaker
- `updateMatchMakerFee(newFeeBps)` - Update fee percentage
- `recordOrderMatchMaker(orderId, mmId, feeAmount)` - Link order to matchmaker
- `releaseMatchMakerFee(orderId)` - Accumulate fee on order completion
- `claimMatchMakerFees(toAddress)` - Claim accumulated fees

### Read Methods

- `getMatchMaker(id)` - Get matchmaker by ID
- `isMatchMakerRegistered(address)` - Check if address is registered
- `getMatchMakerIdByOwner(address)` - Get ID by owner address
- `getMatchMakerFees(id)` - Get accumulated fees
- `getTotalMatchMakers()` - Get total count

### Events

- `MatchMakerRegistered(id, owner, name, feePercentage)`
- `MatchMakerFeeUpdated(id, oldFee, newFee)`
- `OrderMatchMakerRecorded(orderId, matchmakerId, feeAmount)`
- `MatchMakerFeeReleased(matchmakerId, orderId, amount)`
- `MatchMakerFeesClaimed(id, to, amount)`

## Default Matchmaker

The platform has a default matchmaker (ID: "1") named "Mercado" with a 5% fee. This is used for orders placed through the main marketplace without a specific referral.

## Price Breakdown

When displaying prices to users, the checkout shows:

```
Subtotal:     $10.00
Platform fee (5%): $0.50
Total:        $10.50
```

The `calculatePriceBreakdown` utility handles this calculation.
