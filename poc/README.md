# Real Estate Platform - Proof of Concept

This is a proof-of-concept (POC) implementation that demonstrates the data collection and transformation capabilities of the Real Estate Platform.

## Features

- Collects property data from St. Mary's County tax records (or generates sample data)
- Standardizes property data into a consistent format
- Simulates geocoding to add location information
- Generates reports with property statistics
- Provides a robust pipeline for data transformation

## Requirements

### Local Execution
- Node.js (v14+)
- NPM

### Docker Execution (Alternative)
- Docker
- Docker Compose

## Quick Start

### Using Docker (Recommended)

#### Windows
Run the provided Docker batch script:
```
run-docker.bat
```

#### Linux/macOS
Run the Docker shell script:
```
chmod +x run-docker.sh
./run-docker.sh
```

### Traditional Method

#### Windows
Run the provided batch script:
```
run-simple.bat
```

#### Linux/macOS
Run the shell script:
```
chmod +x run-poc.sh
./run-poc.sh
```

## Running Manually

### With Docker
1. Build and run using Docker Compose:
   ```
   docker-compose up --build
   ```

### Without Docker
1. Install dependencies:
   ```
   npm install
   ```

2. Create data directories:
   ```
   mkdir -p data/raw data/processed data/reports
   ```

3. Run the POC:
   ```
   npx ts-node src/simple-poc.ts
   ```

## Output

The POC generates three types of output:

1. **Raw Data**: JSON files with the collected property data (data/raw/)
2. **Processed Data**: Standardized property data with enriched information (data/processed/)
3. **Reports**: Summary reports with statistics about the collected data (data/reports/)

## Notes

- If no active tax sale is found on the St. Mary's County website, the POC will generate simulated data.
- The geocoding in this POC is simulated. In a production environment, it would connect to a real geocoding service.
- When using Docker, all data is persisted in the local `data` directory through volume mounting. 