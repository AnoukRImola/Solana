# Smart Contract Development

This document provides instructions on how to build and manage the smart contract using the provided scripts.

## Building the Contract

The `build.sh` script compiles the smart contract, with an optional step to deploy it.

**Usage:**

```bash
./build.sh
```

This script will handle the necessary compilation steps and place the output artifacts in the appropriate directory (e.g., `./target`).

## Getting the Contract ID

The `get-id.sh` script retrieves the ID of the deployed or built contract. This ID is often needed for interacting with the contract.

**Usage:**

```bash
./get-id.sh
```

This script will output the contract ID to the console. Ensure the contract has been built or deployed before running this script, as it might depend on build artifacts or network information.
