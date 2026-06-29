// src/services/supplierService.ts
import { apiClient } from './apiClient';
import { Supplier } from '../types/models';

export const supplierService = {
    getAll: (params?: { isActive?: boolean; search?: string }) => {
        const qs = new URLSearchParams();
        if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
        if (params?.search) qs.set('search', params.search);
        const query = qs.toString() ? `?${qs.toString()}` : '';
        return apiClient.get(`/admin/suppliers${query}`) as Promise<{ total: number; suppliers: Supplier[] }>;
    },
    getById: (id: string) => apiClient.get(`/admin/suppliers/${id}`) as Promise<Supplier>,
    create: (payload: Partial<Supplier>) => apiClient.post('/admin/suppliers', payload),
    update: (id: string, payload: Partial<Supplier>) => apiClient.put(`/admin/suppliers/${id}`, payload),
    remove: (id: string) => apiClient.delete(`/admin/suppliers/${id}`),
};