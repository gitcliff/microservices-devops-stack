import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { userRoutes } from '../routes/users';

jest.mock('../database/connection', () => ({
  query: jest.fn(),
}));

import { query } from '../database/connection';

const mockedQuery = query as jest.MockedFunction<typeof query>;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(userRoutes);
  return app;
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET);
}

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /profile', () => {
    it('should return 401 when no token is provided', async () => {
      const app = createApp();

      const res = await request(app).get('/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('No token provided');
    });

    it('should return user profile with preferences and addresses', async () => {
      const app = createApp();
      const token = generateToken('user-42');

      // User query
      mockedQuery.mockResolvedValueOnce({
        rows: [{
          id: 'user-42',
          email: 'alice@example.com',
          first_name: 'Alice',
          last_name: 'Smith',
          role: 'customer',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        }],
        rowCount: 1,
      } as any);

      // Preferences query
      mockedQuery.mockResolvedValueOnce({
        rows: [{ currency: 'EUR', language: 'fr', newsletter: false, promotions: true }],
        rowCount: 1,
      } as any);

      // Addresses query
      mockedQuery.mockResolvedValueOnce({
        rows: [{ street: '10 Rue de Rivoli', city: 'Paris', state: 'IDF', zip_code: '75001', country: 'FR' }],
        rowCount: 1,
      } as any);

      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('alice@example.com');
      expect(res.body.data.firstName).toBe('Alice');
      expect(res.body.data.preferences.currency).toBe('EUR');
      expect(res.body.data.addresses).toHaveLength(1);
    });
  });

  describe('PUT /profile', () => {
    it('should update user name and return updated profile', async () => {
      const app = createApp();
      const token = generateToken('user-42');

      // UPDATE query
      mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      // SELECT after update
      mockedQuery.mockResolvedValueOnce({
        rows: [{
          id: 'user-42',
          email: 'alice@example.com',
          first_name: 'Alicia',
          last_name: 'Johnson',
          role: 'customer',
          created_at: '2026-01-01',
          updated_at: '2026-06-15',
        }],
        rowCount: 1,
      } as any);

      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Alicia', lastName: 'Johnson' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Alicia');
      expect(res.body.data.lastName).toBe('Johnson');
    });
  });
});
