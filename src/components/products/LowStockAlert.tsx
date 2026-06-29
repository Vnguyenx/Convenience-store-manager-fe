// src/components/products/LowStockAlert.tsx
import React from 'react';
import DataTable from '../common/DataTable';
import { LowStockItem } from '../../types/models';

const LowStockAlert: React.FC<{ items: LowStockItem[] }> = ({ items }) => {
    const columns = [
        { key: 'code', label: 'Mã SP' },
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'stockQuantity', label: 'Tồn hiện tại' },
        { key: 'minStockThreshold', label: 'Ngưỡng tối thiểu' },
        {
            key: 'shortage',
            label: 'Thiếu',
            render: (value: number) => <span className="text-danger">{value}</span>,
        },
    ];
    if (items.length === 0) return <p className="empty-state">Không có sản phẩm tồn thấp.</p>;
    return <DataTable columns={columns} data={items} />;
};

export default LowStockAlert;