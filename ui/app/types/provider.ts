export interface ProviderAttributes {
    //id?: string | number;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    specialty?: string;
    credentials?: string;
    city?: string;
    state?: string;
    active?: boolean;
    email?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    zip?: string;
    npi?: string;
    full_address?: string;
    profile_image_url?: string;
    [key: string]: any; // Allow additional properties
}

export interface Provider {
    id: string | number;
    attributes: ProviderAttributes;
    type?: string;
}

export interface ProviderFilters {
    specialty?: string;
    location?: string;
    [key: string]: string | undefined;
}

export interface ApiResponse<T> {
    data: T;
    meta?: {
        current_page?: number;
        total_pages?: number;
        total_count?: number;
        per_page?: number;
    };
}