import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProviderDetailPage from '../app/providers/[id]/page';
import { useAuth } from '../../../../../contexts/AuthContext';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

// Mocks
jest.mock('../../../../../contexts/AuthContext', () => ({
    useAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn()
}));

jest.mock('axios');

describe('ProviderDetailPage', () => {
    const mockProvider = {
        id: 1,
        npi: '1234567890',
        first_name: 'John',
        last_name: 'Doe',
        specialty: 'Cardiology',
        credentials: 'MD',
        address_line1: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zip: '02116',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
        active: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false
        });
        useParams.mockReturnValue({ id: '1' });
        useRouter.mockReturnValue({
            push: jest.fn(),
            back: jest.fn()
        });
        window.localStorage.getItem = jest.fn().mockReturnValue('mock-token');
    });

    test('renders loading state initially', () => {
        axios.get.mockImplementationOnce(() => new Promise(resolve => {}));

        render(<ProviderDetailPage />);

        expect(screen.getByText(/loading provider/i)).toBeInTheDocument();
    });

    test('renders provider details after successful API call', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProvider });

        render(<ProviderDetailPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe, MD')).toBeInTheDocument();
            expect(screen.getByText('Cardiology')).toBeInTheDocument();
            expect(screen.getByText('NPI: 1234567890')).toBeInTheDocument();
            expect(screen.getByText('123 Main St')).toBeInTheDocument();
            expect(screen.getByText('Boston, MA 02116')).toBeInTheDocument();
            expect(screen.getByText('555-123-4567')).toBeInTheDocument();
            expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
        });

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/providers/1'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token'
                })
            })
        );
    });

    test('shows error message when API call fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch provider'));

        render(<ProviderDetailPage />);

        await waitFor(() => {
            expect(screen.getByText(/error loading provider/i)).toBeInTheDocument();
        });
    });

    test('navigates to edit page when edit button is clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProvider });
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        render(<ProviderDetailPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe, MD')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText(/edit/i));

        expect(pushMock).toHaveBeenCalledWith('/providers/1/edit');
    });

    test('deletes provider when delete button is clicked and confirmed', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProvider });
        axios.delete.mockResolvedValueOnce({});
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        window.confirm = jest.fn().mockReturnValue(true);

        render(<ProviderDetailPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe, MD')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText(/delete/i));

        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('delete'));

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/providers/1'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    })
                })
            );
            expect(pushMock).toHaveBeenCalledWith('/providers');
        });
    });

    test('does not delete provider when deletion is not confirmed', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProvider });
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        window.confirm = jest.fn().mockReturnValue(false);

        render(<ProviderDetailPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe, MD')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText(/delete/i));

        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('delete'));
        expect(axios.delete).not.toHaveBeenCalled();
        expect(pushMock).not.toHaveBeenCalled();
    });
});