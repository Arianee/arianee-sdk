# Arianee Protocol Client

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

Because there exists different versions of the protocol, the `connect` method returns an object with either a `v1` or a `v2` property. \
You can check the version of the protocol you are connected to with a simple if:

```typescript
if ('v1' in protocol) {
  // protocol deployed on the connected network is v1
  // you can call the contracts methods directly like that:

  const uri = await protocol.v1.identityContract.addressURI('0x305051e9a023fe881EE21cA43fd90c460B427Caa');
}
```