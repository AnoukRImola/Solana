#!/bin/bash
# grabbing first argument -y or -n value
arg1=$1
program_dir=$(realpath "../../programs/solana-tl")
# Check if the argument is -y or -n
if [[ $arg1 == "-y" || $arg1 == "-n" ]]; then
  echo ""
else
  arg1=""
fi

echo "🔵 Building smart contract..."
# if (cargo build-sbf); then
if (anchor build); then
  # Move the smart contract to the sol-program directory.
  # ? Maybe this should be a symlink instead? Or another folder?
  rm -rf $program_dir/target/
  mv target/ $program_dir/target/
  echo "🟢 Build successful!"
  read -p "🟡 Do you want to deploy the smart contract? (y/N) " -n 1 -r
  if [[ $arg1 == "-y" ]]; then
    REPLY="y" # Set REPLY to yes to automatically deploy
    echo "🟡 Auto-deploying smart contract (from command line argument)."
  else
    REPLY="n" # Default to no
    echo ""
  fi
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔵 Deploying smart contract..."
    # Maybe to another folder? programs folder perhaps?
    if (solana deploy $program_dir/target/deploy/smart-contract.so); then
      echo "🟢 Deployment successful!"
    else
      echo "🔴 Deployment failed!"
      exit 1
    fi
  else
    echo ""
    echo "🟡 Skipping deployment."
  fi
else
  echo "🔴 Build failed!"
  exit 1
fi
