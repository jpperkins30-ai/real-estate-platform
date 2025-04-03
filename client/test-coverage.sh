#!/bin/bash
# test-coverage.sh

echo "Running test coverage..."
npx vitest run --coverage

# Check if coverage is above threshold
total=$(grep -A 4 "All files" coverage/coverage-summary.json | grep total | awk '{print $2}' | tr -d ',')
if (( $(echo "$total < 80" | bc -l) )); then
  echo "Coverage below threshold: $total%"
  exit 1
else
  echo "Coverage is sufficient: $total%"
fi 