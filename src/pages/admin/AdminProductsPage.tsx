// src/pages/admin/AdminProductsPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/common/Panel';
import ProductTable from '../../components/products/ProductTable';
import ProductFormModal from '../../components/products/ProductFormModal';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/models';
import '../../styles/products/AdminProducts.css';

const AdminProductsPage: React.FC = () => {
    const { products, loading, error, handleDelete, clearErrors, refetch } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Lọc sản phẩm (bảo vệ lỗi undefined)
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        if (!searchTerm.trim()) return products;
        const keyword = searchTerm.toLowerCase().trim();
        return products.filter((p) => {
            const name = (p?.name ?? '').toLowerCase();
            const id = (p?.ID ?? '').toLowerCase();
            return name.includes(keyword) || id.includes(keyword);
        });
    }, [products, searchTerm]);

    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    // Khi totalPages thay đổi, nếu currentPage vượt quá thì chỉnh về totalPages
    // Nhưng chỉ thực hiện khi totalPages > 1 và không reset về 1 nếu totalPages vẫn đủ lớn
    // Thay vì dùng useEffect, ta xử lý trong handlePageChange và khi tính page hiện tại
    const validPage = Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        const page = Math.min(currentPage, totalPages); // đảm bảo không vượt quá
        const start = (page - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, totalPages, itemsPerPage]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Tìm kiếm mới reset về trang 1
    }, []);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        clearErrors();
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        refetch();
        setCurrentPage(1); // sau thêm/sửa, về trang 1
    };

    return (
        <AdminLayout title="Quản lý sản phẩm" subtitle="Danh sách sản phẩm">
            <Panel>
                <div className="product-list__toolbar">
                    <Button variant="primary" onClick={handleAdd}>
                        + Thêm sản phẩm
                    </Button>
                    <div className="product-list__search">
                        <SearchBar
                            placeholder="Tìm theo mã hoặc tên..."
                            onSearch={handleSearch}
                            value={searchTerm}
                        />
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <ProductTable
                    products={paginatedProducts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                />

                {totalPages > 1 && (
                    <div className="product-list__pagination">
                        <Pagination
                            currentPage={validPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </Panel>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                initialData={editingProduct}
            />
        </AdminLayout>
    );
};

export default AdminProductsPage;