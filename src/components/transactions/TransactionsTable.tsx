// src/pages/admin/transactions/TransactionsTable.tsx
import React from 'react';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { SavedOrder } from '../../services/orderService';
import { PAYMENT_LABEL, STATUS_LABEL, formatCurrency, formatDateTime } from '../../utils/transactionUtils';

interface TransactionsTableProps {
    orders: SavedOrder[];
    loading: boolean;
    error: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onView: (order: SavedOrder) => void;
    onCancel: (order: SavedOrder) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
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
        { key: 'cashierName', label: 'Nhân viên' },
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
                <span className={`transactions-status-badge transactions-status-badge--${value}`}>
                    {STATUS_LABEL[value] || value}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Hành động',
            render: (_: any, row: SavedOrder) => (
                <div className="transactions-table__actions">
                    <Button size="sm" variant="secondary" onClick={() => onView(row)}>
                        Xem
                    </Button>
                    {/*{row.status !== 'cancelled' && (*/}
                    {/*    <Button size="sm" variant="danger" onClick={() => onCancel(row)}>*/}
                    {/*        Huỷ đơn*/}
                    {/*    </Button>*/}
                    {/*)}*/}
                </div>
            ),
        },
    ];

    if (error) {
        return <div className="transactions-table__error">{error}</div>;
    }

    if (loading) {
        return <div className="transactions-table__loading">Đang tải dữ liệu...</div>;
    }

    return (
        <>
            <DataTable columns={columns} data={orders} />
            {orders.length === 0 && (
                <div className="transactions-table__empty">Không có đơn hàng nào</div>
            )}
            <div className="transactions-table__pagination">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </>
    );
};

export default TransactionsTable;