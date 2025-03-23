#!/bin/bash

# Exit on error
set -e

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

echo "====================================================="
echo "Real Estate Platform - Data Collection PoC Runner"
echo "====================================================="
echo ""

# Check if MongoDB is running
echo "Checking MongoDB..."
if command -v mongod &> /dev/null; then
  echo "MongoDB is installed"
else
  echo "WARNING: MongoDB not found. This PoC doesn't require an active MongoDB instance but the full platform will."
fi

# Check Node.js and TypeScript
echo "Checking Node.js and TypeScript..."
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Please install Node.js v16 or later."
  exit 1
fi

node_version=$(node -v | cut -d 'v' -f 2)
echo "Using Node.js $node_version"

if ! command -v tsc &> /dev/null; then
  echo "TypeScript compiler not found. Installing..."
  npm install -g typescript
fi

# Verify project structure
echo "Verifying project structure..."
if [ ! -d "server/src" ]; then
  echo "ERROR: Project structure invalid. 'server/src' directory not found."
  exit 1
fi

if [ ! -f "server/src/poc.ts" ]; then
  echo "ERROR: PoC entry point not found at 'server/src/poc.ts'."
  exit 1
fi

# Create output directories
echo "Creating output directories..."
mkdir -p data/raw
mkdir -p data/processed
mkdir -p data/errors
mkdir -p reports

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile TypeScript
echo "Compiling TypeScript..."
npm run build || echo "Build failed. Continuing with ts-node..."

# Run the PoC
echo ""
echo "====================================================="
echo "Executing Proof of Concept..."
echo "====================================================="
echo ""

ts-node server/src/poc.ts

echo ""
echo "====================================================="
echo "PoC Execution Complete"
echo "====================================================="
echo ""
echo "Check the following directories for results:"
echo "- Raw data: ./data/raw"
echo "- Processed data: ./data/processed"
echo "- Error logs: ./data/errors"
echo ""
echo "For comprehensive documentation, please refer to PROJECT-OVERVIEW.md"
echo "=====================================================" 