#!/bin/bash

# Exit on error
set -e

# Function to run tests and handle errors
run_tests() {
  local test_path=$1
  local test_name=$2
  
  echo "Running $test_name..."
  if ! npx vitest run "$test_path" --config ./vitest.config.ts; then
    echo "❌ $test_name failed"
    return 1
  fi
  echo "✅ $test_name passed"
  return 0
}

# Change to client directory
cd client

# Run tests in sequence
test_results=0

# Run Custom Hooks Tests
run_tests "src/__tests__/hooks_" "Custom Hooks Tests" || test_results=1

# Run Controller Component Tests
run_tests "src/__tests__/components_multiframe_controllers_" "Controller Component Tests" || test_results=1

# Run Panel Component Tests
run_tests "src/__tests__/components_multiframe_panels_" "Panel Component Tests" || test_results=1

# Run Enhanced Container Tests
run_tests "src/__tests__/components_multiframe_EnhancedPanelContainer.test.tsx" "Enhanced Container Tests" || test_results=1

# Print final status
if [ $test_results -eq 0 ]; then
  echo "✅ All tests completed successfully!"
else
  echo "❌ Some tests failed. Please check the output above for details."
  exit 1
fi 