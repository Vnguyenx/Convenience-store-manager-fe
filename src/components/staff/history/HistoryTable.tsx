// src/pages/staff/history/HistoryTable.tsx
import React from 'react';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import { SavedOrder } from '../../../services/orderService';
import { PAYMENT_LABEL, STATUS_LABEL, formatCurrency, formatDateTime } from '../../../utils/historyUtils';

// Chỉ cho phép huỷ đơn nếu đơn được tạo trong ngày hôm nay.
// Đơn của những ngày trước đó chỉ được xem, không được huỷ.
const isOrderToday = (createdAt: string): boolean => {
    if (!createdAt) return false;
    const orderDate = new Date(createdAt);
    if (isNaN(orderDate.getTime())) return false;

    const now = new Date();
    return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate()
    );
};

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
            render: (_: any, row: SavedOrder) => {
                const canCancel = row.status !== 'cancelled' && isOrderToday(row.createdAt);

                return (
                    <div className="history-table__actions">
                        <Button size="sm" variant="secondary" onClick={() => onView(row)}>
                            Xem
                        </Button>
                        {row.status !== 'cancelled' && (
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => onCancel(row)}
                                disabled={!canCancel}
                                title={
                                    canCancel
                                        ? undefined
                                        : 'Chỉ có thể huỷ đơn trong ngày, đơn của ngày trước không thể huỷ'
                                }
                            >
                                Huỷ đơn
                            </Button>
                        )}
                    </div>
                );
            },
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