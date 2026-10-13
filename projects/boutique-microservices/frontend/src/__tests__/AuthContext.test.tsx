import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

// Mock the auth service
jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Test component that exercises the auth context
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
  // Clear localStorage before each render
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
    // Default: no stored token, so initAuth dispatches LOGIN_SUCCESS with null
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

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).not.toBe('true');
    });

    // Trigger login
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
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

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).not.toBe('true');
    });

    // Attempt login
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
    });

    // Clear the error
    await act(async () => {
      await userEvent.click(screen.getByText('Clear Error'));
    });

    expect(screen.getByTestId('error').textContent).toBe('none');
  });
});
