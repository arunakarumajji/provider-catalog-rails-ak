import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('axios');

describe('LoginPage', () => {
    const pushMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: pushMock });
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn()
            }
        });
    });

    test('renders login form with default values', () => {
        render(<LoginPage />);

        expect(screen.getByLabelText(/email/i)).toHaveValue('admin@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('updates form values when user types', async () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'test123');

        expect(emailInput).toHaveValue('user@example.com');
        expect(passwordInput).toHaveValue('test123');
    });

    test('handles successful login with token in header', async () => {
        axios.post.mockResolvedValueOnce({
            headers: {
                authorization: 'Bearer test-token'
            },
            data: {}
        });

        render(<LoginPage />);

        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/login'),
                { user: { email: 'admin@example.com', password: 'password123' } },
                expect.any(Object)
            );

            expect(window.localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
            expect(pushMock).toHaveBeenCalledWith('/providers');
        });
    });

    test('handles successful login with token in response body', async () => {
        axios.post.mockResolvedValueOnce({
            headers: {},
            data: { token: 'body-token' }
        });

        render(<LoginPage />);

        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(window.localStorage.setItem).toHaveBeenCalledWith('authToken', 'body-token');
            expect(pushMock).toHaveBeenCalledWith('/providers');
        });
    });

    test('displays error message on login failure', async () => {
        axios.post.mockRejectedValueOnce({
            response: {
                data: {
                    error: 'Invalid credentials'
                }
            }
        });

        render(<LoginPage />);

        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    test('disables button during login attempt', async () => {
        axios.post.mockImplementationOnce(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        headers: { authorization: 'Bearer test-token' },
                        data: {}
                    });
                }, 100);
            });
        });

        render(<LoginPage />);

        const button = screen.getByRole('button', { name: /sign in/i });
        await userEvent.click(button);

        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Signing in...');

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/providers');
        });
    });
});