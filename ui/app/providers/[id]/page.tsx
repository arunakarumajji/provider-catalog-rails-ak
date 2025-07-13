'use client';
//VIEW PAGE
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import providerService from '../../services/api';
import { Provider } from '../../types/provider';

export default function ProviderDetailPage() {
    const [provider, setProvider] = useState<Provider['attributes'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const response = await providerService.getProvider(id);
                setProvider(response.data.attributes);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching provider:', error);
                setError('Failed to load provider details');
                setLoading(false);
            }
        };

        fetchProvider();
    }, [id]);

    const handleDeactivate = async () => {
        if (window.confirm('Are you sure you want to deactivate this provider?')) {
            try {
                await providerService.deleteProvider(id);
                router.push('/providers');
            } catch (error) {
                console.error('Error deactivating provider:', error);
                setError('Failed to deactivate provider');
            }
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!provider) return <div className="p-8">Provider not found</div>;

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/providers" className="text-blue-600 hover:underline">
                    &larr; Back to Providers
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6">
                    <h1 className="text-2xl font-bold text-white">
                        {provider.full_name}, {provider.credentials}
                    </h1>
                    <p className="text-blue-100">{provider.specialty}</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
                            <p className="mb-1"><span className="font-medium">Phone:</span> {provider.phone}</p>
                            <p className="mb-1"><span className="font-medium">Email:</span> {provider.email}</p>
                            <p className="mb-1"><span className="font-medium">NPI:</span> {provider.npi}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-2">Address</h2>
                            <p className="whitespace-pre-line">{provider.full_address}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex space-x-4">
                        <Link
                            href={`/providers/${id}/edit`}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Edit Provider
                        </Link>
                        <button
                            onClick={handleDeactivate}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Deactivate Provider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}