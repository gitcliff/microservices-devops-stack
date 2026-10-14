import { createServiceApp } from '../../../shared/createServiceApp';
import { orderRoutes } from './routes/orders';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

createServiceApp({
  serviceName: 'orders',
  defaultPort: 3005,
  routes: orderRoutes,
  connectDB,
  setupMetrics,
  metricsMiddleware,
});
