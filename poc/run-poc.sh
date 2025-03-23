#!/bin/bash
# Simple script to run the proof-of-concept

echo "=====================================================
Real Estate Platform - Simple POC Runner
====================================================="

# Ensure npm packages are installed
echo "Checking for required packages..."
npm install axios cheerio fs-extra path typescript ts-node dotenv
npm install @types/node @types/axios @types/cheerio @types/fs-extra --save-dev

# Create TSConfig file if it doesn't exist
if [ ! -f "tsconfig.json" ]; then
  echo "Creating tsconfig.json..."
  cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "outDir": "./dist",
    "strict": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
fi

# Create output directory
mkdir -p data/{raw,processed,reports}

# Run the POC
echo "Running POC..."
npx ts-node src/simple-poc.ts

echo "POC execution completed."
echo "Check the 'data' directory for results:"
echo "  - Raw data: data/raw/"
echo "  - Processed data: data/processed/"
echo "  - Reports: data/reports/" 