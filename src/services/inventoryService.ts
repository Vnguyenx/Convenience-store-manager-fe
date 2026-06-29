// src/services/inventoryService.ts
import { apiClient } from './apiClient';
import { InventoryCheck, InventoryAlerts } from '../types/models';

export const inventoryService = {
    getAllChecks: (status?: string) =>
        apiClient.get(`/admin/inventory/checks${status ? `?status=${status}` : ''}`) as Promise<{ total: number; checks: InventoryCheck[] }>,
    getCheckById: (id: string) => apiClient.get(`/admin/inventory/checks/${id}`) as Promise<InventoryCheck>,
    createCheck: (payload: { note?: string; productIds?: string[] }) =>
        apiClient.post('/admin/inventory/checks', payload),
    updateCheckItem: (checkId: string, itemId: string, payload: { actualQuantity: number; note?: string }) =>
        apiClient.put(`/admin/inventory/checks/${checkId}/items/${itemId}`, payload),
    confirmCheck: (id: string) => apiClient.post(`/admin/inventory/checks/${id}/confirm`),
    deleteCheck: (id: string) => apiClient.delete(`/admin/inventory/checks/${id}`),
    getAlerts: (days?: number) =>
        apiClient.get(`/admin/inventory/alerts${days ? `?days=${days}` : ''}`) as Promise<InventoryAlerts>,
};