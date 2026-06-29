// src/services/purchaseOrderService.ts
import { apiClient } from './apiClient';
import { PurchaseOrder } from '../types/models';

export const purchaseOrderService = {
    getAll: (status?: string) =>
        apiClient.get(`/admin/purchase-orders${status ? `?status=${status}` : ''}`) as Promise<{ total: number; purchaseOrders: PurchaseOrder[] }>,
    getById: (id: string) => apiClient.get(`/admin/purchase-orders/${id}`) as Promise<PurchaseOrder>,
    create: (payload: { supplierId: string; note?: string; items: { productId: string; quantity: number; unitPrice: number; note?: string }[] }) =>
        apiClient.post('/admin/purchase-orders', payload),
    update: (id: string, payload: Partial<PurchaseOrder> & { items?: any[] }) =>
        apiClient.put(`/admin/purchase-orders/${id}`, payload),
    confirm: (id: string) => apiClient.post(`/admin/purchase-orders/${id}/confirm`),
    cancel: (id: string) => apiClient.put(`/admin/purchase-orders/${id}/cancel`),
    remove: (id: string) => apiClient.delete(`/admin/purchase-orders/${id}`),
};