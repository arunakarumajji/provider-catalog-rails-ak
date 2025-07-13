'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import providerService from '../services/api';

interface FormData {
    first_name: string;
    last_name: string;
    npi: string;
    specialty: string;
    credentials: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip: string;
}

interface FormErrors {
    general?: string;
    profile_image?: string;
    [key: string]: string | undefined;
}

export default function ProviderFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isEditMode = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        npi: '',
        specialty: '',
        credentials: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: ''
    });

    // Profile image state
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // Fetch provider data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const fetchProvider = async () => {
                try {
                    const response = await providerService.getProvider(id);
                    const providerData = response.data.attributes;

                    setFormData({
                        first_name: providerData.first_name || '',
                        last_name: providerData.last_name || '',
                        npi: providerData.npi || '',
                        specialty: providerData.specialty || '',
                        credentials: providerData.credentials || '',
                        email: providerData.email || '',
                        phone: providerData.phone || '',
                        address_line1: providerData.address_line1 || '',
                        address_line2: providerData.address_line2 || '',
                        city: providerData.city || '',
                        state: providerData.state || '',
                        zip: providerData.zip || ''
                    });

                    // Set the current profile image URL if it exists
                    if (providerData.profile_image_url) {
                        setCurrentImageUrl(providerData.profile_image_url);
                        setImagePreview(providerData.profile_image_url);
                    }

                    setInitialLoading(false);
                } catch (error) {
                    console.error('Error fetching provider:', error);
                    setErrors({ general: 'Failed to load provider data' });
                    setInitialLoading(false);
                }
            };

            fetchProvider();
        }
    }, [id, isEditMode]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            const newErrors = {...errors};
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    // Handle profile image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setErrors({
                    ...errors,
                    profile_image: 'Please select a valid image file (JPEG, JPG, or PNG)'
                });
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({
                    ...errors,
                    profile_image: 'Image file must be less than 5MB'
                });
                return;
            }

            // Clear any previous image errors
            if (errors.profile_image) {
                const newErrors = {...errors};
                delete newErrors.profile_image;
                setErrors(newErrors);
            }

            setProfileImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle removing profile image
    const handleRemoveImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        setCurrentImageUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'npi', 'specialty', 'email'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);

        if (missingFields.length > 0) {
            setErrors({ general: `Please fill in required fields: ${missingFields.join(', ')}` });
            setLoading(false);
            return;
        }

        try {
            // Check if we're authenticated
            const token = localStorage.getItem('authToken');
            if (!token) {
                setErrors({ general: 'Authentication error. Please log in again.' });
                router.push('/login');
                return;
            }

            // Use the appropriate service method based on mode
            let response;
            if (isEditMode) {
                response = await providerService.updateProvider(id, formData, profileImage || undefined);
                console.log('Provider updated:', response);
            } else {
                response = await providerService.createProvider(formData, profileImage || undefined);
                console.log('Provider created:', response);
            }

            alert(`Provider ${isEditMode ? 'updated' : 'saved'} successfully!`);
            router.push('/providers');
        } catch (err: any) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} provider:`, err);
            console.log('Error response data:', err.response?.data);

            if (err.response?.data?.errors) {
                // Field-specific errors
                setErrors(err.response.data.errors);
            } else {
                // General error
                const errorMessage = err.response?.data?.error ||
                    err.response?.data?.message ||
                    `An error occurred while ${isEditMode ? 'updating' : 'creating'} the provider. Please try again.`;
                setErrors({ general: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    // Specialty options for dropdown
    const specialties = [
        'Cardiology',
        'Dermatology',
        'Endocrinology',
        'Family Medicine',
        'Gastroenterology',
        'Internal Medicine',
        'Neurology',
        'Obstetrics and Gynecology',
        'Oncology',
        'Ophthalmology',
        'Orthopedics',
        'Pediatrics',
        'Psychiatry',
        'Radiology',
        'Urology'
    ];

    if (initialLoading) {
        return <div className="p-8">Loading provider data...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEditMode ? 'Edit Provider' : 'Add New Provider'}
            </h1>

            {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    {errors.general}
                </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                {/* Profile Image Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Profile Image</h2>
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Provider preview"
                                        className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        aria-label="Remove image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <input
                                type="file"
                                id="profile_image"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500">
                                Accepted formats: JPEG, JPG, PNG. Max size: 5MB
                            </p>
                            {errors.profile_image && (
                                <p className="text-sm text-red-600">{errors.profile_image}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="col-span-2">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h2>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`w-full rounded-md border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                            required
                        />
                        {errors.first_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`w-full rounded-md border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                            required
                        />
                        {errors.last_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="npi" className="block text-sm font-medium text-gray-700 mb-1">
                            NPI Number *
                        </label>
                        <input
                            type="text"
                            id="npi"
                            name="npi"
                            value={formData.npi}
                            onChange={handleChange}
                            className={`w-full rounded-md border ${errors.npi ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                            required
                        />
                        {errors.npi && (
                            <p className="mt-1 text-sm text-red-600">{errors.npi}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                            Specialty *
                        </label>
                        <select
                            id="specialty"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        >
                            <option value="">Select a specialty</option>
                            {specialties.map(specialty => (
                                <option key={specialty} value={specialty}>
                                    {specialty}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="credentials" className="block text-sm font-medium text-gray-700 mb-1">
                            Credentials
                        </label>
                        <input
                            type="text"
                            id="credentials"
                            name="credentials"
                            value={formData.credentials}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="e.g., MD, PhD, RN"
                        />
                    </div>

                    {/* Contact Information */}
                    <div className="col-span-2">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2 mt-4">Contact Information</h2>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    {/* Address Information */}
                    <div className="col-span-2">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2 mt-4">Address</h2>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                        </label>
                        <input
                            type="text"
                            id="address_line1"
                            name="address_line1"
                            value={formData.address_line1}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                        </label>
                        <input
                            type="text"
                            id="address_line2"
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            maxLength={2}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                        </label>
                        <input
                            type="text"
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-4">
                    <button
                        type="button"
                        onClick={() => router.push('/providers')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Saving...' : isEditMode ? 'Update Provider' : 'Save Provider'}
                    </button>
                </div>
            </form>
        </div>
    );
}