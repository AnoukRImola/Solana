#!/bin/bash

echo "🔵 Retrieving Project ID..."
echo "🟢 Escrow Project ID: $(solana address -k ./target/deploy/escrow-keypair.json)"
echo "🟢 Token Project ID: $(solana address -k ./target/deploy/token-keypair.json)"