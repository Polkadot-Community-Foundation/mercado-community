# Dish

## Description

Represents a dish at a restaurant.

Dish can have special options. Each is a boolean, either enabled or not.
They can be fee, or cost extra.
For example, a burger can have

- "No bacon" option, which is free
- "Extra bacon" option, which costs a dollar
  Becuase these options are boolean, you can't stack it and have 99 extra bacon in your burger.

## Data

Dishes have the following data in the smart contract:

- restaurantId
- inStock: a toggle, allowing restaurants to make the dish available
- basePrice
- options: a collection of custom options created for this dish. They have
  - id
  - price (can be free)

Dishes have the following data in bulletin:

- photo of the dish, stored individually

**Restaurant metadata** references following data of Dishes in bulletin:

- description of dish
- descriptions of all options, available for selection
- CIDs of aforementioned photos

## Lifecycle

- Dishes are created and controlled by restaurants
