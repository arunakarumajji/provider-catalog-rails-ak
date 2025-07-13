import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProviderForm from '../components/ProviderForm';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn()
}));

jest.mock('axios');

describe('ProviderForm', () => {
    const mockProvider = {
        id: 1,
        npi: '1234567890',
        first_name: 'John',
        last_name: 'Doe',
        specialty: 'Cardiology',
        credentials: 'MD',
        address_line1: '123 Main St',
        address_line2: 'Suite 100',
        city: 'Boston',
        state: 'MA',
        zip: '02116',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
        active: true
    };

    const specialties = [
        "Family Medicine",
        "Internal Medicine",
        "Pediatrics",
        "Cardiology"
    ];

    const credentials = ["MD", "DO", "NP", "PA"];

    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({});
        useRouter.mockReturnValue({
            push: jest.fn(),
            back: jest.fn()
        });
        window.localStorage.getItem = jest.fn().mockReturnValue('mock-token');
    });

    test('renders form with empty values for new provider', () => {
        render(<ProviderForm isEdit={false} specialties={specialties} credentials={credentials} />);

        expect(screen.getByText(/add new provider/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toHaveValue('');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('');
        expect(screen.getByLabelText(/npi/i)).toHaveValue('');
    });

    test('renders form with provider values for edit mode', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProvider });
        useParams.mockReturnValue({ id: '1' });

        render(<ProviderForm isEdit={true} specialties={specialties} credentials={credentials} />);

        await waitFor(() => {
            expect(screen.getByText(/edit provider/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
            expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
            expect(screen.getByLabelText(/npi/i)).toHaveValue('1234567890');
            expect(screen.getByLabelText(/specialty/i)).toHaveValue('Cardiology');
        });
    });

    test('validates required fields on submission', async () => {
        render(<ProviderForm isEdit={false} specialties={specialties} credentials={credentials} />);

        // Submit without filling required fields
        await userEvent.click(screen.getByText(/save/i));

        await waitFor(() => {
            expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/npi is required/i)).toBeInTheDocument();
        });

        expect(axios.post).not.toHaveBeenCalled();
    });

    test('creates new provider successfully', async () => {
        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });

        render(<ProviderForm isEdit={false} specialties={specialties} credentials={credentials} />);

        // Fill out form
        await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/last name/i), 'Smith');
        await userEvent.type(screen.getByLabelText(/npi/i), '0987654321');
        await userEvent.selectOptions(screen.getByLabelText(/specialty/i), 'Pediatrics');
        await userEvent.selectOptions(screen.getByLabelText(/credentials/i), 'NP');
        await userEvent.type(screen.getByLabelText(/address line 1/i), '456 Oak St');
        await userEvent.type(screen.getByLabelText(/city/i), 'Chicago');
        await userEvent.type(screen.getByLabelText(/state/i), 'IL');
        await userEvent.type(screen.getByLabelText(/zip/i), '60601');
        await userEvent.type(screen.getByLabelText(/phone/i), '555-987-6543');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane.smith@example.com');
        await userEvent.click(screen.getByLabelText(/active/i));

        axios.post.mockResolvedValueOnce({ data: { id: 2 } });

        await userEvent.click(screen.getByText(/save/i));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/providers'),
                expect.objectContaining({
                    first_name: 'Jane',
                    last_name: 'Smith',
                    npi: '0987654321',
                    specialty: 'Pediatrics',
                    credentials: 'NP',
                    active: true
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-token'
                    })
                })
            );

            expect(pushMock).toHaveBeenCalledWith('/providers/2');
        });
    });

    test('updates provider successfully in edit mode', async () => {
        axios.get.mockResolvedValueOnce({ data: mockProvider });
        axios.put.mockResolvedValueOnce({ data: { ...mockProvider, first_name: 'Johnny' } });

        const pushMock = jest.fn();
        useRouter.mockReturnValue({ push: pushMock });
        useParams.mockReturnValue({ id: '1' });

        render(<ProviderForm isEdit={true} specialties={specialties} credentials={credentials} />);

        await waitFor(() => {
            expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
        });

        // Update first name
        await userEvent.clear(screen.getByLabelText(/first name/i));
        await userEvent.type(screen.getByLabelText(/first name/i), 'Johnny');

        await userEvent.click(screen.getByText(/save/i));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/providers/1'),
                expect.objectContaining({
                    first_name: 'Johnny'
                }),
                expect.any(Object)
            );

            expect(pushMock).toHaveBeenCalledWith('/providers/1');
        });
    });

    test('handles API errors gracefully', async () => {
        render(<ProviderForm isEdit={false} specialties={specialties} credentials={credentials} />);

        // Fill required fields
        await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/last name/i), 'Smith');
        await userEvent.type(screen.getByLabelText(/npi/i), '0987654321');

        // Mock API error
        axios.post.mockRejectedValueOnce({
            response: {
                data: {
                    errors: {
                        npi: ['NPI already exists']
                    }
                }
            }
        });

        await userEvent.click(screen.getByText(/save/i));

        await waitFor(() => {
            expect(screen.getByText(/npi already exists/i)).toBeInTheDocument();
        });
    });

    test('navigates back when cancel button is clicked', async () => {
        const backMock = jest.fn();
        useRouter.mockReturnValue({ back: backMock });

        render(<ProviderForm isEdit={false} specialties={specialties} credentials={credentials} />);

        await userEvent.click(screen.getByText(/cancel/i));

        expect(backMock).toHaveBeenCalled();
    });
});