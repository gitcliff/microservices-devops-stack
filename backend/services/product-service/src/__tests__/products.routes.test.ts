import express from 'express';
import request from 'supertest';
import { productRoutes } from '../routes/products';

jest.mock('../database/connection', () => ({
  query: jest.fn(),
}));

import { query } from '../database/connection';

const mockedQuery = query as jest.MockedFunction<typeof query>;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(productRoutes);
  return app;
}

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return paginated products with defaults', async () => {
      const app = createApp();

      // COUNT query
      mockedQuery.mockResolvedValueOnce({
        rows: [{ total: '2' }],
        rowCount: 1,
      } as any);

      // Products query
      mockedQuery.mockResolvedValueOnce({
        rows: [
          { id: '1', name: 'Silk Evening Gown', price: 1200, category: 'Dresses', image_url: '/product-images/silk-evening-gown.jpg' },
          { id: '2', name: 'Cashmere Coat', price: 800, category: 'Outerwear', image_url: '/product-images/cashmere-coat.jpg' },
        ],
        rowCount: 2,
      } as any);

      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toHaveLength(2);
      expect(res.body.data.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        total: 2,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('GET /:id', () => {
    it('should return a single product by ID', async () => {
      const app = createApp();

      mockedQuery.mockResolvedValueOnce({
        rows: [{
          id: '1',
          name: 'Diamond Necklace',
          price: 5000,
          category: 'Jewelry',
          image_url: '/product-images/diamond-necklace.jpg',
        }],
        rowCount: 1,
      } as any);

      const res = await request(app).get('/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Diamond Necklace');
      expect(res.body.data.price).toBe(5000);
    });

    it('should return 404 when product is not found', async () => {
      const app = createApp();

      mockedQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      } as any);

      const res = await request(app).get('/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Product not found');
    });
  });
});
