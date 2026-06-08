# Admin Resolves Dispute

## The journey

- A dispute has counter-evidence from both parties
- An admin opens the MockMobRule admin panel
- The admin sees a list of pending cases
- The admin opens a case to review evidence
- The admin sees customer evidence and restaurant counter-evidence side-by-side
- The admin issues a verdict: "Customer Wins" or "Restaurant Wins"
- The dispute is resolved and escrow is released accordingly

## Test cases

### View pending cases

- Open MockMobRule admin panel
- Validate dashboard shows:
  - Total cases count
  - Pending cases count
  - Resolved cases count
- Validate case list shows all disputes with counter-evidence
- Validate each case shows: order ID, initiator, status, created date

### Review case evidence

- Have a dispute with both initiator and counter-evidence
- Open case in admin panel
- Validate customer evidence section shows:
  - Title
  - Description
  - Dispute reason/type
  - Photos (clickable to view full size)
  - Submitted timestamp
- Validate restaurant evidence section shows:
  - Title
  - Description
  - Photos
  - Submitted timestamp
- Validate stake information shows:
  - Initiator stake amount
  - Challenger stake amount

### Resolve in customer's favor

- Open a pending case
- Review evidence
- Click "Customer Wins" button
- See confirmation dialog: "Customer will receive refund + all stakes"
- Click "Confirm"
- Validate case status changes to "RESOLVED"
- Validate verdict shows "CUSTOMER_WINS"
- Validate case moves to resolved section

### Resolve in restaurant's favor

- Open a pending case
- Review evidence
- Click "Restaurant Wins" button
- See confirmation dialog: "Restaurant will receive payment + all stakes"
- Click "Confirm"
- Validate case status changes to "RESOLVED"
- Validate verdict shows "RESTAURANT_WINS"

### Cannot resolve case without counter-evidence

- Have a dispute where restaurant hasn't responded yet
- Open admin panel
- Validate case shows "Waiting for response" status
- Validate resolve buttons are disabled
- Or case doesn't appear in actionable list

### Auto-resolved cases appear in history

- Have a dispute that auto-resolved (24h timeout, no response)
- Open admin panel
- Validate case appears in resolved section
- Validate verdict shows "CUSTOMER_WINS" (auto)
- Validate cannot change verdict (already resolved)

### Resolved disputes trigger settlement

- Resolve a dispute in customer's favor
- Validate (in main app) customer can claim resolution
- Customer clicks "Claim" button
- Validate customer receives:
  - Order refund amount
  - Their original stake back
  - Restaurant's stake

### Admin cannot access without wallet

- Open admin panel without wallet connected
- Validate "Connect Wallet" prompt is shown
- Validate cannot view cases until connected

### Filter cases by status

- Have mix of open and resolved cases
- Open admin panel
- Validate can filter by "All", "Pending", "Resolved"
- Validate counts update correctly
