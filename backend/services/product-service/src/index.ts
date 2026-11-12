import path from 'path';
import express from 'express';
import { createServiceApp } from '../../../shared/createServiceApp';
import { productRoutes } from './routes/products';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

createServiceApp({
  serviceName: 'product-service',
  defaultPort: 3003,
  routes: productRoutes,
  connectDB,
  setupMetrics,
  metricsMiddleware,
  extraMiddleware: [
    { path: '/images', handler: express.static(path.join(__dirname, '../../../public')) },
  ],
});
