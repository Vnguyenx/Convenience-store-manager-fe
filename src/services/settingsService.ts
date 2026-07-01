// src/services/settingsService.ts
import { ExpiryDiscountTier } from '../types/models';
import { getToken } from './authService';

const API_URL = 'http://localhost:5000' || process.env.REACT_APP_API_URL;

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Request failed');
    }
    return res.json();
};

export const getExpiryDiscountTiers = async (): Promise<ExpiryDiscountTier[]> => {
    const data = await fetchWithAuth(`${API_URL}/api/admin/settings/expiry-discount-tiers`);
    return data.data; // backend trả về { success, data: [...] }
};

export const updateExpiryDiscountTiers = async (tiers: ExpiryDiscountTier[]): Promise<ExpiryDiscountTier[]> => {
    const data = await fetchWithAuth(`${API_URL}/api/admin/settings/expiry-discount-tiers`, {
        method: 'PUT',
        body: JSON.stringify({ tiers }),
    });
    return data.data;
};