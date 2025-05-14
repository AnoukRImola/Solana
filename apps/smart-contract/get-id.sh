#!/bin/bash

program_dir=$(realpath "../../programs/solana-tl")

echo "🔵 Retrieving Project ID..."
echo "🟢 Escrow Project ID: $(solana address -k $program_dir/target/deploy/escrow-keypair.json)"
echo "🟢 Token Project ID: $(solana address -k $program_dir/target/deploy/token-keypair.json)"