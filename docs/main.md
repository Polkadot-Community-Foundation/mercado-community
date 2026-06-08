# Mercado

Mercado is a web3 food delivery app that runs in the Polkadot Triangle.

While currently focued on being a demo prototype, it will later use Polkadot infrastructure for running smart contracts, interacting with proof-of-personhood, using MobRule for disputes and pUSD for currency.  
Currently courier delivery is not supported (only pickups).

Project plan:

- Stage A1: demo the customer-facing part of the client-side app. Not implementing any restaurant journeys, all data is fake, not interacting with any smart contracts yet
- Stage A2: implement basic restaurant journeys, still with fake data
- Stage B1 (current): impelment triangle host integration.
- Stage B2: implement the smart contract flow. All the journeys are now connected via smart contracts. No pUSD integration yet. No MobRule integration yet.
- Stage C: MobRule and pUSD integration is implemented.

## Entities

`entities/` subdirectory describes all business entities, what data represents them, what sources of truth that data comes from
Every entity must describe its lifecycle: how it's created, what states can it be, possibly the state transitions

## Users

`users.md` describes all actors that use the application, their goals and requirements

## Journeys

Free text descriptions of user journeys in the application. This defines all the core logic of the application.  
Each user journey has a testplan, which serves as a basis for packages/e2e tests
