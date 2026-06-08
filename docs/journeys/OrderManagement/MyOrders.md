# My Orders

## The journey

- The customer opens the app
- The customer sees "My orders" button in header
- The customer clicks on that button and sees the list of all orders made; active first, past after a delimeter, sorted by creation date desc
- A counter on "My orders" button shows the number of active orders; it's hidden if no orders are active
- The customer creates a new order at some restaurant
- The customer sees that "My orders" has a counter now, showing active order
- The customer goes to "My orders" and sees the order in the list
- Orders in the list show the restaurant name, a number of items in the order, total sum and the order status

## Test cases

### Order links are correct

- Select customer.33 account
- Create an order at burgerpalace.1 (save the id of the order for later)
- Go to "My orders" page
- See newly created order in "active orders"
- Click on the order
- Validate that the route changed to /orders/<id>

### Order grouping, statuses and counters

#### stage 0

- Select customer.33 account
- Validate that the counter on "My orders" is absent
- Go to "My orders"
- See "No orders made yet" message

#### stage 1

- Create an order at burgerpalace.1 (save the id of the order for later)
- See that the counter on "My orders" shows "1" now
- Create an order at pizzacorner.2 restaurant
- See that the counter on "My orders" shows "2" now

#### stage 2

- Go to "My orders"
- See 2 orders in "Active orders" section
- See that "Past orders" section is absent
- Open order made in pizzacorner.2 restaurant and cancel it
- See that the counter on "My orders" shows "1" now
- Go to "My orders" and see that it shows pizzacorner.2 in "Past orders" with a status "Canceled by you"

#### stage 3

- Select burgerpalace.1 account
- Advance the order from stage 1 to "Ready for pickup" state

#### stage 4

- Select customer.33 account
- Go to "My orders"
- See that the order from stage 1 is in "Active orders" and shows "Ready for pickup" status
- Open the order, click "I've picked up the order"
- See that the counter in "My orders" disappeared
- Go to "My orders"
- See that both orders are displayed in "Past orders"
- See that "Active orders" section is absent
- See that the order from burgerpalace.1 shows "Completed" status
