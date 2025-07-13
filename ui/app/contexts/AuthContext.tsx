'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated on load
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            console.log('Attempting login with:', email);


            const response = await axios.post(`${API_URL}/login`,
                { session: { email, password } },
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Login response:', response.data);

            let token = null;

            // Try to get token from response data
            if (response.data && response.data.token) {
                token = response.data.token;
            }
            // If not in data, try response headers
            else if (response.headers && response.headers.authorization) {
                token = response.headers.authorization;
                if (token.startsWith('Bearer ')) {
                    token = token.substring(7);
                }
            }

            if (token) {
                console.log('Token received, setting authentication');
                localStorage.setItem('authToken', token);

                // Store user info if provided
                if (response.data && response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                setIsAuthenticated(true);
                router.push('/providers');
            } else {
                console.error('No token found in response:', response);
                throw new Error('Authentication failed: No token received');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('authToken');

            // Only attempt logout if we have a token
            if (token) {
                try {
                    await axios.delete(`${API_URL}/logout`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log('Logged out successfully from server');
                } catch (logoutError: any) {
                    // Don't treat 401 as an error during logout - it's expected if the token is expired
                    if (logoutError.response?.status === 401) {
                        console.log('Token already expired, continuing with client logout');
                    } else {
                        console.error('Logout error:', logoutError);
                    }
                }
            }
        } finally {
            // Always clean up local state regardless of server response
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};