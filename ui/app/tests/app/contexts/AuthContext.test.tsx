import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: jest.fn(key => store[key]),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to use auth context
const TestComponent = () => {
    const { isAuthenticated, login, logout, loading } = useAuth();
    return (
        <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="auth-status">{isAuthenticated.toString()}</div>
            <button onClick={() => login('test@example.com', 'password')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    const pushMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: pushMock });
    });

    test('initializes with isAuthenticated=false and loading=true', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('loading').textContent).toBe('true');
        expect(screen.getByTestId('auth-status').textContent).toBe('false');
    });

    test('checks localStorage on mount and sets authentication state', async () => {
        localStorageMock.getItem.mockReturnValueOnce('mock-token');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
            expect(screen.getByTestId('auth-status').textContent).toBe('true');
        });

        expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    });

    test('login function works correctly with valid credentials', async () => {
        axios.post.mockResolvedValueOnce({
            data: { token: 'test-token', user: { id: 1, name: 'Test User' } }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            userEvent.click(screen.getByText('Login'));
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/login'),
                { session: { email: 'test@example.com', password: 'password' } },
                expect.any(Object)
            );

            expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'test-token');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: 1, name: 'Test User' }));
            expect(screen.getByTestId('auth-status').textContent).toBe('true');
            expect(pushMock).toHaveBeenCalledWith('/providers');
        });
    });

    test('login function handles errors correctly', async () => {
        axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await expect(async () => {
            await act(async () => {
                userEvent.click(screen.getByText('Login'));
            });
        }).rejects.toThrow('Invalid credentials');

        expect(screen.getByTestId('auth-status').textContent).toBe('false');
    });

    test('logout function works correctly', async () => {
        localStorageMock.getItem.mockReturnValueOnce('mock-token');
        axios.delete.mockResolvedValueOnce({});

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status').textContent).toBe('true');
        });

        await act(async () => {
            userEvent.click(screen.getByText('Logout'));
        });

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/logout'),
                expect.any(Object)
            );

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
            expect(screen.getByTestId('auth-status').textContent).toBe('false');
            expect(pushMock).toHaveBeenCalledWith('/login');
        });
    });
});