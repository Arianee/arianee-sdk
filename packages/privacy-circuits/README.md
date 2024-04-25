# @arianee/privacy-circuits

This repository contains the circuits and libraries used to generate and verify the proofs of the "Full-Privacy" version of the Arianee protocol.
The two main parts of this repository are the following:

- The circuits that are written in the circom language, they are used to generate the proofs under the hood.
- A TypeScript library that is a friendly interface to interact with the circuits in order to generate and verify the proofs.

## Installation

You need several dependencies to build the circuits.

First, you need to install the circom compiler wich is written in Rust.
To have Rust available in your system, you can install rustup. If you’re using Linux or macOS, open a terminal and enter the following command:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

Then, you need to clone the circom repository and build the compiler.
You can do this by running the following commands:

```bash
git clone https://github.com/iden3/circom.git
cargo build --release
```

The build takes around 3 minutes to be completed. When the command successfully finishes, it generates the `circom` binary in the directory `target/release`. You can install this binary as follows (Note: Make sure you're still in the circom directory when running this command):

```bash
cargo install --path circom
```

The previous command will install the `circom` binary in the directory `$HOME/.cargo/bin`.

Now, you should be able to see all the options of the executable by using the help flag:

```bash
circom --help
```

Finally, you can install the dependencies of the project by running the following command from the root of this monorepo:

```bash
npm install
```

## Building

### Circom circuits

You can build the circuits by running the following command (Note: Make sure you're in the monorepo root directory when running this command):

```bash
nx build-circom privacy-circuits --circuit=<circuit-file-name> --ptau=<ptau-file-name>
```

For example, to build the `ownership_verifier.circom` circuit, you can run the following command:

```bash
nx build-circom privacy-circuits --circuit=ownership_verifier.circom --ptau=powersOfTau28_hez_final_12.ptau
```

The previous command will generate the `build` directory in the `privacy-circuits` directory.
This directory contains another directory with the name of the circuit file (e.g., `ownership_verifier`). Inside this directory, you can find the following:

- A `keys` directory that contains the proving and verifying keys.
- An `r1cs` directory that contains the R1CS file.
- A `wasm` directory that contains the WebAssembly file.
- A `solidity` directory that contains the Solidity verifier contract.

### TypeScript library

You can build the TypeScript library by running the following command (Note: Make sure you're in the monorepo root directory when running this command):

```bash
nx build privacy-circuits
```

## Running unit tests

Run `nx test privacy-circuits` to execute the unit tests via [Jest](https://jestjs.io).

## Trusted Setup Ceremony

**TODO**
