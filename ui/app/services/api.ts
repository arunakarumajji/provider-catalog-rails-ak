'use client';

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Provider, ProviderAttributes, ProviderFilters,  ApiResponse } from '../types/provider';

const API_URL = 'http://localhost:3000/api/v1';



// Create configured axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Log the request details
        console.log('API Request:', {
            url: config.url,
            method: config.method?.toUpperCase(),
            headers: config.headers,
            data: config.data,
            params: config.params
        });
        return config;
    },
    (error) => Promise.reject(error)
);

// Log responses
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            from: response.config.url
        });
        return response;
    },
    (error) => {
        console.error('API Error Response:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            from: error.config?.url
        });
        return Promise.reject(error);
    }
);

// Helper function for authentication
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
};

// Error handling - using never return type since it always throws
const handleApiError = (error: AxiosError): never => {
    // If this is a backend validation error, pass it through directly
    if (error.response?.status === 422) {
        throw error;
    }

    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
        console.warn('Authentication error, you may need to log in again');
    }

    // For any other error, rethrow it to be handled by the component
    console.error('API error:', error.message, error.response?.data);
    throw error;
};

// Provider API functions
const providerService = {
    // Get all providers
    getProviders: async <T = Provider[]>(params: {
        page?: number;
        per_page?: number;
        specialty?: string;
        location?: string;
    } = {}): Promise<ApiResponse<T>> => {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await api.get('/providers', { params });
            return response.data;
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Get provider by ID
    getProvider: async (id: string | number): Promise<ApiResponse<Provider>> => {
        try {
            const response: AxiosResponse<ApiResponse<Provider>> = await api.get(`/providers/${id}`);
            return response.data;
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Create provider
    createProvider: async (providerData: ProviderAttributes, profileImage?: File): Promise<ApiResponse<Provider>> => {
        try {
            let response;

            if (profileImage) {
                // Use FormData for file uploads
                const formData = new FormData();

                // Add all provider attributes to formData
                Object.entries(providerData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(`provider[${key}]`, value.toString());
                    }
                });

                // Add the profile image
                formData.append('provider[profile_image]', profileImage);

                // Send with different headers for multipart form
                response = await api.post('/providers', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Regular JSON request if no file
                response = await api.post('/providers', { provider: providerData });
            }

            return response.data;
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Update provider
    updateProvider: async (id: string | number, providerData: ProviderAttributes, profileImage?: File): Promise<ApiResponse<Provider>> => {
        try {
            let response;

            if (profileImage) {
                // Use FormData for file uploads
                const formData = new FormData();

                // Add all provider attributes to formData
                Object.entries(providerData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(`provider[${key}]`, value.toString());
                    }
                });

                // Add the profile image
                formData.append('provider[profile_image]', profileImage);

                // Send with different headers for multipart form
                response = await api.put(`/providers/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Regular JSON request if no file
                response = await api.put(`/providers/${id}`, { provider: providerData });
            }

            return response.data;
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Partially update provider
    patchProvider: async (id: string | number, providerData: ProviderAttributes, profileImage?: File): Promise<ApiResponse<Provider>> => {
        try {
            let response;

            if (profileImage) {
                // Use FormData for file uploads
                const formData = new FormData();

                // Add all provider attributes to formData
                Object.entries(providerData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(`provider[${key}]`, value.toString());
                    }
                });

                // Add the profile image
                formData.append('provider[profile_image]', profileImage);

                // Send with different headers for multipart form
                response = await api.patch(`/providers/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Regular JSON request if no file
                response = await api.patch(`/providers/${id}`, { provider: providerData });
            }

            return response.data;
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Delete provider
    deleteProvider: async (id: string | number): Promise<{ success: boolean }> => {
        try {
            await api.delete(`/providers/${id}`);
            return { success: true };
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Get providers with filters
    getFilteredProviders: async <T = Provider[]>(filters: ProviderFilters): Promise<ApiResponse<T>> => {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await api.get('/providers', { params: filters });
            return response.data;
        } catch (error) {
            return handleApiError(error as AxiosError);
        }
    },

    // Request cancellation helper
    getCancelToken: () => {
        return axios.CancelToken.source();
    }
};

export default providerService;