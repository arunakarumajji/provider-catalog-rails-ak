'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import providerService from '../services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import { Provider } from '../types/provider';

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [location, setLocation] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); // Add view mode toggle
    const router = useRouter();
    const { isAuthenticated, logout } = useAuth();
    const searchParams = useSearchParams();
    const initialPage = Number(searchParams.get('page')) || 1;
    const [pagination, setPagination] = useState({
        currentPage: initialPage,
        totalPages: 1,
        totalCount: 0
    });

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchProviders(initialPage);
    }, [isAuthenticated, router, initialPage]);

    const fetchProviders = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = {
                page,
                per_page: 10
            };
            if (specialty) params.specialty = specialty;
            if (location) params.location = location;

            const response = await providerService.getProviders(params);
            if (response && response.data) {
                setProviders(response.data);
                setPagination({
                    currentPage: response.meta?.current_page || 1,
                    totalPages: response.meta?.total_pages || 1,
                    totalCount: response.meta?.total_count || 0
                });
            } else {
                setProviders([]);
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
            setError('Failed to load providers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        // Update URL with the new page
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        if (specialty) params.set('specialty', specialty);
        if (location) params.set('location', location);

        router.push(`/providers?${params.toString()}`);
        fetchProviders(page);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();

        // Reset to page 1 when applying new filters
        const params = new URLSearchParams();
        params.set('page', '1');
        if (specialty) params.set('specialty', specialty);
        if (location) params.set('location', location);

        router.push(`/providers?${params.toString()}`);
        fetchProviders(1);
    };

    const handleDeactivate = async (id: string | number) => {
        if (window.confirm('Are you sure you want to deactivate this provider?')) {
            try {
                await providerService.deleteProvider(id);
                // Refresh provider list
                fetchProviders(pagination.currentPage);
            } catch (error) {
                console.error('Error deactivating provider:', error);
                setError('Failed to deactivate provider');
            }
        }
    };

    // Generate provider initials for avatar placeholder
    const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Healthcare Providers</h1>
                <div className="flex space-x-4">
                    <Link
                        href="/providers/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add New Provider
                    </Link>
                    <button
                        onClick={logout}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    {error}
                </div>
            )}

            {/* Filter section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">Filter Providers</h2>
                <form onSubmit={handleFilter} className="flex flex-wrap gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                                Specialty
                            </label>
                            <input
                                type="text"
                                id="specialty"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                placeholder="e.g. Cardiology"
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                Location (City or State)
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Boston"
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>
                    </div>
                    <div className="mt-4 w-full flex justify-between items-center">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Apply Filters
                        </button>

                        {/* View mode toggle */}
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded ${
                                    viewMode === 'table'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                    <line x1="3" y1="15" x2="21" y2="15"></line>
                                    <line x1="9" y1="3" x2="9" y2="21"></line>
                                    <line x1="15" y1="3" x2="15" y2="21"></line>
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-1 rounded ${
                                    viewMode === 'cards'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading providers...</div>
            ) : providers.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">No providers found. Try adjusting your filters or add a new provider.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'table' ? (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Provider
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Specialty
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Credentials
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {providers.map((provider) => (
                                    <tr key={provider.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                                    {provider.attributes.profile_image_url ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={provider.attributes.profile_image_url}
                                                            alt={`${provider.attributes.first_name} ${provider.attributes.last_name}`}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-700 font-medium">
                                                                {getInitials(provider.attributes.first_name, provider.attributes.last_name)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    {provider.attributes.first_name} {provider.attributes.last_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {provider.attributes.specialty}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {provider.attributes.credentials}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {provider.attributes.city && provider.attributes.state
                                                ? `${provider.attributes.city}, ${provider.attributes.state}`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/providers/${provider.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/providers/${provider.id}/edit`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeactivate(provider.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Deactivate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {providers.map((provider) => (
                                <div key={provider.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                {provider.attributes.profile_image_url ? (
                                                    <img
                                                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                                                        src={provider.attributes.profile_image_url}
                                                        alt={`${provider.attributes.first_name} ${provider.attributes.last_name}`}
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                                                        <span className="text-blue-700 font-bold text-xl">
                                                            {getInitials(provider.attributes.first_name, provider.attributes.last_name)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium">{provider.attributes.first_name} {provider.attributes.last_name}</h3>
                                                <p className="text-gray-600">{provider.attributes.specialty}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {provider.attributes.credentials && `${provider.attributes.credentials} • `}
                                                    {provider.attributes.city && provider.attributes.state
                                                        ? `${provider.attributes.city}, ${provider.attributes.state}`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end space-x-2">
                                            <Link
                                                href={`/providers/${provider.id}`}
                                                className="text-blue-600 hover:text-blue-900 text-sm"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/providers/${provider.id}/edit`}
                                                className="text-green-600 hover:text-green-900 text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeactivate(provider.id)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}

                    {/* Results summary */}
                    <div className="text-gray-500 text-sm mt-4">
                        Showing {providers.length} of {pagination.totalCount} providers
                    </div>
                </>
            )}
        </div>
    );
}