// src/pages/admin/AdminStockEntryPage.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StockEntryTable from '../../components/products/StockEntryTable';
import StockEntryModal from '../../components/products/StockEntryModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSuppliers } from '../../store/supplierSlice';
import {
    fetchPurchaseOrders,
    fetchPurchaseOrderDetail,
    createPurchaseOrder,
    confirmPurchaseOrder,
    cancelPurchaseOrder,
    deletePurchaseOrder,
    clearCurrentOrder,
} from '../../store/purchaseOrderSlice';
import { PurchaseOrder } from '../../types/models';
import { formatCurrency } from '../../utils/formatCurrency';
import '../../styles/admin/adminInventory.css';


const PAGE_SIZE = 10;

const AdminStockEntryPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: orders, currentOrder, loading } = useAppSelector((state) => state.purchaseOrders);
    const { items: suppliers } = useAppSelector((state) => state.suppliers);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchPurchaseOrders(undefined));
        dispatch(fetchSuppliers(undefined));
    }, [dispatch]);

    const handleCreate = async (payload: Parameters<typeof createPurchaseOrder>[0]) => {
        await dispatch(createPurchaseOrder(payload)).unwrap();
        setCurrentPage(1); // phiếu mới nằm đầu danh sách
    };

    const handleView = async (order: PurchaseOrder) => {
        await dispatch(fetchPurchaseOrderDetail(order.id));
        setIsDetailOpen(true);
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        dispatch(clearCurrentOrder());
    };

    const handleConfirm = async (order: PurchaseOrder) => {
        if (window.confirm(`Xác nhận nhập kho phiếu ${order.poCode}? Tồn kho sản phẩm sẽ được cộng thêm.`)) {
            await dispatch(confirmPurchaseOrder(order.id));
        }
    };

    const handleCancel = async (order: PurchaseOrder) => {
        if (window.confirm(`Hủy phiếu ${order.poCode}?`)) {
            await dispatch(cancelPurchaseOrder(order.id));
        }
    };

    const handleDelete = async (order: PurchaseOrder) => {
        if (window.confirm(`Xóa phiếu ${order.poCode}? Hành động không thể hoàn tác.`)) {
            await dispatch(deletePurchaseOrder(order.id));
        }
    };

    const detailColumns = [
        { key: 'productCode', label: 'Mã SP' },
        { key: 'productName', label: 'Tên sản phẩm' },
        { key: 'quantity', label: 'Số lượng' },
        { key: 'unitPrice', label: 'Đơn giá', render: (v: number) => formatCurrency(v) },
        { key: 'totalPrice', label: 'Thành tiền', render: (v: number) => formatCurrency(v) },
    ];

    const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
    const pagedOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <AdminLayout title="Nhập kho" subtitle="Quản lý phiếu nhập hàng từ nhà cung cấp">
            <Panel title="Danh sách phiếu nhập kho">
                <div className="panel-toolbar">
                    <Button variant="primary" onClick={() => setIsCreateOpen(true)}>+ Tạo phiếu nhập kho</Button>
                </div>
                {loading ? (
                    <p className="loading-text">Đang tải...</p>
                ) : orders.length === 0 ? (
                    <p className="empty-state">Chưa có phiếu nhập kho nào.</p>
                ) : (
                    <>
                        <StockEntryTable
                            orders={pagedOrders}
                            onView={handleView}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}
            </Panel>

            <StockEntryModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                suppliers={suppliers}
                onSubmit={handleCreate}
            />

            <Modal isOpen={isDetailOpen} onClose={closeDetail} title={`Phiếu nhập kho ${currentOrder?.poCode || ''}`} size="lg">
                {currentOrder && (
                    <>
                        <p>Nhà cung cấp: <strong>{currentOrder.supplierName}</strong></p>
                        <p>Ghi chú: {currentOrder.note || '—'}</p>
                        <DataTable columns={detailColumns} data={currentOrder.items || []} />
                    </>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default AdminStockEntryPage;