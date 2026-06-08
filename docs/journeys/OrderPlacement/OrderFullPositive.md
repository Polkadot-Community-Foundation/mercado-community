# Restaurant selection

## The journey

- The customer opens the app
- The customer selects the available location from the dropdown (the values are all the locations set by the restaurants).
- The customer sees restaurants in the area
- The customer clicks on a restaurant
- The customer sees restaurant menu
- The customer clicks on a dish (a burger)
- The customer sees a modal, prompting to select custom options
- The customer selects "no bacon", and a 2 dollar "extra burger patty"
- The customer gets back to restaurant menu
- The customer taps checkout
- The customer sees order summary and total price
- The customer confirms order, signs the transaction, the money moved to escrow
- The restaurant accepts order (Order goes to CONFIRMED)
- The customer sees that the order was accepted
- The restaurant starts working on the order (Order goes to PREPARING)
- The customer sees that the order is being prepared
- The restaurant finishes the order (Order goes to READY_FOR_PICKUP)
- The customer sees that the order is ready
- The customer picks up the order, taps "I've picked up my order" in the app
- The order goes to COMPLETED, the money are released from the escrow and to the seller
