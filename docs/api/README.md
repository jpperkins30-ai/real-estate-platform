# API Documentation

This directory contains API specifications in different formats:

## Available API Specifications

### Layout Configuration API

The Layout Configuration API provides endpoints for managing panel layout configurations, including:

- Creating, retrieving, updating, and deleting layouts
- Managing panels within layouts
- Cloning existing layouts

Available formats:
- [Swagger/OpenAPI Specification](layout-api-swagger.yaml)
- [Postman Collection](layout-api-postman.json)

## Using the API Documentation

### Swagger/OpenAPI

The OpenAPI specifications can be viewed in:
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://redocly.github.io/redoc/)
- VS Code with extensions like "OpenAPI (Swagger) Editor"

### Postman Collections

To use the Postman collections:
1. Import the JSON file into Postman
2. Set up an environment with the following variables:
   - `baseUrl`: Base URL for your API (e.g., `http://localhost:3000/api/v1`)
   - `authToken`: Your authentication token

## Development Guidelines

When adding new endpoints:
1. Update the OpenAPI specification first
2. Generate or update the Postman collection
3. Update any relevant documentation

For more information about our API standards, refer to the [API Reference](../api-reference.md) documentation. 