# Restaurant Responds to Dispute

## The journey

- A customer has raised a dispute against one of the restaurant's orders
- The restaurant owner opens the restaurant portal
- The restaurant sees a notification badge for pending disputes
- The restaurant opens the Disputes tab
- The restaurant sees the incoming dispute with customer's evidence
- The restaurant chooses to either:
  - Add counter-evidence (with stake)
  - Accept fault (no stake, auto-resolve)
- The dispute status updates accordingly

## Test cases

### View incoming dispute

- Select burgerpalace.1 account (restaurant owner)
- Have an open dispute against this restaurant
- Navigate to /restaurant-portal
- Validate disputes badge shows count "1"
- Click on Disputes tab
- Validate dispute is listed with status "OPEN"
- Click on dispute to expand details
- Validate customer's evidence is visible (title, description, photos)
- Validate "Respond" and "Accept Fault" buttons are visible

### Add counter-evidence successfully

- Select burgerpalace.1 account
- Have an open dispute (within 24h response window)
- Navigate to dispute in restaurant portal
- Click "Respond" button
- See counter-evidence form
- Enter title: "Order was correct"
- Enter description: "The order was prepared exactly as requested. Photos show the correct items."
- Upload 2 photos
- See stake amount required (equal to customer's stake)
- Click "Submit Response"
- Validate progress: "Uploading photos..." → "Submitting counter-evidence..." → "Success!"
- Validate dispute now shows "Under Review" status
- Validate both evidences are visible (customer and restaurant)

### Accept fault

- Select burgerpalace.1 account
- Have an open dispute
- Navigate to dispute in restaurant portal
- Click "Accept Fault" button
- See confirmation dialog: "Are you sure? This will resolve the dispute in the customer's favor."
- Click "Confirm"
- Validate dispute status changes to "RESOLVED"
- Validate verdict shows "CUSTOMER_WINS"
- Validate no stake was required from restaurant

### Cannot respond after 24h window

- Select burgerpalace.1 account
- Have an open dispute (createdAt more than 24h ago)
- Navigate to dispute in restaurant portal
- Validate "Respond" button is disabled or not visible
- Validate message: "Response window expired"
- Validate dispute shows as auto-resolved in customer's favor

### Validation - counter-evidence required fields

- Open counter-evidence form
- Leave title empty
- Click submit
- Validate error: "Please enter a title"

### Disputes tab shows correct counts

- Have 2 open disputes and 1 resolved dispute
- Navigate to restaurant portal Disputes tab
- Validate "Open" section shows 2 disputes
- Validate "Resolved" section shows 1 dispute
- Validate badge in header shows "2" (only open disputes)

### Restaurant cannot dispute their own order

- This is a customer-initiated flow only for MVP
- Restaurants respond to disputes, they don't initiate them
