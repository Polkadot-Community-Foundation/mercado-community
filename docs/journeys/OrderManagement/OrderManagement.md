# Order management

## The journey

- The restaurant goes to restaurant portal
- The restaurant sees orders section with badges for all statuses: "1 new", "2 confirmed", "3 preparing", "2 ready for pickup", "1300 completed", "200 canceled"
- Below that, the restaurant sees two tabs with order cards, one for active orders (not completed or canceled), grouped by status, another is for past orders (in completed or canceled status), grouped by date
- The restaurant clicks on an order card
- A modal with the order opens, displaying order id, all order contents, as well as the username of the customer
- In the modal, there are two buttons, one for transitioning the order further, another for canceling order
- After clicking any of the buttons, order transitions into respective state, and the modal closes. Clicking on the order cancelation button will also prompt a confirmation.

## Test cases

### Positive route

#### stage 0

- Select burgerpalace.1 account
- Go to the restaurant portal
- See zero new orders (both in the badge count and in the list)

#### stage 1

- Select customer.33 account
- Create an order at burgerpalace.1 (save the id of the order for later)

#### stage 2

- Select burgerpalace.1 account
- Go to the restaurant portal
- The new orders badge should display 1
- The list of active orders should display one new order from customer.33
- Click on the order
- Validate in the modal that order contents, the customer username and the total price are displayed correctly
- Click "Confirm order"
- Expect the modal to close
- See that the order in the list has changed status to "confirmed"

#### stage 3

- Click on the order
- Click "Preparing order" in the modal
- Expect the modal to close
- See that the order in the list has changed status to "preparing"

#### stage 4

- Click on the order
- Click "Order is ready for pickup" in the modal
- Expect the modal to close
- See that the order in the list has changed status to "ready for pickup"

#### stage 5

- Select customer.33 account
- Go to the order page (using the id saved before)
- Validate that the order status is "ready for pickup"
- Click "I've picked up my order"

#### stage 6

- Select burgerpalace.1 account
- See one completed order in both the badge and in the past orders list
- Click on the order
- Modal should open
- Modal should display order id, contents, customer's username and total price, but not the buttons for advancing order status

### Order cancellation

#### Customer cancellation

- Repeat stage 0 from "Positive route"
- Select customer.33 account
- Open order using the saved id
- Click "Cancel order"
- Verify that a confirmation was required; confirm

- Select burgerpalace.1 account
- Go to the restaurant portal
- See one canceled order
- Click on the order
- Modal should display that the order is canceled **by the customer**

#### Restaurant cancellation

- Repeat stage 0 from "Positive route"
- Select burgerpalace.1 account
- Go to the restaurant portal
- See one new order in the list
- Open order
- Cancel order in the modal
- Verify that a confirmation was required; confirm
- In orders list, it should state that the order is canceled
- Click on the order
- Modal should display that the order is canceled \*_by the restaurant_
