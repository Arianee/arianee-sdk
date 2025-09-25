# Arianee SDK Developer Guide 🚀

> **The definitive guide to navigating the Arianee SDK ecosystem**

Welcome to the comprehensive developer guide for the Arianee SDK! This guide will help you understand when to use each library and how they work together to power the Arianee ecosystem.

## 📋 Table of Contents

1. [Quick Start Decision Tree](#-quick-start-decision-tree)
2. [Architecture Overview](#-architecture-overview)
3. [Package Categories](#-package-categories)
4. [Role-Based Guide](#-role-based-guide)
5. [Integration Patterns](#-integration-patterns)
6. [Common Use Cases](#-common-use-cases)
7. [Package Reference](#-package-reference)
8. [Migration Guide](#-migration-guide)

---

## 🎯 Quick Start Decision Tree

**Not sure which package to use? Follow this decision tree:**

```
Are you building a wallet application?
├─ YES → Start with @arianee/wallet
│
└─ NO → What's your role?
    ├─ Brand/Issuer creating smart assets
    │   └─ Use @arianee/creator
    │
    ├─ Service provider consuming SSTs
    │   └─ Use @arianee/service-provider
    │
    ├─ Brand generating SSTs for partners
    │   └─ Use @arianee/token-provider
    │
    ├─ Need direct protocol access
    │   └─ Use @arianee/arianee-protocol-client
    │
    └─ Building custom integrations
        └─ Start with @arianee/core + specific clients
```

---

## 🏗️ Architecture Overview

The Arianee SDK follows a **layered architecture** designed for flexibility and modularity:

```
┌─────────────────────────────────────────────────────────────┐
│                    HIGH-LEVEL ABSTRACTIONS                  │
├─────────────────────────────────────────────────────────────┤
│  @arianee/wallet        @arianee/creator                    │
│  (End Users)            (Brands/Issuers)                    │
├─────────────────────────────────────────────────────────────┤
│                    SPECIALIZED SERVICES                     │
├─────────────────────────────────────────────────────────────┤
│  @arianee/token-provider    @arianee/service-provider       │
│  (SST Generation)           (SST Consumption)               │
├─────────────────────────────────────────────────────────────┤
│                      API CLIENTS                           │
├─────────────────────────────────────────────────────────────┤
│  @arianee/wallet-api-client                                 │
│  @arianee/arianee-api-client                                │
│  @arianee/arianee-privacy-gateway-client                    │
├─────────────────────────────────────────────────────────────┤
│                    PROTOCOL LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  @arianee/arianee-protocol-client                           │
│  @arianee/permit721-sdk                                     │
├─────────────────────────────────────────────────────────────┤
│                   FOUNDATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  @arianee/core              @arianee/arianee-access-token   │
│  @arianee/common-types      @arianee/utils                  │
│  @arianee/wallet-abstraction                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Package Categories

### 🎯 **High-Level Abstractions** (Start Here!)
Perfect for most developers who want to get started quickly.

| Package | Purpose | Best For |
|---------|---------|----------|
| **@arianee/wallet** | Complete wallet functionality | Wallet apps, DApps, end-user applications |
| **@arianee/creator** | Smart asset creation & management | Brands, issuers, content creators |

### 🔧 **Specialized Services**
For specific business use cases and integrations.

| Package | Purpose | Best For |
|---------|---------|----------|
| **@arianee/token-provider** | Generate Smart Asset Sharing Tokens (SST) | Brands sharing assets with partners |
| **@arianee/service-provider** | Consume and use SSTs | Service providers, partners, utilities |

### 🌐 **API Clients**
Direct access to Arianee services and APIs.

| Package | Purpose | Best For |
|---------|---------|----------|
| **@arianee/wallet-api-client** | Wallet API interactions | Custom wallet implementations |
| **@arianee/arianee-api-client** | General Arianee API access | Custom integrations |
| **@arianee/arianee-privacy-gateway-client** | Private content access | Privacy-focused applications |

### ⛓️ **Protocol Layer**
Low-level blockchain interactions.

| Package | Purpose | Best For |
|---------|---------|----------|
| **@arianee/arianee-protocol-client** | Direct protocol interactions | Advanced integrations, custom logic |
| **@arianee/permit721-sdk** | Permit721 contract interactions | SST implementations, advanced transfers |

### 🧱 **Foundation Layer**
Core utilities and types used by other packages.

| Package | Purpose | Best For |
|---------|---------|----------|
| **@arianee/core** | Signing & transaction management | All applications (required dependency) |
| **@arianee/arianee-access-token** | Authentication token management | Custom auth implementations |
| **@arianee/common-types** | Shared TypeScript types | TypeScript projects |
| **@arianee/utils** | Utility functions | All projects (fetch wrappers, etc.) |
| **@arianee/wallet-abstraction** | Wallet interface definitions | Custom wallet implementations |

---

## 👥 Role-Based Guide

### 🏢 **For Brands & Issuers**

**Primary Package: `@arianee/creator`**

You're a brand wanting to create and manage smart assets (Digital Product Passports).

```typescript
import { Creator } from '@arianee/creator';
import { Core } from '@arianee/core';

const creator = new Creator({
  core: Core.fromPrivateKey('your-private-key'),
  creatorAddress: '0x...',
  transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
});

await creator.connect('testnet');

// Create a smart asset with content
const result = await creator.smartAssets.createAndStoreSmartAsset({
  content: {
    name: 'Luxury Watch',
    description: 'A premium timepiece',
    // ... more content
  }
});
```

**When to use additional packages:**
- **@arianee/token-provider**: When sharing assets with partners/service providers
- **@arianee/arianee-protocol-client**: For advanced protocol interactions
- **@arianee/arianee-privacy-gateway-client**: For custom privacy implementations

### 👤 **For End Users & Wallet Developers**

**Primary Package: `@arianee/wallet`**

You're building a wallet application or DApp for end users.

```typescript
import { Wallet } from '@arianee/wallet';

const wallet = new Wallet({
  chainType: 'testnet',
  auth: {
    mnemonic: 'your twelve word mnemonic...'
  }
});

// Get owned smart assets
const ownedAssets = await wallet.smartAsset.getOwned('testnet');

// Claim a smart asset
await wallet.smartAsset.claim('testnet', {
  link: 'https://test.arian.ee/123456,abcdef'
});
```

**When to use additional packages:**
- **@arianee/wallet-api-client**: For custom wallet API integrations
- **@arianee/service-provider**: If your wallet consumes SSTs
- **@arianee/arianee-access-token**: For custom authentication flows

### 🔧 **For Service Providers**

**Primary Package: `@arianee/service-provider`**

You're a service provider (repair shop, reseller, etc.) that receives SSTs from brands.

```typescript
import { ServiceProvider } from '@arianee/service-provider';
import { Core } from '@arianee/core';

const serviceProvider = new ServiceProvider(
  Core.fromPrivateKey('your-private-key')
);

// Extract SST from URL
const sst = serviceProvider.extractSST('https://partner.com?SST=eyJ...');

// Get smart asset content using SST
const smartAsset = await serviceProvider.getSmartAssetFromSST({
  sst: sst
});

// Transfer the smart asset to a customer
await serviceProvider.transferSmartAsset({
  sst: sst,
  to: '0xcustomer-address'
});
```

### 🤝 **For Brands Sharing with Partners**

**Primary Package: `@arianee/token-provider`**

You're a brand that wants to share smart assets with service providers.

```typescript
import { generateSST } from '@arianee/token-provider';
import { Wallet } from '@arianee/wallet';

const wallet = new Wallet({
  auth: { privateKey: 'brand-private-key' }
});

const smartAsset = await wallet.smartAsset.get('testnet', { id: '123' });

// Generate SST for a service provider
const sst = await generateSST({
  core: wallet.core,
  smartAsset: smartAsset.data,
  spender: '0xservice-provider-address',
  deadline: 3600 // 1 hour
});

// Share the SST with your partner
const shareUrl = `https://partner.com?SST=${sst}`;
```

### 🛠️ **For Advanced Developers**

**Primary Package: `@arianee/arianee-protocol-client`**

You need direct access to smart contracts and protocol features.

```typescript
import { ArianeeProtocolClient } from '@arianee/arianee-protocol-client';
import { Core } from '@arianee/core';

const client = new ArianeeProtocolClient(Core.fromPrivateKey('...'));
const protocol = await client.connect('testnet');

// Direct contract interaction
const owner = await protocol.smartAssetContract.ownerOf(123);
const uri = await protocol.identityContract.addressURI('0x...');
```

---

## 🔄 Integration Patterns

### Pattern 1: **Simple Wallet Integration**
```typescript
// Just need basic wallet functionality
import { Wallet } from '@arianee/wallet';

const wallet = new Wallet({ chainType: 'mainnet' });
```

### Pattern 2: **Brand with Partner Ecosystem**
```typescript
// Brand creates assets and shares with partners
import { Creator } from '@arianee/creator';
import { generateSST } from '@arianee/token-provider';

const creator = new Creator({...});
// Create assets with creator
// Generate SSTs with token-provider
```

### Pattern 3: **Custom API Integration**
```typescript
// Need custom API access
import { WalletApiClient } from '@arianee/wallet-api-client';
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';

// Use specific API clients for custom integrations
```

### Pattern 4: **Full Protocol Access**
```typescript
// Need everything
import { Core } from '@arianee/core';
import { ArianeeProtocolClient } from '@arianee/arianee-protocol-client';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';

// Build custom solutions with full control
```

---

## 💡 Common Use Cases

### 🛍️ **E-commerce Integration**
**Goal**: Add smart assets to your online store

**Recommended Stack**:
- `@arianee/creator` - Create smart assets for products
- `@arianee/wallet` - Let customers claim their assets

```typescript
// In your backend
const creator = new Creator({...});
await creator.smartAssets.createAndStoreSmartAsset({
  content: productData
});

// In your frontend
const wallet = new Wallet({...});
await wallet.smartAsset.claim('mainnet', { link: claimLink });
```

### 🔧 **Service Provider Platform**
**Goal**: Build a platform for repair shops, resellers, etc.

**Recommended Stack**:
- `@arianee/service-provider` - Handle SSTs from brands
- `@arianee/wallet` - Manage assets in your platform

```typescript
const serviceProvider = new ServiceProvider(core);
const smartAsset = await serviceProvider.getSmartAssetFromSST({ sst });
```

### 📱 **Mobile Wallet App**
**Goal**: Build a mobile wallet for smart assets

**Recommended Stack**:
- `@arianee/wallet` - Core wallet functionality
- `@arianee/arianee-access-token` - Authentication
- `@arianee/utils` - Utility functions

```typescript
const wallet = new Wallet({
  storage: AsyncStorage, // React Native
  eventManagerParams: { pullInterval: 5000 }
});
```

### 🏭 **Enterprise Integration**
**Goal**: Integrate Arianee into existing enterprise systems

**Recommended Stack**:
- `@arianee/arianee-protocol-client` - Direct protocol access
- `@arianee/arianee-api-client` - API integrations
- `@arianee/creator` - Asset creation

### 🔐 **Privacy-Focused Application**
**Goal**: Build applications with enhanced privacy

**Recommended Stack**:
- `@arianee/arianee-privacy-gateway-client` - Private content
- `@arianee/privacy-circuits` - Zero-knowledge proofs
- `@arianee/core` - Signing and authentication

---

## 📚 Package Reference

### 🎯 @arianee/wallet
**The Swiss Army knife for wallet applications**

```typescript
import { Wallet } from '@arianee/wallet';

const wallet = new Wallet({
  chainType: 'mainnet',
  auth: { mnemonic: '...' },
  storage: localStorage, // Persist data
  i18nStrategy: { useLanguages: ['en-US', 'fr-FR'] }
});

// Smart asset operations
await wallet.smartAsset.get('mainnet', { id: '123' });
await wallet.smartAsset.getOwned('mainnet');
await wallet.smartAsset.claim('mainnet', { link: '...' });

// Message operations  
await wallet.message.getReceived('mainnet');
await wallet.message.readMessage('mainnet', { id: '456' });

// Identity operations
await wallet.identity.get('mainnet', { address: '0x...' });

// Events (real-time updates)
wallet.smartAsset.received.addListener((event) => {
  console.log('New smart asset received!', event);
});
```

**Best for**: Wallet apps, DApps, end-user applications
**Dependencies**: `@arianee/core`, `@arianee/wallet-abstraction`

### 🏭 @arianee/creator
**The powerhouse for brands and issuers**

```typescript
import { Creator } from '@arianee/creator';

const creator = new Creator({
  core: Core.fromPrivateKey('...'),
  creatorAddress: '0x...',
  transactionStrategy: 'WAIT_TRANSACTION_RECEIPT'
});

await creator.connect('mainnet');

// Smart asset creation
const result = await creator.smartAssets.createAndStoreSmartAsset({
  content: {
    name: 'Product Name',
    description: 'Product Description',
    image: 'https://...',
    // Rich content structure
  }
});

// Message creation
await creator.messages.createAndStoreMessage({
  smartAssetId: 123,
  content: { title: 'Update', description: '...' }
});

// Event creation
await creator.events.createAndStoreEvent({
  smartAssetId: 123,
  content: { eventType: 'maintenance', description: '...' }
});

// Utility functions
const available = await creator.utils.isSmartAssetIdAvailable(123);
const balance = await creator.utils.getCreditBalance('smartAsset');
```

**Best for**: Brands, issuers, content creators
**Dependencies**: `@arianee/core`, `@arianee/arianee-protocol-client`, `@arianee/arianee-privacy-gateway-client`

### 🎫 @arianee/token-provider
**Generate Smart Asset Sharing Tokens (SST)**

```typescript
import { generateSST } from '@arianee/token-provider';

const sst = await generateSST({
  core: ownerCore,
  smartAsset: smartAssetData,
  spender: '0xservice-provider-address',
  deadline: 3600, // 1 hour
  nonce: 0 // optional
});

// Share with partner
const shareUrl = `https://partner.com?SST=${sst}`;
```

**Best for**: Brands sharing assets with service providers
**Use case**: Enabling partners to access/transfer your smart assets temporarily

### 🔧 @arianee/service-provider
**Consume Smart Asset Sharing Tokens (SST)**

```typescript
import { ServiceProvider } from '@arianee/service-provider';

const serviceProvider = new ServiceProvider(core);

// Extract SST from URL
const sst = serviceProvider.extractSST(url);

// Validate SST
const isValid = await serviceProvider.isValidSST({ sst });

// Get smart asset content
const smartAsset = await serviceProvider.getSmartAssetFromSST({ sst });

// Transfer smart asset
await serviceProvider.transferSmartAsset({
  sst,
  to: '0xcustomer-address'
});
```

**Best for**: Service providers, repair shops, resellers
**Use case**: Receiving and using SSTs from brands

### 🌐 @arianee/wallet-api-client
**Direct access to Wallet API**

```typescript
import { WalletApiClient } from '@arianee/wallet-api-client';

const client = new WalletApiClient('mainnet', core, {
  apiURL: 'https://api.arianee.com'
});

const smartAsset = await client.getSmartAsset('mainnet', {
  id: '123',
  passphrase: 'optional-passphrase'
});

const ownedAssets = await client.getOwnedSmartAssets('mainnet');
const messages = await client.getReceivedMessages('mainnet');
```

**Best for**: Custom wallet implementations, API integrations
**Use case**: When you need direct API access without the full wallet abstraction

### ⛓️ @arianee/arianee-protocol-client
**Direct blockchain protocol access**

```typescript
import { ArianeeProtocolClient } from '@arianee/arianee-protocol-client';

const client = new ArianeeProtocolClient(core);
const protocol = await client.connect('mainnet');

// Direct contract calls
const owner = await protocol.smartAssetContract.ownerOf(123);
const uri = await protocol.identityContract.addressURI('0x...');

// Check protocol version
if (protocol instanceof ProtocolClientV1) {
  // V1 specific features
} else if (protocol instanceof ProtocolClientV2) {
  // V2 specific features
}
```

**Best for**: Advanced integrations, custom protocol interactions
**Use case**: When you need direct smart contract access

### 🔐 @arianee/arianee-privacy-gateway-client
**Access private smart asset content**

```typescript
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';

const client = new ArianeePrivacyGatewayClient(core, fetch);

// Read certificate content
const content = await client.certificateRead(rpcUrl, {
  certificateId: '123',
  passphrase: 'optional'
});

// Read updated content
const updated = await client.updateRead(rpcUrl, {
  certificateId: '123'
});

// Read messages and events
const message = await client.messageRead(rpcUrl, { messageId: '456' });
const event = await client.eventRead(rpcUrl, { 
  certificateId: '123', 
  eventId: '789' 
});
```

**Best for**: Privacy-focused applications, custom content access
**Use case**: When you need direct access to private content

### 🔑 @arianee/arianee-access-token
**Manage authentication tokens**

```typescript
import { ArianeeAccessToken } from '@arianee/arianee-access-token';

const aat = new ArianeeAccessToken(core);

// Get wallet-scoped token (cached)
const token = await aat.getValidWalletAccessToken();

// Create certificate-scoped token
const certToken = await aat.createCertificateArianeeAccessToken(123, 'mainnet');

// Create action link with token
const link = await aat.createActionArianeeAccessTokenLink(
  'https://app.com/action',
  123,
  'mainnet'
);

// Validate tokens (static methods)
const isValid = ArianeeAccessToken.isArianeeAccessTokenValid(token);
const decoded = ArianeeAccessToken.decodeJwt(token);
```

**Best for**: Custom authentication flows, token management
**Use case**: When you need fine-grained control over authentication

### 🧱 @arianee/core
**Foundation for all interactions**

```typescript
import { Core } from '@arianee/core';

// Create core instance
const core = Core.fromMnemonic('twelve word mnemonic...');
// or
const core = Core.fromPrivateKey('0x...');
// or  
const core = Core.fromRandom();

// Use core methods
const signature = await core.signMessage('Hello World');
const address = core.getAddress();
const txResponse = await core.sendTransaction(transaction);
```

**Best for**: All applications (required dependency)
**Use case**: Signing, transaction management, wallet operations

---

## 🚀 Migration Guide

### From Individual Packages to High-Level Abstractions

**Before** (using multiple low-level packages):
```typescript
import { ArianeeProtocolClient } from '@arianee/arianee-protocol-client';
import { WalletApiClient } from '@arianee/wallet-api-client';
import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';

// Complex setup with multiple clients...
```

**After** (using high-level abstraction):
```typescript
import { Wallet } from '@arianee/wallet';

const wallet = new Wallet({ chainType: 'mainnet' });
// Everything is handled internally!
```

### From Custom Implementation to Creator

**Before** (manual smart asset creation):
```typescript
// Complex protocol interactions, manual content storage...
```

**After** (using Creator):
```typescript
import { Creator } from '@arianee/creator';

const creator = new Creator({...});
await creator.smartAssets.createAndStoreSmartAsset({ content });
```

---

## 🎯 Quick Reference

### **I want to...**

| Goal | Primary Package | Additional Packages |
|------|----------------|-------------------|
| Build a wallet app | `@arianee/wallet` | `@arianee/arianee-access-token` |
| Create smart assets as a brand | `@arianee/creator` | `@arianee/token-provider` |
| Consume SSTs as a service provider | `@arianee/service-provider` | `@arianee/wallet` |
| Share assets with partners | `@arianee/token-provider` | `@arianee/creator` |
| Access private content | `@arianee/arianee-privacy-gateway-client` | `@arianee/core` |
| Direct protocol access | `@arianee/arianee-protocol-client` | `@arianee/core` |
| Custom API integration | `@arianee/wallet-api-client` | `@arianee/arianee-access-token` |
| Handle authentication | `@arianee/arianee-access-token` | `@arianee/core` |

### **Package Dependencies**

```
@arianee/wallet
├── @arianee/core ⭐
├── @arianee/wallet-abstraction
├── @arianee/arianee-access-token
└── @arianee/utils

@arianee/creator  
├── @arianee/core ⭐
├── @arianee/arianee-protocol-client
└── @arianee/arianee-privacy-gateway-client

@arianee/service-provider
├── @arianee/core ⭐
├── @arianee/permit721-sdk
└── @arianee/common-types

@arianee/token-provider
├── @arianee/core ⭐
├── @arianee/permit721-sdk
└── @arianee/common-types
```

⭐ = Required in all setups

---

## 🆘 Need Help?

### **Common Issues**

1. **"Which package should I use?"**
   - Start with the [Quick Start Decision Tree](#-quick-start-decision-tree)
   - Check the [Role-Based Guide](#-role-based-guide)

2. **"Package X is not working"**
   - Ensure you have `@arianee/core` installed
   - Check if you need to call `connect()` first
   - Verify your authentication setup

3. **"How do I handle authentication?"**
   - Most high-level packages handle this automatically
   - For custom auth, use `@arianee/arianee-access-token`

4. **"Can I use multiple packages together?"**
   - Yes! See [Integration Patterns](#-integration-patterns)
   - Share the same `Core` instance between packages

### **Best Practices**

✅ **Do:**
- Start with high-level abstractions (`@arianee/wallet`, `@arianee/creator`)
- Share `Core` instances between packages
- Use TypeScript for better development experience
- Handle errors appropriately
- Use the appropriate transaction strategy

❌ **Don't:**
- Mix different authentication methods
- Create multiple `Core` instances unnecessarily
- Ignore error handling
- Use low-level packages when high-level ones suffice

---

## 🎉 Conclusion

The Arianee SDK is designed to be **developer-friendly** and **modular**. Whether you're building a simple wallet app or a complex enterprise integration, there's a package (or combination of packages) that fits your needs.

**Remember:**
- 🎯 Start with high-level abstractions
- 👥 Choose packages based on your role
- 🔄 Use integration patterns for complex scenarios
- 📚 Refer to individual package READMEs for detailed API documentation

Happy building! 🚀

---

*This guide is maintained by the Arianee team. For questions or contributions, please visit our [GitHub repository](https://github.com/Arianee/arianee-sdk).*

