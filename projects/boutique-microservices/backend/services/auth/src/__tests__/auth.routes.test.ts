import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { authRoutes } from '../routes/auth';

// Mock the database module
jest.mock('../database/connection', () => ({
  query: jest.fn(),
}));

import { query } from '../database/connection';

const mockedQuery = query as jest.MockedFunction<typeof query>;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  return app;
}

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user and return 201 with user data', async () => {
      const app = createApp();

      // First query: check if user exists — no rows
      mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // Second query: insert user
      mockedQuery.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'customer',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        }],
        rowCount: 1,
      } as any);

      const res = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'securepass',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.firstName).toBe('John');
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe('Registration successful');

      // Verify password was hashed (second call args)
      const insertCall = mockedQuery.mock.calls[1];
      const hashedPassword = insertCall[1]![1] as string;
      expect(await bcrypt.compare('securepass', hashedPassword)).toBe(true);
    });

    it('should return 400 when user already exists', async () => {
      const app = createApp();

      mockedQuery.mockResolvedValueOnce({
        rows: [{ id: 1 }],
        rowCount: 1,
      } as any);

      const res = await request(app)
        .post('/register')
        .send({
          email: 'existing@example.com',
          password: 'pass',
          firstName: 'Jane',
          lastName: 'Doe',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });
  });

  describe('GET /me', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const app = createApp();

      const res = await request(app).get('/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Not logged in');
    });

    it('should return user data when valid token is provided', async () => {
      const app = createApp();

      mockedQuery.mockResolvedValueOnce({
        rows: [{
          id: 42,
          email: 'user@example.com',
          first_name: 'Alice',
          last_name: 'Smith',
          role: 'customer',
        }],
        rowCount: 1,
      } as any);

      const res = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer 42');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('user@example.com');
      expect(res.body.firstName).toBe('Alice');
    });
  });
});
