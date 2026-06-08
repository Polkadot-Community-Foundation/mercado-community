# Customer Raises Dispute

## The journey

- The customer has a completed order (status: COMPLETED)
- The customer opens the order status page
- The customer sees "Something went wrong" button (within 24h of completion)
- The customer clicks the button and sees the dispute form
- The customer selects a dispute reason
- The customer enters a title and description
- The customer uploads evidence photos
- The customer sees the required stake amount
- The customer submits the dispute
- The dispute is created and linked to the order
- The customer sees the dispute status page

## Test cases

### Successful dispute submission

- Select customer.33 account
- Have a completed order (completedAt within last 24h)
- Navigate to /orders/{orderId}
- Click "Something went wrong" button
- Select reason: "wrong_items"
- Enter title: "Received wrong burger"
- Enter description: "I ordered a veggie burger but received a beef burger"
- Upload 1 photo
- See stake amount displayed (e.g., "5.00 pUSD")
- Click "Submit Dispute"
- Validate progress indicators show: "Uploading photos..." → "Creating dispute..." → "Success!"
- Validate redirect to dispute status page
- Validate dispute shows status "OPEN"
- Validate order now shows dispute indicator

### Cannot dispute after 24h window

- Select customer.33 account
- Have a completed order (completedAt more than 24h ago)
- Navigate to /orders/{orderId}
- Validate "Something went wrong" button is NOT visible
- Or if visible, clicking shows "Dispute window has expired" message

### Cannot dispute non-completed order

- Select customer.33 account
- Have an order with status PREPARING
- Navigate to /orders/{orderId}
- Validate "Something went wrong" button is NOT visible

### Validation - required fields

- Open dispute form
- Leave title empty
- Click submit
- Validate error: "Please enter a title"
- Fill title, leave description empty
- Click submit
- Validate error: "Please enter a description"

### Validation - photo limits

- Open dispute form
- Try to upload 6 photos
- Validate error: "Maximum 5 photos allowed"
- Upload a photo larger than 5MB
- Validate error: "Photo exceeds maximum size of 5 MB"

### View dispute after submission

- Submit a dispute
- Navigate to /orders/{orderId}
- Validate order shows "Disputed" status indicator
- Click to view dispute details
- Validate evidence (title, description, photos) is displayed
- Validate stake amount is shown
- Validate status shows "Waiting for restaurant response"

### Dispute appears in My Orders

- Submit a dispute
- Navigate to /my-orders
- Validate the disputed order shows a dispute badge/indicator
- Click on the order
- Validate can navigate to dispute details
