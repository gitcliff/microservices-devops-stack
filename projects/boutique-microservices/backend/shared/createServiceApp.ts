import express, { Router, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

interface ServiceConfig {
  serviceName: string;
  defaultPort: number;
  routes: Router;
  connectDB: () => Promise<void>;
  setupMetrics: (app: express.Express, opts: { serviceName: string; serviceVersion: string }) => void;
  metricsMiddleware: RequestHandler;
  extraMiddleware?: Array<{ path: string; handler: RequestHandler }>;
}

export function createServiceApp(config: ServiceConfig): void {
  dotenv.config({ path: './.env' });

  const app = express();
  const PORT = process.env.PORT || config.defaultPort;

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  config.setupMetrics(app, { serviceName: config.serviceName, serviceVersion: '1.0.0' });
  app.use(config.metricsMiddleware);

  if (config.extraMiddleware) {
    for (const mw of config.extraMiddleware) {
      app.use(mw.path, mw.handler);
    }
  }

  app.use('', config.routes);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  const startServer = async () => {
    try {
      await config.connectDB();
      app.listen(PORT, () => {
        console.log(`${config.serviceName} running on port ${PORT}`);
      });
    } catch (error) {
      console.error(`Failed to start ${config.serviceName}:`, error);
      process.exit(1);
    }
  };

  startServer();
}
