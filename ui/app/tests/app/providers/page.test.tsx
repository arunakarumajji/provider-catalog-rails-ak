import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProvidersPage from '../app/providers/page';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Mocks
jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('axios');

describe('ProvidersPage', () => {
    const mockProviders = [
        {
            id: 1,
            npi: '1234567890',
            first_name: 'John',
            last_name: 'Doe',
            specialty: 'Cardiology',
            credentials: 'MD',
            active: true
        },
        {
            id: 2,
            npi: '0987654321',
            first_name: 'Jane',
            last_name: 'Smith',
            specialty: 'Neurology',
            credentials: 'DO',
            active: false
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false,
            logout: jest.fn()
        });
        useRouter.mockReturnValue({
            push: jest.fn()
        });
        window.localStorage.getItem = jest.fn().mockReturnValue('mock-token');
    });

    test('renders loading state initially', () => {
        axios.get.mockImplementationOnce(() => new Promise(resolve => {}));

        render(<ProvidersPage />);

        expect(screen.getByText(/loading providers/i)).toBeInTheDocument();
    });

    test('renders providers list after successful API call', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProviders });

        render(<ProvidersPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Cardiology')).toBeInTheDocument();
            expect(screen.getByText('MD')).toBeInTheDocument();
            expect(screen.getByText('Neurology')).toBeInTheDocument();
            expect(screen.getByText('DO')).toBeInTheDocument();
        });

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/providers'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token'
                })
            })
        );
    });

    test('shows error message when API call fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch providers'));

        render(<ProvidersPage />);

        await waitFor(() => {
            expect(screen.getByText(/error loading providers/i)).toBeInTheDocument();
        });
    });

    test('navigates to provider detail when clicking on a provider', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProviders });
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        render(<ProvidersPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('John Doe'));

        expect(pushMock).toHaveBeenCalledWith('/providers/1');
    });

    test('shows active badge for active providers', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProviders });

        render(<ProvidersPage />);

        await waitFor(() => {
            const activeBadges = screen.getAllByText('Active');
            const inactiveBadges = screen.getAllByText('Inactive');
            expect(activeBadges).toHaveLength(1);
            expect(inactiveBadges).toHaveLength(1);
        });
    });

    test('navigates to create new provider page', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProviders });
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        render(<ProvidersPage />);

        await waitFor(() => {
            expect(screen.getByText(/add new provider/i)).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText(/add new provider/i));

        expect(pushMock).toHaveBeenCalledWith('/providers/new');
    });
});