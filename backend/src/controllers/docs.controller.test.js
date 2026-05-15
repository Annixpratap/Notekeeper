import { describe, it, expect } from 'vitest';
import { getOpenAPISpecObject, getOpenAPISpec, getAbout } from './docs.controller.js';

describe('Docs Controller', () => {
  describe('getOpenAPISpecObject', () => {
    it('should return a valid OpenAPI 3.0 specification object', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('Notes App API');
      expect(spec.info.version).toBe('1.0.0');
    });

    it('should include all required components', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.components).toBeDefined();
      expect(spec.components.securitySchemes).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(spec.components.schemas).toBeDefined();
      expect(spec.components.schemas.User).toBeDefined();
      expect(spec.components.schemas.Note).toBeDefined();
      expect(spec.components.schemas.Block).toBeDefined();
    });

    it('should include all API paths', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.paths).toBeDefined();
      expect(spec.paths['/auth/register']).toBeDefined();
      expect(spec.paths['/auth/login']).toBeDefined();
      expect(spec.paths['/notes']).toBeDefined();
      expect(spec.paths['/notes/{id}']).toBeDefined();
      expect(spec.paths['/search']).toBeDefined();
      expect(spec.paths['/about']).toBeDefined();
    });

    it('should include authentication endpoints', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.paths['/auth/register'].post).toBeDefined();
      expect(spec.paths['/auth/register'].post.summary).toBe('Register a new user');
      expect(spec.paths['/auth/login'].post).toBeDefined();
      expect(spec.paths['/auth/login'].post.summary).toBe('Login user');
    });

    it('should include note management endpoints', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.paths['/notes'].post).toBeDefined();
      expect(spec.paths['/notes'].get).toBeDefined();
      expect(spec.paths['/notes/{id}'].get).toBeDefined();
      expect(spec.paths['/notes/{id}'].put).toBeDefined();
      expect(spec.paths['/notes/{id}'].delete).toBeDefined();
    });

    it('should include sharing endpoints', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.paths['/notes/{id}/share']).toBeDefined();
      expect(spec.paths['/notes/{id}/share'].post).toBeDefined();
    });

    it('should include search endpoint', () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.paths['/search']).toBeDefined();
      expect(spec.paths['/search'].get).toBeDefined();
    });

    it('should use correct server URL from request', () => {
      const mockReq = {
        protocol: 'https',
        get: () => 'api.example.com',
      };

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.servers[0].url).toBe('https://api.example.com');
    });

    it('should use environment variable as fallback for server URL', () => {
      const mockReq = null;
      process.env.API_URL = 'https://api.production.com';

      const spec = getOpenAPISpecObject(mockReq);

      expect(spec.servers[0].url).toBe('https://api.production.com');
    });
  });

  describe('getAbout', () => {
    it('should return about information', async () => {
      const mockReq = {};
      const mockRes = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
          return this;
        },
      };
      const mockNext = () => {};

      await getAbout(mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.data).toBeDefined();
      expect(mockRes.data.name).toBe('Notes App');
      expect(mockRes.data.version).toBe('1.0.0');
      expect(mockRes.data.features).toBeDefined();
      expect(Array.isArray(mockRes.data.features)).toBe(true);
      expect(mockRes.data.features.length).toBeGreaterThan(0);
    });

    it('should include all expected features', async () => {
      const mockReq = {};
      const mockRes = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
          return this;
        },
      };
      const mockNext = () => {};

      await getAbout(mockReq, mockRes, mockNext);

      const features = mockRes.data.features;
      expect(features).toContain('User authentication with JWT');
      expect(features).toContain('Create, read, update, delete notes');
      expect(features).toContain('Block-based editor with 8 block types');
      expect(features).toContain('Note sharing with other users');
      expect(features).toContain('Full-text search across notes');
      expect(features).toContain('OpenAPI 3.0 documentation');
    });
  });

  describe('getOpenAPISpec', () => {
    it('should return OpenAPI spec as JSON', async () => {
      const mockReq = {
        protocol: 'http',
        get: () => 'localhost:5000',
      };
      const mockRes = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
          return this;
        },
      };
      const mockNext = () => {};

      await getOpenAPISpec(mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.data).toBeDefined();
      expect(mockRes.data.openapi).toBe('3.0.0');
    });
  });
});
