// src/components/products/StockEntryTable.tsx
// Danh sách phiếu nhập kho (purchase orders)
import React from 'react';
import DataTable from '../common/DataTable';
import Button from '../common/Button';
import { PurchaseOrder } from '../../types/models';
import { formatCurrency } from '../../utils/formatCurrency';

interface StockEntryTableProps {
    orders: PurchaseOrder[];
    onView: (order: PurchaseOrder) => void;
    onConfirm: (order: PurchaseOrder) => void;
    onCancel: (order: PurchaseOrder) => void;
    onDelete: (order: PurchaseOrder) => void;
}

const statusLabel: Record<string, string> = {
    draft: 'Phiếu tạm',
    confirmed: 'Đã nhập kho',
    cancelled: 'Đã hủy',
};

const StockEntryTable: React.FC<StockEntryTableProps> = ({ orders, onView, onConfirm, onCancel, onDelete }) => {
    const columns = [
        { key: 'poCode', label: 'Mã phiếu' },
        { key: 'supplierName', label: 'Nhà cung cấp' },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value: string) => (
                <span className={`badge badge--${value === 'confirmed' ? 'success' : value === 'cancelled' ? 'muted' : 'warning'}`}>
                    {statusLabel[value] || value}
                </span>
            ),
        },
        { key: 'createdAt', label: 'Ngày tạo', render: (v: string) => new Date(v).toLocaleDateString('vi-VN') },
        {
            key: 'actions',
            label: '',
            render: (_: any, row: PurchaseOrder) => (
                <div className="table-actions">
                    <Button size="sm" variant="secondary" onClick={() => onView(row)}>Xem</Button>
                    {row.status === 'draft' && (
                        <>
                            <Button size="sm" variant="success" onClick={() => onConfirm(row)}>Nhập kho</Button>
                            <Button size="sm" variant="warning" onClick={() => onCancel(row)}>Hủy</Button>
                            <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Xóa</Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return <DataTable columns={columns} data={orders} />;
};

export default StockEntryTable;