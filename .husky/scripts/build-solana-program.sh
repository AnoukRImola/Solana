#!/bin/bash

# Script to build the Solana program if there are new git changes in the smart-contract directory
# This script can be used in GitHub Actions workflows

set -e # Exit immediately if a command exits with a non-zero status

# Path to the smart-contract directory
SMART_CONTRACT_DIR="apps/smart-contract"

# Determine the repository root
if [ -n "$GITHUB_WORKSPACE" ]; then
  # In GitHub Actions
  REPO_ROOT="$GITHUB_WORKSPACE"
else
  # Local development
  REPO_ROOT=$(git rev-parse --show-toplevel)
fi

FULL_SC_DIR="$REPO_ROOT/$SMART_CONTRACT_DIR"

# Check if the directory exists
if [ ! -d "$FULL_SC_DIR" ]; then
  echo "🔴 Error: Smart contract directory not found at $FULL_SC_DIR"
  exit 1
fi

# Check for changes in the smart-contract directory
# If previous commit exists, compare with it
if git rev-parse HEAD^ &>/dev/null; then
  CHANGED_FILES=$(git diff --name-only HEAD^ HEAD -- "$SMART_CONTRACT_DIR")
  
  if [ -z "$CHANGED_FILES" ]; then
    echo "🟡 No changes detected in the smart-contract directory. Skipping build."
    exit 0
  fi
  
  echo "🟡 Changes detected in smart-contract directory:"
  echo "$CHANGED_FILES"
fi

# Navigate to the smart contract directory
cd "$FULL_SC_DIR" || {
  echo "🔴 Error: Cannot navigate to smart-contract directory at $FULL_SC_DIR"
  exit 1
}

echo "🟡 Building Solana program in: $(pwd)"

# Check if we're on a merge to main from develop
IS_DEPLOY=false
if [ -n "$GITHUB_REF" ]; then
  # In GitHub Actions
  if [ "$GITHUB_REF" = "refs/heads/main" ] && [ "$GITHUB_EVENT_NAME" = "push" ]; then
    # Check if this is a merge from develop
    if git log -1 --pretty=%B | grep -q "Merge.*develop"; then
      IS_DEPLOY=true
    fi
  fi
else
  # Local development - check current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT_BRANCH" = "main" ]; then
    # Check last commit message for merge from develop
    if git log -1 --pretty=%B | grep -q "Merge.*develop"; then
      IS_DEPLOY=true
    fi
  fi
fi

# Run the build script
echo "🟡 Running build script..."

if [ -x "./build.sh" ]; then
  # Pass --deploy flag if this is a merge to main from develop
  if [ "$IS_DEPLOY" = true ]; then
    echo "🟢 Merge from develop to main detected. Building with deploy option."
    ./build.sh -y
  else
    echo "🟢 Building without deployment."
    ./build.sh -n
  fi
  
  BUILD_EXIT_CODE=$?
  
  if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "🔴 Build failed with exit code $BUILD_EXIT_CODE"
    exit $BUILD_EXIT_CODE
  else
    echo "🟢 Build completed successfully"
  fi
else
  echo "🔴 Error: build.sh script not found or not executable"
  exit 1
fi