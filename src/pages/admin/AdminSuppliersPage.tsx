// src/pages/admin/AdminSuppliersPage.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/common/Panel';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import SupplierTable from '../../components/products/SupplierTable';
import SupplierFormModal from '../../components/products/SupplierFormModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deactivateSupplier,
    setSupplierFilters,
} from '../../store/supplierSlice';
import { Supplier } from '../../types/models';
import '../../styles/admin/adminInventory.css';

const PAGE_SIZE = 10;

const AdminSuppliersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items, loading, filters } = useAppSelector((state) => state.suppliers);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchSuppliers({ search: filters.search, isActive: filters.isActive }));
    }, [dispatch, filters.search, filters.isActive]);

    // reset về trang 1 mỗi khi filter/search thay đổi (invalidate trang hiện tại)
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.isActive]);

    const handleSearch = (value: string) => {
        dispatch(setSupplierFilters({ search: value }));
    };

    const openCreateModal = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleSubmit = async (payload: Partial<Supplier>) => {
        if (editingSupplier) {
            await dispatch(updateSupplier({ id: editingSupplier.id, payload })).unwrap();
        } else {
            await dispatch(createSupplier(payload)).unwrap();
        }
    };

    const handleDeactivate = async (supplier: Supplier) => {
        if (window.confirm(`Ngừng hợp tác với "${supplier.name}"?`)) {
            await dispatch(deactivateSupplier(supplier.id));
        }
    };

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const pagedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <AdminLayout title="Nhà cung cấp" subtitle="Quản lý danh sách nhà cung cấp">
            <Panel title="Danh sách nhà cung cấp">
                <div className="panel-toolbar">
                    <SearchBar placeholder="Tìm theo tên, mã, SĐT..." onSearch={handleSearch} value={filters.search} />
                    <Button variant="primary" onClick={openCreateModal}>+ Thêm nhà cung cấp</Button>
                </div>

                {loading ? (
                    <p className="loading-text">Đang tải...</p>
                ) : items.length === 0 ? (
                    <p className="empty-state">Chưa có nhà cung cấp nào.</p>
                ) : (
                    <>
                        <SupplierTable suppliers={pagedItems} onEdit={openEditModal} onDeactivate={handleDeactivate} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}
            </Panel>

            <SupplierFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                editingSupplier={editingSupplier}
            />
        </AdminLayout>
    );
};

export default AdminSuppliersPage;