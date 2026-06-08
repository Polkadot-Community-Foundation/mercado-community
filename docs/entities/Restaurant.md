# Restaurant

## Description

Represents a restaurant

## Data

Restaurants have the following data in smart contract:

- id
- owner
- dishes
- orders
- location: currently, a city, just a simple string
- isOpen: a manual switch, telling if the restaurant accepts new orders
- metadataCID: CID of "restaurant metadata", explained below

Restaurants have the following data in bulletin:

- Restaurant avatar, stored individually
- "Restaurant metadata", a one file with following contents:
  - All dishes served by the restaurant (see Dish.md)
    - If a dish is not listed in the metadata, it won't be displayed in the listing
    - It's an ordered array of dish ids
  - Restaurant description
  - CID of the restaurant avatar

## Lifecycle

- Restaurants are registered by anyone (creator becomes the owner)
- Restaurant owner can switch isOpen switch
- Restaurant owner can update metadata
