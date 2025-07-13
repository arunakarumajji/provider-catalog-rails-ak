'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Devise expects user as the parameter name

            const response = await axios.post(`${API_URL}/login`, {
                user: { email, password }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });



            // JWT token is typically sent in the Authorization header
            const authHeader = response.headers.authorization || response.headers.Authorization;
            if (authHeader) {
                // Extract the token (remove 'Bearer ' if present)
                const token = authHeader.startsWith('Bearer ')
                    ? authHeader.substring(7)
                    : authHeader;

                console.log('Token found in headers:', token);
                localStorage.setItem('authToken', token);

                // Also store user info if available
                if (response.data && response.data.data) {
                    localStorage.setItem('currentUser', JSON.stringify(response.data.data));
                }

                console.log('Full response:', response);
                console.log('About to redirect to /providers');

                // Redirect to providers page
                router.push('/providers');
            } else {
                // If no token in header, check the response body
                console.warn('No token found in headers, checking response body...');

                if (response.data && response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                    router.push('/providers');
                } else {
                    // For development only, set a dummy token
                    console.warn('No token found in response. Using dummy token for development.');
                    localStorage.setItem('authToken', 'dummy_token_for_development');
                    router.push('/providers');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);

            // Extract error message if available
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                'Invalid email or password. Please try again.';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Healthcare Provider Catalog</h1>
                <p className="text-center text-sm text-gray-600">Sign in to your account</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                            loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>




            </div>
        </div>
    );
}