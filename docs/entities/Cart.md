# Cart

## Description

Cart a not yet placed order

## Data

Cart is a client device-only entity, not having any external storage.
Cart state is defined by:

- selected restaurantId, initually null
- orderItems: each item represents a

- restaurantId
- inStock: a toggle, allowing restaurants to make the dish available
- basePrice
- options: a collection of custom options created for this dish. They have
  - id
  - price (can be free)

Dishes have the following data in bulletin:

- photos of the dish, stored individually

**Restaurant metadata** references following data of Dishes in bulletin:

- description of dish
- descriptions of all options, available for selection
- CIDs of aforementioned photos

## Lifecycle

- Dishes are created and controlled by restaurants
