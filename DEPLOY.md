# Deployment Guide

Deploy Mercado to the **Summit** network — the web app to Bulletin Chain under a
DotNS domain, and (separately) the smart contracts to Summit Asset Hub.

## Quick Start (web app)

```bash
./scripts/deploy.sh
```

The interactive script will guide you through:

1. Installing dependencies
2. Building the project (Summit config is baked in by default)
3. Deploying `apps/web/dist` to Summit Bulletin Chain via `polkadot-app-deploy`
4. Pointing your DotNS domain at the new content

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org)
- **pnpm** — installed automatically if missing
- **polkadot-app-deploy** — `@polkadot-community-foundation/polkadot-app-deploy@0.10.1`,
  installed automatically if missing
- **A Summit deployment account** — see below

### The Summit signing account (no public faucet)

Unlike a testnet, Summit has **no faucet**. The account that signs the deploy must:

- be **funded with SUM** on Summit Asset Hub,
- be **Bulletin storage-authorized** (authorization is granted by the Summit Bulletin
  authorizer and expires ~every 14 days), and
- **own the DotNS domain** you are deploying to (or be authorized on its resolver).

Use a dedicated deployment wallet, not your main holdings wallet.

## Deployment Options (web app)

### Interactive Mode (Recommended)

```bash
./scripts/deploy.sh
```

Prompts for:

- **Domain**: your DotNS domain (default: `mercado.dot`)
- **Mnemonic**: the Summit deployment wallet seed phrase (not stored)

### With Environment Variables

```bash
MNEMONIC="your twelve word seed phrase here" \
DOTNS_DOMAIN="mercado.dot" \
./scripts/deploy.sh
```

### Skip Build (Use Existing)

```bash
./scripts/deploy.sh --skip-build
```

## CI deploy

`.github/workflows/deploy-summit.yml` builds and deploys to `mercado.dot` on push to
`main` (and via manual dispatch). It uses the `polkadot-app-deploy` reusable workflow
with `env: summit` and `direct-signer: true`, signing with the `SUMMIT_DEPLOYER_KEY`
repo secret. There are **no per-PR preview deploys** — on Summit each preview would be a
fresh DotNS registration with a ~14-day storage clock. PR validation (lint / typecheck /
tests) runs in `ci.yml`.

## After Deployment

Your app will be available at:

```
https://<your-domain>.dot.li
```

For example, `mercado.dot` → `https://mercado.dot.li`.

## Contracts (Summit Asset Hub)

The web app reads contract addresses from `VITE_*` env vars (see `.github/env`). Deploy
the contracts first, then fill those addresses in.

> **There is no public Summit eth-RPC.** Contract calls go through PAPI `ReviveApi` over
> the WSS endpoint (`wss://summit-asset-hub-rpc.polkadot.io`). Two deploy paths:

```bash
# A) PAPI / WSS path (no adapter needed) — recommended
MNEMONIC="..." pnpm --filter @mercado/contracts deploy:summit:papi

# B) Hardhat path — requires a local revive eth-rpc adapter exposing
#    http://localhost:8545 -> wss://summit-asset-hub-rpc.polkadot.io
SUMMIT_RPC_URL=http://localhost:8545 PRIVATE_KEY=0x... \
  pnpm --filter @mercado/contracts deploy:summit
```

After deploying, copy the emitted addresses into `.github/env` (uncomment the
`VITE_*_ADDRESS` lines) so the next web build is wired to the live Summit contracts.

## Troubleshooting

### "pool account N is not authorized"

The deploy tried to sign Bulletin storage with the public pool accounts, which are never
authorized on Summit. The CI workflow already passes `direct-signer: true`; for the CLI,
ensure you are signing with your authorized `MNEMONIC` (not `--suri`/pool mode).

### "Domain ... owned by a different account"

You're signing with the wrong key — the deploy must be signed by the DotNS name owner.

### Build fails

```bash
rm -rf node_modules && pnpm install && pnpm build
node --version   # should be 18+
```

## Manual Deployment (web app)

```bash
# 1. Install dependencies
pnpm install

# 2. Build (Summit config baked in via .github/env defaults)
pnpm build

# 3. Deploy
MNEMONIC="your seed phrase" \
  polkadot-app-deploy ./apps/web/dist mercado.dot --env summit
```

## Security Notes

- Your mnemonic is used only to sign the deployment transaction.
- It is never stored, logged, or transmitted anywhere except to the blockchain.
- Use a dedicated deployment wallet, not your main holdings wallet.
