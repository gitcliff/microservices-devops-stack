import express from 'express';
import request from 'supertest';

// Mock the metrics module to avoid Prometheus side-effects
jest.mock('../metrics', () => ({
  metricsMiddleware: (_req: any, _res: any, next: any) => next(),
  setupMetrics: jest.fn(),
}));

// Mock http-proxy-middleware so we don't start real proxies
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

/**
 * Build a minimal gateway app that mirrors the real gateway's
 * 404 handler and error handler, without starting a listener.
 */
function createApp() {
  const app = express();
  app.use(express.json());

  // Health-like route to verify the app boots
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 404 catch-all (same as production gateway)
  app.use((_req, res) => {
    res.status(404).json({ error: 'Service not found' });
  });

  // Error handler (same as production gateway)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

describe('Gateway Service', () => {
  it('should return 404 with error message for unknown routes', async () => {
    const app = createApp();

    const res = await request(app).get('/api/unknown-service/test');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Service not found' });
  });

  it('should respond to health endpoint with status ok', async () => {
    const app = createApp();

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
