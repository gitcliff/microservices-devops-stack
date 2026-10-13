import express from 'express';
import request from 'supertest';
import axios from 'axios';
import { orderRoutes } from '../routes/orders';

jest.mock('../database/connection', () => ({
  query: jest.fn(),
}));

jest.mock('axios');

import { query } from '../database/connection';

const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(orderRoutes);
  return app;
}

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('should create an order, fetch product prices, and return 201', async () => {
      const app = createApp();

      // Mock product service response
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { id: 'p1', name: 'Silk Gown', price: 250 } },
      });

      // Mock INSERT INTO orders
      mockedQuery.mockResolvedValueOnce({
        rows: [{
          id: 'order-1',
          user_id: 'demo-user-id',
          total_amount: 500,
          status: 'pending',
          payment_status: 'pending',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        }],
        rowCount: 1,
      } as any);

      // Mock INSERT INTO order_items
      mockedQuery.mockResolvedValueOnce({
        rows: [{ id: 'item-1' }],
        rowCount: 1,
      } as any);

      const res = await request(app)
        .post('/')
        .send({
          items: [{ productId: 'p1', quantity: 2 }],
          shippingAddress: {
            street: '123 Main St',
            city: 'NY',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.items).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /my-orders', () => {
    it('should return orders for the default demo user', async () => {
      const app = createApp();

      mockedQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'order-1',
            user_id: 'demo-user-id',
            total_amount: 300,
            status: 'delivered',
            items: [{ id: 'i1', productId: 'p1', quantity: 1, price: 300 }],
          },
        ],
        rowCount: 1,
      } as any);

      const res = await request(app).get('/my-orders');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('delivered');

      // Verify query used default demo user
      expect(mockedQuery.mock.calls[0][1]).toContain('demo-user-id');
    });
  });
});
