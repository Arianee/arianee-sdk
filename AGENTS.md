# AGENTS.md

<!--
  This file is the AI entry point for this repository.
  Keep it up to date — agents rely on it to understand the project.
  See: https://github.com/Arianee/arianee-knowledge-base/blob/main/templates/AGENTS-GUIDELINES.md
-->

## Overview

The Arianee SDK is a **Nx monorepo** containing all the client-side packages for the Arianee ecosystem. It provides libraries for wallet management, smart asset creation, protocol interaction, privacy features, and more. These packages are published to npm under the `@arianee` scope.

## Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | Nx monorepo |
| Runtime | Node.js 18+ |
| Package manager | npm |
| Smart contracts | ethers.js |
| Privacy | snarkjs, circomlib (zk-SNARKs) |

## Architecture

```
packages/              # Published npm libraries
├── core/              # Core SDK (signMessage, signTx, etc.)
├── wallet/            # Wallet functionalities
├── wallet-abstraction/ # Wallet abstraction layer
├── wallet-api-client/ # Client for Wallet API
├── arianee-api-client/ # Client for Arianee APIs
├── arianee-protocol-client/ # On-chain protocol interaction
├── arianee-privacy-gateway-client/ # Privacy gateway client
├── arianee-access-token/ # Access token management
├── creator/           # Smart asset creation/management
├── token-provider/    # SST generation for brands
├── service-provider/  # SST usage for service providers
├── permit721-sdk/     # Permit721 contract interaction
├── privacy-circuits/  # zk-SNARK circuits
├── common-types/      # Shared type definitions
└── utils/             # Shared utilities

apps/                  # Example/demo applications
├── arianee-sdk-example/
├── arianee-react-wallet/
├── angular-wallet/
├── angular-creator/
└── poc-sst/
```

## Dependencies

### Depends on
- `@arianee/arianee-abi` — ABI definitions
- `@arianee/contracts` — Contract types
- `@arianee/permit721-contracts` — Permit721 contract types
- Arianee Wallet API (remote service)
- Arianee Privacy Gateway (remote service)
- Arianee Protocol (on-chain)

### Depended on by
- ArianeeBrandDataHub
- Product pages (deee-product-page, product-page-v2, AwesomeProductPage)
- Any Arianee client application
<!-- TODO: needs human input — complete list of consumers -->

## Deployment

This is a **library monorepo** — packages are published to npm, not deployed as services.

| Target | Method |
|--------|--------|
| npm registry | `npm run publish:all` (via `scripts/publish.sh`) |

### CI/CD
- **CircleCI** — builds, lints, and tests all packages
- Node.js 18.16.0

## Configuration

No env vars needed for library development.

## Development

### Setup
```bash
git clone https://github.com/Arianee/arianee-sdk.git
cd arianee-sdk
npm install
```

### Common commands
```bash
npm run build:all          # Build all packages
npm run test:all           # Test all packages
npm run lint:all           # Lint all packages
npm run dev                # Serve SDK example app
npm run build:wallet       # Build a single package
npm run test:wallet        # Test a single package
```

### Per-package builds
```bash
nx build <package-name>    # e.g. nx build core
nx test <package-name>
```

## Conventions

- Each package has its own README with specific build/test instructions
- Packages are scoped under `@arianee/`
- Versioning via `scripts/bump.sh`

## Ownership

| Role | Team / Person |
|------|--------------|
| Squad | <!-- TODO: needs human input --> |
| Main contributors | <!-- TODO: needs human input --> |

## Known issues / Tech debt

<!-- TODO: needs human input -->
