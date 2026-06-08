# Deployment Guide

Deploy Mercado to Bulletin Chain with a DotNS domain.

## Quick Start

```bash
./scripts/deploy.sh
```

The interactive script will guide you through:
1. Installing dependencies
2. Building the project
3. Deploying to Bulletin Chain
4. Registering your DotNS domain

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **pnpm** - Installed automatically if missing
- **bulletin-deploy** - Installed automatically if missing
- **Funded wallet** - You need PAS tokens for deployment

### Getting Testnet Tokens

Get free PAS tokens from the [Polkadot Faucet](https://faucet.polkadot.io):
1. Select "Paseo" network
2. Select "Asset Hub" parachain
3. Enter your wallet address
4. Request tokens

## Deployment Options

### Interactive Mode (Recommended)

```bash
./scripts/deploy.sh
```

The script will prompt for:
- **Domain**: Your DotNS domain (default: `mercado.dot`)
- **Mnemonic**: Your wallet's 12-word seed phrase (not stored)

### With Environment Variables

```bash
MNEMONIC="your twelve word seed phrase here" \
DOTNS_DOMAIN="mydomain.dot" \
./scripts/deploy.sh
```

### Skip Build (Use Existing)

```bash
./scripts/deploy.sh --skip-build
```

### Command Line Domain

```bash
./scripts/deploy.sh --domain mydomain.dot
```

## After Deployment

Your app will be available at:
```
https://<your-domain>.dot.li
```

For example, if you deployed to `myapp.dot`:
```
https://myapp.dot.li
```

## Troubleshooting

### "Insufficient balance"

Your wallet needs PAS tokens. Get them from the [faucet](https://faucet.polkadot.io).

### "Domain already registered"

The domain is taken. Choose a different domain name.

### Build fails

1. Delete `node_modules` and try again:
   ```bash
   rm -rf node_modules
   ./scripts/deploy.sh
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

## Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Install dependencies
pnpm install

# 2. Build
pnpm build

# 3. Deploy (adjust dist path for your project)
MNEMONIC="your seed phrase" bulletin-deploy ./apps/web/dist mydomain.dot
```

## Security Notes

- Your mnemonic is used only to sign the deployment transaction
- It is never stored, logged, or transmitted anywhere except to the blockchain
- Use a dedicated deployment wallet, not your main holdings wallet
