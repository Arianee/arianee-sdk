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

For example, to build the `ownershipVerifier.circom` circuit, you can run the following command:

```bash
nx build-circom privacy-circuits --circuit=ownershipVerifier/ownershipVerifier.circom --ptau=powersOfTau_final_12.ptau
```

The previous command will generate the `build` directory in the `privacy-circuits` directory.
This directory contains another directory with the name of the circuit file (e.g., `ownershipVerifier`). Inside this directory, you can find the following:

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

The "Powers of Tau Ceremony" is a protocol used to generate public parameters for cryptographic systems that rely on zero-knowledge proofs. By involving multiple participants, the ceremony ensures that no single party can access the "Toxic Waste" — sensitive data whose exposure could compromise the system. This process distributes trust among various contributors by creating a Common Reference String (CSR), a crucial element used across different users and applications to construct and verify zero-knowledge proofs consistently and securely. This setup minimizes potential security risks and maintains the integrity of the cryptographic framework.

### How to start the ceremony

First, you need to have completed the installation steps described in the previous section.
Once you are ready, you can start a new ceremony by running the following command:

```bash
npx snarkjs powersoftau new <curve> <power> <output-file>
```

_The `<power>` parameter allows you to control the limit of constraints that this ceremony output will be able to handle._
_If you set the power to 12, the output will be able to handle up to 2^12 constraints._

For example, to start a new ceremony for the BN128 curve with a power of 12, you can run the following command:

```bash
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

The previous command will generate a new file named `pot12_0000.ptau` in the current directory.
This file contains the initial contribution of the ceremony, you can share it with other participants to continue the process.

### How to contribute to the ceremony

To contribute to an existing ceremony, you need to run the following command:

```bash
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name=<your-name> -v
```

_The `--name` parameter allows you to specify your name (preferably your GitHub username) to identify your contribution._

The previous command will generate a new file named `pot12_0001.ptau` in the current directory.
This file contains your contribution to the ceremony, you can share it with other participants to continue the process.

### Powers of Tau — 29/04/2024

The Arianee Team has organized a Powers of Tau ceremony to generate the public parameters for the Arianee protocol.
6 key members of the Arianee Team have participated in the ceremony to ensure the integrity of the process.

The ceremony has been completed successfully, and the final public parameters are available in the following files:

- [powersOfTau_final_12.ptau](https://github.com/Arianee/arianee-sdk/blob/main/packages/privacy-circuits/trusted-setup/powersOfTau_final_12.ptau) (SHA256: 0df85864ac82c4e3f3ef3375660c1b89036cc76b9c75ba1732f7de8b7daf2aac)
- [powersOfTau_final_16.ptau](https://github.com/Arianee/arianee-sdk/blob/main/packages/privacy-circuits/trusted-setup/powersOfTau_final_16.ptau) (SHA256: a209f90a7140adfb0fed90b9e024df92aea9bd953f00f0cd80c9fd0b6d311dac)
