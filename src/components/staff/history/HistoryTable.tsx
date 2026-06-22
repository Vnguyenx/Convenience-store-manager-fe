// src/pages/staff/history/HistoryTable.tsx
import React from 'react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import { SavedOrder } from '../../../services/orderService';
import { PAYMENT_LABEL, STATUS_LABEL, formatCurrency, formatDateTime } from '../../../utils/historyUtils';

interface HistoryTableProps {
    orders: SavedOrder[];
    loading: boolean;
    error: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onView: (order: SavedOrder) => void;
    onCancel: (order: SavedOrder) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
                                                       orders,
                                                       loading,
                                                       error,
                                                       currentPage,
                                                       totalPages,
                                                       onPageChange,
                                                       onView,
                                                       onCancel,
                                                   }) => {
    const columns = [
        { key: 'orderCode', label: 'Mã đơn' },
        {
            key: 'createdAt',
            label: 'Thời gian',
            render: (value: string) => formatDateTime(value),
        },
        {
            key: 'paymentMethod',
            label: 'Thanh toán',
            render: (value: string) => PAYMENT_LABEL[value] || value,
        },
        {
            key: 'total',
            label: 'Tổng tiền',
            render: (value: number) => formatCurrency(value),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value: string) => (
                <span className={`history-status-badge history-status-badge--${value}`}>
                    {STATUS_LABEL[value] || value}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Hành động',
            render: (_: any, row: SavedOrder) => (
                <div className="history-table__actions">
                    <Button size="sm" variant="secondary" onClick={() => onView(row)}>
                        Xem
                    </Button>
                    {row.status !== 'cancelled' && (
                        <Button size="sm" variant="danger" onClick={() => onCancel(row)}>
                            Huỷ đơn
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    if (error) {
        return <div className="history-table__error">{error}</div>;
    }

    if (loading) {
        return <div className="history-table__loading">Đang tải dữ liệu...</div>;
    }

    return (
        <>
            <DataTable columns={columns} data={orders} />
            {orders.length === 0 && (
                <div className="history-table__empty">Bạn chưa có đơn hàng nào</div>
            )}
            <div className="history-table__pagination">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </>
    );
};

export default HistoryTable;