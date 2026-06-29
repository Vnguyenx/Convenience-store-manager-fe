// src/services/apiClient.ts
import { getToken } from './authService'; // dùng lại helper lấy token có sẵn, đồng bộ với productService

const API_URL = 'http://localhost:5000' || process.env.REACT_APP_API_URL;

async function fetchWithAuth(path: string, options: RequestInit = {}) {
    const token = await getToken();
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
    };
    const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
    }
    return res.json();
}

export const apiClient = {
    get: (path: string) => fetchWithAuth(path),
    post: (path: string, body?: unknown) =>
        fetchWithAuth(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
    put: (path: string, body?: unknown) =>
        fetchWithAuth(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
    delete: (path: string) => fetchWithAuth(path, { method: 'DELETE' }),
};