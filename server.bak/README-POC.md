# Real Estate Investment Platform - Data Collection PoC

This document explains the Proof of Concept implementation for the Real Estate Investment Platform's data collection and processing pipeline.

## Overview

The proof of concept demonstrates the end-to-end process of:
1. Collecting property data from county government websites
2. Standardizing and transforming the data
3. Enriching with geocoding and additional metadata
4. Analyzing and reporting on the collected data

This implementation specifically targets St. Mary's County in Maryland as the initial data source.

## System Architecture

The PoC consists of several key components:

### 1. Data Collectors

- `StMarysCountyCollector`: Specialized collector for St. Mary's County tax sale properties
- `CollectorManager`: Manages and coordinates different data collectors
- Handles rate limiting, error handling, and data source tracking

### 2. Data Transformation Pipeline

- Standardizes property data from different sources into a common format
- Performs address normalization and geocoding
- Validates and enriches data with additional information
- Provides hooks for source-specific transformations

### 3. Data Storage

- MongoDB for persistent storage of:
  - Property data
  - Data sources
  - Collection history
  - Processing results

### 4. Analysis and Reporting

- Aggregates property data by various dimensions (county, property type, etc.)
- Generates statistics on property sales, types, and geographical distribution
- Creates detailed reports for business intelligence

## Running the PoC

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- TypeScript
- Git

### Environment Setup

Create a `.env` file in the server directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/real-estate-platform
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

### Running the PoC

Execute the shell script:

```bash
./run-poc.sh
```

Or run the steps manually:

1. Compile TypeScript:
   ```bash
   tsc
   ```

2. Run the PoC:
   ```bash
   node dist/poc.js
   ```

## Expected Output

The PoC will:

1. Connect to MongoDB
2. Create/retrieve a data source for St. Mary's County
3. Execute the data collection process
4. Transform collected data through the pipeline
5. Generate summary reports in the `reports/` directory
6. Perform data analysis and save results in `analysis/` directory

The console will show detailed logs of the process.

## Directory Structure

- `src/poc.ts`: Main PoC implementation
- `src/services/dataCollection/`: Data collection services
- `src/services/dataTransformation/`: Data transformation pipeline
- `src/collectors/`: Source-specific collectors
- `src/models/`: Mongoose models for data storage
- `reports/`: Generated reports directory
- `analysis/`: Data analysis results directory
- `data/`: Raw data storage

## Extending the PoC

### Adding New Data Sources

1. Create a new collector class in `src/collectors/`
2. Implement the required interface methods
3. Register the collector in the collector manager
4. Add source-specific transformation rules if needed

### Customizing the Pipeline

The data transformation pipeline is modular and can be extended by:
1. Adding new transformation steps to the pipeline
2. Creating custom validation rules
3. Implementing new enrichment services

## Troubleshooting

- If MongoDB connection fails, ensure the MongoDB service is running
- For geocoding errors, check internet connectivity
- If TypeScript compilation fails, check for type errors in the code

## Next Steps

After the PoC, the planned steps are:
1. Expand to additional counties and data sources
2. Implement a web UI for data visualization
3. Add user management and subscription features
4. Create automated scheduled collection jobs 