// src/pages/admin/AdminTransactionsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/common/Panel';
import TransactionsKPISection from '../../components/transactions/TransactionsKPISection';
import TransactionsToolbar from '../../components/transactions/TransactionsToolbar';
import TransactionsTable from '../../components/transactions/TransactionsTable';
import OrderDetailModal from '../../components/transactions/OrderDetailModal';
//import CancelOrderModal from '../../components/transactions/CancelOrderModal';
import { SavedOrder, getOrders, cancelOrder } from '../../services/orderService';
import '../../styles/admin/AdminTransactionsPage.css';

const PAGE_SIZE = 10;

const AdminTransactionsPage: React.FC = () => {
    const [orders, setOrders] = useState<SavedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedOrder, setSelectedOrder] = useState<SavedOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [cancelTarget, setCancelTarget] = useState<SavedOrder | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getOrders({
                status: statusFilter || undefined,
                paymentMethod: paymentFilter || undefined,
            });
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách giao dịch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, paymentFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, statusFilter, paymentFilter]);

    const filteredOrders = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();
        if (!keyword) return orders;
        return orders.filter(
            (o) =>
                o.orderCode.toLowerCase().includes(keyword) ||
                o.cashierName?.toLowerCase().includes(keyword)
        );
    }, [orders, searchValue]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

    const pagedOrders = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, currentPage]);

    const openDetail = (order: SavedOrder) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const openCancelModal = (order: SavedOrder) => {
        setCancelTarget(order);
        setCancelReason('');
        setCancelError('');
    };

    const closeCancelModal = () => {
        setCancelTarget(null);
        setCancelReason('');
        setCancelError('');
    };

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        if (!cancelReason.trim()) {
            setCancelError('Vui lòng nhập lý do huỷ đơn');
            return;
        }
        setIsCancelling(true);
        setCancelError('');
        try {
            const updated = await cancelOrder(cancelTarget.orderCode, cancelReason.trim());
            setOrders((prev) =>
                prev.map((o) => (o.orderCode === updated.orderCode ? updated : o))
            );
            closeCancelModal();
        } catch (err: any) {
            setCancelError(err.message || 'Huỷ đơn thất bại');
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <AdminLayout title="Lịch sử giao dịch" subtitle="Quản lý và theo dõi toàn bộ đơn hàng đã bán">
            <div className="admin-transactions-page">
                <TransactionsKPISection orders={orders} />

                <Panel title="Danh sách đơn hàng">
                    <TransactionsToolbar
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        paymentFilter={paymentFilter}
                        onPaymentFilterChange={setPaymentFilter}
                        onSearch={setSearchValue}
                        onReload={fetchOrders}
                    />

                    <TransactionsTable
                        orders={pagedOrders}
                        loading={loading}
                        error={error}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onView={openDetail}
                        onCancel={openCancelModal}
                    />
                </Panel>

                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                />

                {/*<CancelOrderModal*/}
                {/*    order={cancelTarget}*/}
                {/*    reason={cancelReason}*/}
                {/*    onReasonChange={setCancelReason}*/}
                {/*    error={cancelError}*/}
                {/*    isSubmitting={isCancelling}*/}
                {/*    onClose={closeCancelModal}*/}
                {/*    onConfirm={handleConfirmCancel}*/}
                {/*/>*/}
            </div>
        </AdminLayout>
    );
};

export default AdminTransactionsPage;