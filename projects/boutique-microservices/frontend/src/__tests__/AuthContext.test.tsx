import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

function AuthTestHarness() {
  const { user, isAuthenticated, loading, error, login, logout, clearError } = useAuth();

  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="authenticated">{String(isAuthenticated)}</p>
      <p data-testid="user">{user ? user.email : 'none'}</p>
      <p data-testid="error">{error || 'none'}</p>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => clearError()}>Clear Error</button>
    </div>
  );
}

function renderWithAuth() {
  localStorage.clear();
  return render(
    <AuthProvider>
      <AuthTestHarness />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedAuthService.getCurrentUser.mockRejectedValue(new Error('No token'));
  });

  it('should login successfully and store tokens', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer' as const,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    mockedAuthService.login.mockResolvedValueOnce({
      user: mockUser,
      token: 'access-token-123',
      refreshToken: 'refresh-token-456',
    });

    renderWithAuth();

    // Wait for initial auth check to settle
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).not.toBe('true');
    });

    userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    expect(localStorage.getItem('accessToken')).toBe('access-token-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token-456');
  });

  it('should handle login failure and allow clearing the error', async () => {
    mockedAuthService.login.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderWithAuth();

    // Wait for initial auth check to settle
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).not.toBe('true');
    });

    userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
    });

    // Clear the error
    userEvent.click(screen.getByText('Clear Error'));

    expect(screen.getByTestId('error').textContent).toBe('none');
  });
});
