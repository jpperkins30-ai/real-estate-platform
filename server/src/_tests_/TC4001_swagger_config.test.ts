import { swaggerSpec } from '../swagger/config';

/**
 * Test Case ID: TC4001_swagger_config
 * Test Summary: Verifies that Swagger configuration is properly set up
 * with correct OpenAPI specs, schemas, and security definitions.
 */
describe('TC4001_swagger_config: Swagger Configuration', () => {
  test('TC4001.1: Swagger spec is properly configured', () => {
    expect(swaggerSpec).toBeDefined();
    expect((swaggerSpec as any).openapi).toBe('3.0.0');
    expect((swaggerSpec as any).info).toBeDefined();
    expect((swaggerSpec as any).info.title).toBe('Real Estate Platform API');
    expect((swaggerSpec as any).components.schemas).toBeDefined();
    expect((swaggerSpec as any).components.securitySchemes).toBeDefined();
  });
  
  test('TC4001.2: Swagger spec includes error schema', () => {
    expect((swaggerSpec as any).components.schemas.Error).toBeDefined();
    expect((swaggerSpec as any).components.schemas.Error.properties.message).toBeDefined();
  });
  
  test('TC4001.3: Swagger spec includes security scheme', () => {
    expect((swaggerSpec as any).components.securitySchemes.bearerAuth).toBeDefined();
    expect((swaggerSpec as any).components.securitySchemes.bearerAuth.type).toBe('http');
    expect((swaggerSpec as any).components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });
}); 