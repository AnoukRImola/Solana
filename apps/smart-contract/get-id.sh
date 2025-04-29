#!/bin/bash

echo "🔵 Retrieving Project ID..."
echo "🟢 Project ID: $(solana address -k ./target/deploy/smart_contract-keypair.json)"