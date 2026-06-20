// src/hooks/useProducts.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, deleteProduct, clearError } from '../store/productSlice';

export const useProducts = () => {
    const dispatch = useAppDispatch();
    const { products, loading, error } = useAppSelector((state) => state.product);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleDelete = async (docId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            await dispatch(deleteProduct(docId)).unwrap();
        }
    };

    const clearErrors = () => dispatch(clearError());

    return { products, loading, error, handleDelete, clearErrors, refetch: () => dispatch(fetchProducts()) };
};