#!/bin/bash
# test-runner.sh - Comprehensive test runner for real-estate-platform

# Change to the client directory first
cd ./client || {
  echo "Error: Could not navigate to client directory. Make sure you're running this from the project root."
  exit 1
}

# Set exit on error
set -e

echo "==== Real Estate Platform Test Runner ===="
echo "Running component tests..."
npx vitest run --config ./vitest.config.ts

echo ""
echo "Checking test coverage..."
npx vitest run --coverage --config ./vitest.config.ts

# Check for minimum coverage thresholds
COVERAGE_RESULT=$?
if [ $COVERAGE_RESULT -ne 0 ]; then
  echo "❌ Coverage thresholds not met. Please improve test coverage before committing."
  cd ..
  exit 1
fi

# Run specific component tests to ensure critical features work
echo ""
echo "Running critical component tests..."
npx vitest run -t "DraggablePanel|MultiFrameContainer|AdvancedLayout" --config ./vitest.config.ts

# Generate test report
echo ""
echo "Generating test report..."
npx vitest run --reporter=html --config ./vitest.config.ts

# Check for specific directory test success
echo ""
echo "Validating core functionality tests..."
npx vitest run "src/_tests_/TC*_components_multiframe*" --config ./vitest.config.ts
CORE_TEST_RESULT=$?

if [ $CORE_TEST_RESULT -ne 0 ]; then
  echo "❌ Core functionality tests failed. Please fix before committing."
  cd ..
  exit 1
fi

# Return to the original directory
cd ..

echo ""
echo "✅ All tests passed successfully!"
echo "Report generated at ./client/html-report"
echo "==== Test Suite Complete ====" 