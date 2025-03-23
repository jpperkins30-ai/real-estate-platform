FROM node:18-alpine

# Create and set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create data directories
RUN mkdir -p data/raw data/processed data/reports

# Expose any ports if needed (for future API/web interface)
# EXPOSE 3000

# Command to run the POC
CMD ["npm", "start"] 