import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../contexts/CartContext';
import { Product } from '../types';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Silk Evening Gown',
  description: 'A luxurious silk gown',
  price: 1200,
  imageUrl: '/product-images/silk-evening-gown.jpg',
  category: 'Dresses',
  inventory: 10,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const secondProduct: Product = {
  id: 'prod-2',
  name: 'Cashmere Coat',
  description: 'Premium cashmere',
  price: 800,
  imageUrl: '/product-images/cashmere-coat.jpg',
  category: 'Outerwear',
  inventory: 5,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function CartTestHarness() {
  const { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div>
      <p data-testid="item-count">{itemCount}</p>
      <p data-testid="total">{total}</p>
      <p data-testid="items-length">{items.length}</p>
      <button onClick={() => addItem(mockProduct)}>Add Product 1</button>
      <button onClick={() => addItem(secondProduct)}>Add Product 2</button>
      <button onClick={() => removeItem('prod-1')}>Remove Product 1</button>
      <button onClick={() => updateQuantity('prod-1', 3)}>Set Qty 3</button>
      <button onClick={() => updateQuantity('prod-1', 0)}>Set Qty 0</button>
      <button onClick={() => clearCart()}>Clear</button>
    </div>
  );
}

function renderWithCart() {
  return render(
    <CartProvider>
      <CartTestHarness />
    </CartProvider>
  );
}

describe('CartContext', () => {
  it('should add items, track count and total, and handle duplicates', () => {
    renderWithCart();

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');

    // Add first product
    userEvent.click(screen.getByText('Add Product 1'));

    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('1200');

    // Add same product again — should increment quantity, not add a new line
    userEvent.click(screen.getByText('Add Product 1'));

    expect(screen.getByTestId('item-count').textContent).toBe('2');
    expect(screen.getByTestId('items-length').textContent).toBe('1'); // still 1 unique item
    expect(screen.getByTestId('total').textContent).toBe('2400');

    // Add second product
    userEvent.click(screen.getByText('Add Product 2'));

    expect(screen.getByTestId('item-count').textContent).toBe('3');
    expect(screen.getByTestId('items-length').textContent).toBe('2');
    expect(screen.getByTestId('total').textContent).toBe('3200');
  });

  it('should remove items, update quantities, and clear the cart', () => {
    renderWithCart();

    // Add two products
    userEvent.click(screen.getByText('Add Product 1'));
    userEvent.click(screen.getByText('Add Product 2'));

    expect(screen.getByTestId('items-length').textContent).toBe('2');

    // Remove product 1
    userEvent.click(screen.getByText('Remove Product 1'));

    expect(screen.getByTestId('items-length').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('800');

    // Add product 1 back and update quantity to 3
    userEvent.click(screen.getByText('Add Product 1'));
    userEvent.click(screen.getByText('Set Qty 3'));

    expect(screen.getByTestId('item-count').textContent).toBe('4'); // 3 + 1
    expect(screen.getByTestId('total').textContent).toBe('4400'); // 1200*3 + 800

    // Set quantity to 0 — should remove the item
    userEvent.click(screen.getByText('Set Qty 0'));

    expect(screen.getByTestId('items-length').textContent).toBe('1');

    // Clear the entire cart
    userEvent.click(screen.getByText('Clear'));

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('items-length').textContent).toBe('0');
  });
});
