# @arianee/arianee-protocol-client

A simple library that lets you interact with the Arianee protocols.

## Installation

You need the `@arianee/core` package to use this library.

```bash
npm i @arianee/core @arianee/arianee-protocol-client
```

## Usage

Instantiate the client and connect it to the network of your choice. (see [this github repository](https://github.com/Arianee/conventions/tree/main/public/contractAddresses) for v1 networks).

```typescript
const client = new ArianeeProtocolClient(Core.fromMnemonic('... ...'));
const protocol = await client.connect('sokol');
```

Because there exists different versions of the protocol, the `connect` method returns an instance of either `ProtocolClientV1` or `ProtocolClientV2`. \
You can check the version of the protocol you are connected to with a simple if:

```typescript
if (protocol instanceof ProtocolClientV1) {
  // protocol deployed on the connected network is v1
  // you can call the contracts methods directly like that:

  const uri = await protocol.identityContract.addressURI('0x305051e9a023fe881EE21cA43fd90c460B427Caa');
} else if (protocol instanceof ProtocolClientV2) {
  // protocol deployed on the connected network is v2
}
```

## Protocol details resolver

By default, the library uses our protocol details resolver API to fetch the `ProtocolDetails` when calling the `connect` method. If you don't want to use our API, you can pass your own protocol resolver by setting the optional `protocolDetailsResolver` property in the constructor's options.

## Protocol v2 optional features

The version two of the Arianee protocol has optional features. You can use the `requiresV2Feature` helper to assert that a certain feature is enabled before doing a call or transaction. The helper will throw an `UnavailableFeatureError` if the required feature is not enabled.

```typescript
import { requiresV2Feature, UnavailableFeatureError} from '@arianee/arianee-protocol-client';

async burnSmartAsset() {

  const protocol: ProtocolClientV2 = ...;

  try {
    requiresV2Feature(ProtocolV2Feature.burnable, protocol);
    // code after this line will be executed if and only if the feature is enabled

    ...
  } catch (e) {
    if(e instanceof UnavailableFeatureError) {
      // the burnable feature is not enabled on the connected network
      // you can't burn the smart asset
    }
  }
}
```
