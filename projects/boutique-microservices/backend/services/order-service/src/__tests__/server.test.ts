import express from 'express';
import request from 'supertest';

/**
 * The legacy order-service is plain JS. We replicate its route logic
 * here so we can unit-test without requiring a real DB or product service.
 */

const mockPool = {
  query: jest.fn(),
};

const mockAxios = {
  get: jest.fn(),
};

function createApp() {
  const app = express();
  app.use(express.json());

  // Replicate POST /orders from server.js
  app.post('/orders', async (req, res) => {
    const { productId } = req.body;

    try {
      const productRes = await mockAxios.get('http://product-service/products');
      const product = productRes.data.find((p: any) => p.id === productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const { rows } = await mockPool.query(
        'INSERT INTO order_service.orders(product_id) VALUES($1) RETURNING *',
        [productId]
      );

      res.json({ order: rows[0], product });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}

describe('Order Service (legacy)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order when product exists', async () => {
    const app = createApp();

    mockAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Widget', price: 9.99 },
        { id: 2, name: 'Gadget', price: 19.99 },
      ],
    });

    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 100, product_id: 1, created_at: '2026-01-01' }],
    });

    const res = await request(app)
      .post('/orders')
      .send({ productId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.order.product_id).toBe(1);
    expect(res.body.product.name).toBe('Widget');
  });

  it('should return 404 when product does not exist', async () => {
    const app = createApp();

    mockAxios.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Widget', price: 9.99 }],
    });

    const res = await request(app)
      .post('/orders')
      .send({ productId: 999 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });
});
