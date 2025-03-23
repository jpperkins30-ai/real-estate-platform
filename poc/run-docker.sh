#!/bin/bash
# Script to run the Real Estate Platform POC using Docker

# Print banner
echo "=============================================="
echo "Real Estate Platform POC - Docker Runner"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker before running this script."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose before running this script."
    exit 1
fi

# Create data directories if they don't exist
mkdir -p data/raw data/processed data/reports

# Build and start the container
echo "Building and starting Docker container..."
docker-compose up --build

echo ""
echo "POC execution completed."
echo "Results are stored in the 'data' directory:"
echo "  - Raw data: data/raw/"
echo "  - Processed data: data/processed/"
echo "  - Reports: data/reports/" 