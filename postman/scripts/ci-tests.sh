#!/bin/bash
set -e

# CI Integration script for Postman API Tests

# Default values
ENVIRONMENT="testing"
REPORT_DIR="./postman/reports"
GENERATE_DATA="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --report-dir)
      REPORT_DIR="$2"
      shift 2
      ;;
    --generate-data)
      GENERATE_DATA="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set environment variables
export ENV_FILE="${ENVIRONMENT}.json"
export GENERATE_TEST_DATA="${GENERATE_DATA}"
export CI="true"

# Create report directory if it doesn't exist
mkdir -p "${REPORT_DIR}"

echo "Starting API tests with environment: ${ENVIRONMENT}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install newman newman-reporter-htmlextra axios
fi

# Run the tests
echo "Running API tests..."
node ./postman/scripts/run-tests.js

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "All tests passed!"
  exit 0
else
  echo "Tests failed! Check the reports for details."
  exit 1
fi 