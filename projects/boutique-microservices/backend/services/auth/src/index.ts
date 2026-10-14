import { createServiceApp } from '../../../shared/createServiceApp';
import { authRoutes } from './routes/auth';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

createServiceApp({
  serviceName: 'auth',
  defaultPort: 3002,
  routes: authRoutes,
  connectDB,
  setupMetrics,
  metricsMiddleware,
});
