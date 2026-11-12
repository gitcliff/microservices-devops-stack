import { createServiceApp } from '../../../shared/createServiceApp';
import { userRoutes } from './routes/users';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

createServiceApp({
  serviceName: 'user-service',
  defaultPort: 3006,
  routes: userRoutes,
  connectDB,
  setupMetrics,
  metricsMiddleware,
});
