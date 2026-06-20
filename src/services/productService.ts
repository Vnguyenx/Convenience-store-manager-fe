// src/services/productService.ts
import { Product } from '../types/models';
import { getToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL;

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

export const getAllProducts = async (): Promise<Product[]> => {
    const data = await fetchWithAuth(`${API_URL}/api/products`);
    return data.products; // backend trả về { products: [...] }
};

export const getProductById = async (docId: string): Promise<Product> => {
    const data = await fetchWithAuth(`${API_URL}/api/products/${docId}`);
    return data.product; // { product: {...} }
};

export const createProduct = async (productData: Omit<Product, 'docId' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const data = await fetchWithAuth(`${API_URL}/api/products`, {
        method: 'POST',
        body: JSON.stringify(productData),
    });
    return data.product; // { product: {...} }
};

export const updateProduct = async (docId: string, data: Partial<Product>): Promise<Product> => {
    const result = await fetchWithAuth(`${API_URL}/api/products/${docId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return result.product;
};

export const deleteProduct = async (docId: string): Promise<void> => {
    await fetchWithAuth(`${API_URL}/api/products/${docId}`, {
        method: 'DELETE',
    });
};