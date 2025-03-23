#!/bin/bash
# run-poc.sh - Run the Data Collection Proof of Concept

# Set error handling
set -e

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Display header
echo "========================================"
echo "  Real Estate Investment Platform PoC"
echo "  St. Mary's County Data Collection"
echo "========================================"
echo

# Check for MongoDB
echo "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
  echo "MongoDB shell not found. Please install MongoDB."
  exit 1
fi

# Try to connect to MongoDB
MONGO_URI=${MONGODB_URI:-"mongodb://localhost:27017/real-estate-platform"}
if ! mongosh "$MONGO_URI" --eval "db.version()" &> /dev/null; then
  echo "Cannot connect to MongoDB at $MONGO_URI"
  echo "Please ensure MongoDB is running and connection string is correct."
  exit 1
fi
echo "MongoDB connection successful."
echo

# Check for Node.js
echo "Checking Node.js environment..."
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Please install Node.js."
  exit 1
fi

# Check for TypeScript
if ! command -v tsc &> /dev/null; then
  echo "TypeScript not found. Installing TypeScript..."
  npm install -g typescript
fi
echo "Node.js environment ready."
echo

# Check for required directories
echo "Checking project structure..."
if [ ! -d "src" ]; then
  echo "Project structure not found. Please run this script from the project root."
  exit 1
fi
echo "Project structure verified."
echo

# Create necessary directories
echo "Creating output directories..."
mkdir -p data/MD/St.\ Mary\'s/$(date +%Y)
mkdir -p reports
mkdir -p analysis
echo "Output directories created."
echo

# Install dependencies
echo "Installing dependencies..."
npm install
echo "Dependencies installed."
echo

# Compile TypeScript
echo "Compiling TypeScript..."
tsc
echo "TypeScript compilation complete."
echo

# Run the PoC
echo "Running data collection PoC..."
node dist/poc.js
echo

echo "========================================"
echo "  Data Collection PoC Complete!"
echo "========================================"
echo
echo "Check the following output directories:"
echo "  - data/     : Raw collected data"
echo "  - reports/  : Collection reports"
echo "  - analysis/ : Data analysis results"
echo
echo "See PROJECT-OVERVIEW.md for comprehensive documentation."
echo 