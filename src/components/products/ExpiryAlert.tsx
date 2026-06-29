// src/components/products/ExpiryAlert.tsx
import React from 'react';
import DataTable from '../common/DataTable';
import { NearExpiryItem, ExpiredItem } from '../../types/models';

interface ExpiryAlertProps {
    nearExpiry: NearExpiryItem[];
    expired: ExpiredItem[];
}

const ExpiryAlert: React.FC<ExpiryAlertProps> = ({ nearExpiry, expired }) => {
    const expiredColumns = [
        { key: 'code', label: 'Mã SP' },
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'expiryDate', label: 'HSD' },
        { key: 'stockQuantity', label: 'Tồn' },
        {
            key: 'daysExpired',
            label: 'Đã hết hạn',
            render: (value: number) => <span className="text-danger">{value} ngày</span>,
        },
    ];

    const nearExpiryColumns = [
        { key: 'code', label: 'Mã SP' },
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'expiryDate', label: 'HSD' },
        { key: 'stockQuantity', label: 'Tồn' },
        {
            key: 'daysLeft',
            label: 'Còn lại',
            render: (value: number) => <span className="text-warning">{value} ngày</span>,
        },
    ];

    return (
        <div>
            <h4>Đã hết hạn ({expired.length})</h4>
            {expired.length === 0 ? <p className="empty-state">Không có sản phẩm hết hạn.</p> : <DataTable columns={expiredColumns} data={expired} />}

            <h4>Cận hạn sử dụng ({nearExpiry.length})</h4>
            {nearExpiry.length === 0 ? <p className="empty-state">Không có sản phẩm cận hạn.</p> : <DataTable columns={nearExpiryColumns} data={nearExpiry} />}
        </div>
    );
};

export default ExpiryAlert;