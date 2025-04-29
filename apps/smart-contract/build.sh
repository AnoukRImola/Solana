#!/bin/bash

echo "🔵 Building smart contract..."
if (cargo build-sbf); then
  echo "🟢 Build successful!"
  read -p "🟡 Do you want to deploy the smart contract? (y/N) " -n 1 -r
  echo # Move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔵 Deploying smart contract..."
    if (solana deploy ./target/deploy/smart-contract.so); then
      echo "🟢 Deployment successful!"
    else
      echo "🔴 Deployment failed!"
      exit 1
    fi
  else
    echo "🟡 Skipping deployment."
  fi
else
  echo "🔴 Build failed!"
  exit 1
fi
