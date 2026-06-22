// src/pages/staff/HistoryStaffPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import AppBar from '../../components/layout/AppBar';
import Panel from '../../components/common/Panel';
import StaffTabs from '../../components/staff/StaffTabs';
import { useAuth } from '../../hooks/useAuth';
import { SavedOrder, getOrders, cancelOrder } from '../../services/orderService';
import {
    HistoryToolbar,
    HistoryTable,
    OrderDetailModal,
    CancelOrderModal,
} from '../../components/staff/history/index';
import '../../styles/pos/HistoryStaffPage.css';

const PAGE_SIZE = 8;

const HistoryStaffPage: React.FC = () => {
    const { currentUser } = useAuth();

    const [orders, setOrders] = useState<SavedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedOrder, setSelectedOrder] = useState<SavedOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [cancelTarget, setCancelTarget] = useState<SavedOrder | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const fetchOrders = async () => {
        if (!currentUser?.uid) return;
        setLoading(true);
        setError('');
        try {
            // Chỉ lấy đơn của chính nhân viên này (cashierUID)
            const data = await getOrders({
                cashierUID: currentUser.uid,
                status: statusFilter || undefined,
            });
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Không thể tải lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.uid, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, statusFilter]);

    const filteredOrders = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();
        if (!keyword) return orders;
        return orders.filter((o) => o.orderCode.toLowerCase().includes(keyword));
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

    const titleNode = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="sidebar__brand-icon" style={{ background: 'var(--color-primary)' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                        <path d="M9 21V12h6v9" />
                    </svg>
                </div>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                    CS Manager
                </strong>
            </div>
            <StaffTabs activeTab="history" />
        </div>
    );

    return (
        <div className="app-shell">
            <div className="main-area" style={{ width: '100%' }}>
                <AppBar variant="app" title={titleNode}/>
                <main className="main-content" style={{ padding: 'var(--sp-6)' }}>
                    <Panel title="Lịch sử giao dịch của tôi">
                        <HistoryToolbar
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            onSearch={setSearchValue}
                            onReload={fetchOrders}
                        />

                        <HistoryTable
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
                </main>
            </div>

            <OrderDetailModal
                order={selectedOrder}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />

            <CancelOrderModal
                order={cancelTarget}
                reason={cancelReason}
                onReasonChange={setCancelReason}
                error={cancelError}
                isSubmitting={isCancelling}
                onClose={closeCancelModal}
                onConfirm={handleConfirmCancel}
            />
        </div>
    );
};

export default HistoryStaffPage;