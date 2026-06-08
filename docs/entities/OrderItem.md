# OrderItem

## Description

OrderItems represent order contents.
Each OrderItem is a dish of a restaurant, with particular options selected.
OrderItems belong either to Orders or to Cart

## Data

OrderItems have following data (either stored on smart contract in case for Order, or on the customer's device in case of Cart):

- dishId
- optionIds selected

## Lifecycle

OrderItems live inside Order or Cart and thus share the lifecycle.
