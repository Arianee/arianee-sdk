# Arianee SDK Monorepo

## Overview

Welcome to the Arianee SDK monorepo, an extensive collection of packages designed for the Arianee ecosystem. Managed with Nx, this monorepo streamlines the development and maintenance of the Arianee project, ensuring seamless integration and consistent quality across all components.

## Packages

This monorepo contains a variety of packages, each tailored for specific functionalities within the Arianee ecosystem. Key packages include:

- [@arianee/core](packages/core): Core functionalities of the Arianee SDK (signMessage, signTx, etc.)
- [@arianee/wallet](packages/wallet): A package dedicated to wallet functionalities in the Arianee ecosystem.
- [@arianee/wallet-abstraction](packages/wallet-abstraction): Focuses on wallet abstraction layers for the Arianee project.
- [@arianee/wallet-api-client](packages/wallet-api-client): A client package for interacting with Arianee's Wallet API.
- [@arianee/arianee-api-client](packages/arianee-api-client): A client package for interacting with various APIs.
- [@arianee/arianee-protocol-client](packages/arianee-protocol-client): A client package for interacting on-chain with the Arianee protocol.
- [@arianee/arianee-privacy-gateway-client](packages/arianee-privacy-gateway-client): A package for handling smart asset privacy-related functionalities through the Arianee privacy gateway.
- [@arianee/arianee-access-token](packages/arianee-access-token): A package dedicated to Arianee access token management.
- [@arianee/creator](packages/creator): A package designed for smart assets management within the Arianee ecosystem.
- [@arianee/token-provider](packages/token-provider): Package used by smart assets providers (i.e brands) to generate SSTs for service (utility) providers.
- [@arianee/service-provider](packages/service-provider): Package used by service (utility) providers to use SSTs in order to get smart asset content or to transfer a smart asset.
- [@arianee/permit721-sdk](packages/permit721-sdk): Utility package used to interact with the Permit721 contracts.
- [@arianee/common-types](packages/common-types): Contains common type definitions used across the Arianee project.
- [@arianee/utils](packages/utils): Provides essential utility functions and tools required across the Arianee project.

_For more detailed information about each package, please refer to their individual README files. These documents provide specific instructions on building, testing, and implementing the functionalities of each package._

## Development and Testing

### Installation

Run the following command to install all dependencies:

```bash
npm install
```

### Build

Run the following command to build all packages:

```bash
npm run build:all
```

### Tests

Run the following command to run all tests:

```bash
npm run test:all
```

### Publish

Before publishing your changes of the arianee-sdk repository, please follow these steps to ensure version consistency across all packages.
This will make it easier to update an app using the arianee-sdk in order to add new features or fix bugs.

- Bump the version for all packages by running:

```bash
npm run bump:all
```

- Build all packages with:

```bash
npm run build:all
```

- Publish the changes with:

```bash
npm run publish:all
```

npm i && npm run test:all && npm run bump:all && npm run build:all && npm run publish:all

### Nx Scoped Commands

You can use any package-specific command through the Nx CLI. For example, to run the tests for the @arianee/core package, you can use the following command:

```bash
npx nx test core
```

_The syntax is as follows:_ `npx nx <command> <package-name>`

### Examples

You can test the sdk with the arianee-sdk-example (apps/arianee-sdk-example).

You can launch the arianee-sdk-example with:

```bash
  npm run dev
```

it will automatically serve the project and build dependencies.

## Contributions

We welcome contributions to the Arianee SDK. Please ensure you follow our contribution guidelines, which can be found in the CONTRIBUTING.md file.
