> [!WARNING]
> The following is a prototype, reference implementation, and proof-of-concept. This open source code is provided for research, experimentation, and developer education only. This code has not been audited, is actively experimental, and may contain bugs, vulnerabilities, or incomplete features. Use at your own risk.

# Mercado

Web3 food delivery platform built on Polkadot. Mercado enables decentralized food ordering with smart contract-based escrow payments, dispute resolution, and on-chain restaurant ratings.

## Features

- Customer food ordering with escrow-protected payments
- Restaurant portal for managing menus and orders
- Matchmaker system for delivery coordination
- On-chain dispute resolution via MobRule governance
- IPFS-based evidence storage on Bulletin Chain
- pUSD stablecoin payments via Polkadot Asset Hub

## Prerequisites

- Node.js 18+
- pnpm 10.x (`npm install -g pnpm`)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/paritytech/mercado.git
cd mercado

# Install dependencies
pnpm install

# Start development server (mock mode)
pnpm dev
```

Open http://localhost:5173

## Project Structure

```
mercado/
├── apps/
│   ├── web/                 # Main customer & restaurant application
│   ├── mm-portal/           # Matchmaker portal
│   └── mockmobrule-admin/   # Dispute resolution admin panel
├── packages/
│   ├── contracts/           # Solidity smart contracts (EVM on Polkadot)
│   ├── bulletin/            # Bulletin Chain integration (IPFS/evidence)
│   ├── types/               # Shared TypeScript types
│   ├── mocks/               # Mock data for development
│   └── core-hooks/          # Shared React hooks
└── docs/                    # Business logic documentation
```

## Development Commands

```bash
# Development
pnpm dev              # Start main web app
pnpm dev:admin        # Start admin panel
pnpm storybook        # Run Storybook for components

# Testing
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run end-to-end tests

# Code Quality
pnpm lint             # Check linting
pnpm format           # Fix formatting
pnpm typecheck        # TypeScript type checking

# Build
pnpm build            # Build all packages
pnpm build:web        # Build web app only
```

## Deploying

For deployment instructions, see [DEPLOY.md](./DEPLOY.md).

## Environment Configuration

Copy the example environment file and configure:

```bash
cp apps/web/.env.example apps/web/.env
# Edit .env with your contract addresses and settings
```

See `apps/web/.env.example` for all available configuration options.

## Data Layer

The app supports two data modes controlled by `VITE_USE_REAL_CONTRACTS`:

- **Mock mode (default):** All data is mocked for development
- **Real mode:** Interacts with deployed smart contracts

This is handled by `DataContext` which selects the appropriate hook implementations.

## Architecture

The web app follows a container/presenter pattern:

- `components/` - Presentational components (pure, with Storybook)
- `containers/` - Smart components (data fetching, business logic)
- `hooks/` - React hooks with mock/real implementations
- `pages/` - Route components

See `docs/` for detailed business logic documentation including entity definitions and user journeys.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test:unit && pnpm lint && pnpm typecheck`)
5. Commit your changes
6. Push to the branch
7. Open a Pull Request

## Security

Before deploying for real use cases, you are responsible for:

- Reviewing the code yourself — we publish a reference, not a hardened production build
- Checking that dependencies are up to date and free of known vulnerabilities
- Securing your own fork or deployment environment (keys, secrets, network configuration)
- Tracking the latest tagged releases/commits for security fixes; older releases are not backported (exceptions might apply)

For Parity's security disclosure process and Bug Bounty program, visit: https://parity.io/bug-bounty

## License

GPL-3.0 - see [LICENSE](./LICENSE) for details.
