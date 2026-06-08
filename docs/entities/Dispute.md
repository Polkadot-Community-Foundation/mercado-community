# Dispute

## Description

Represents a dispute raised by a customer or restaurant regarding a completed order. Disputes involve evidence submission, optional counter-evidence, staking by both parties, and resolution by an admin/jury.

## Data

Disputes have the following data in smart contract:

- id
- orderId: reference to the disputed order
- customerId: the customer involved
- restaurantId: the restaurant involved
- initiator: 'customer' | 'restaurant' - who raised the dispute
- status:
  - OPEN
  - RESOLVED
- verdict:
  - PENDING
  - CUSTOMER_WINS
  - RESTAURANT_WINS

### Evidence (stored as Bulletin Chain CIDs)

- initiatorEvidenceCID: CID of initiator's evidence metadata JSON
- counterEvidenceCID: CID of challenger's counter-evidence metadata JSON (optional)

### Staking

- initiatorStake: amount staked by dispute initiator (bigint)
- challengerStake: amount staked by challenger when adding counter-evidence (bigint)
- faultAccepted: boolean - true if challenger accepted fault without counter-evidence

### Timestamps

- createdAt: when dispute was raised
- resolvedAt: when dispute was resolved (optional)

## Evidence Metadata Structure

Evidence is stored on Bulletin Chain as JSON with the following structure:

```typescript
{
  version: "1.0",
  title: string,
  description: string,
  disputeType?: DisputeReason,  // Only for customer-initiated disputes
  photos?: string[],            // Array of CIDs for uploaded photos
  submittedBy: 'customer' | 'restaurant',
  timestamp: number
}
```

## Dispute Reasons (customer-initiated)

- wrong_items: Received different items than ordered
- incomplete_order: Missing items from the order
- food_quality: Food was cold, spoiled, or poor quality
- not_ready: Order was not ready at specified time
- other: Other issues

## Lifecycle

### Initiation

- Customer can raise dispute within 24 hours of order completion (COMPLETED status)
- Initiator must stake the required amount
- Evidence (title, description, photos) uploaded to Bulletin Chain
- Order is linked to dispute via disputeId

### Response (within 24 hours of dispute creation)

- Challenged party (restaurant or customer) can:
  - **Add counter-evidence**: Stake equal amount, upload counter-evidence to Bulletin
  - **Accept fault**: No stake required, dispute auto-resolves in initiator's favor

### Resolution

- If no response within 24 hours: initiator wins by default
- If counter-evidence submitted: admin/jury reviews within 72 hours
- Admin issues verdict: CUSTOMER_WINS or RESTAURANT_WINS

### Settlement

- Winner receives:
  - Original order amount (refund if customer, payment if restaurant)
  - Both parties' stakes
- Loser forfeits their stake

## State Transitions

```
[Order COMPLETED]
       |
       v (customer raises dispute, stakes)
    [OPEN]
       |
       +---> (24h timeout, no response) ---> [RESOLVED: CUSTOMER_WINS]
       |
       +---> (restaurant accepts fault) ---> [RESOLVED: CUSTOMER_WINS]
       |
       +---> (restaurant adds counter-evidence, stakes)
       |            |
       |            v (admin reviews)
       |     [RESOLVED: CUSTOMER_WINS or RESTAURANT_WINS]
       |
       v
   [Winner claims resolution]
```
