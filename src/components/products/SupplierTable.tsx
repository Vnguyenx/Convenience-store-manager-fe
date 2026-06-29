// src/components/products/SupplierTable.tsx
import React from 'react';
import DataTable from '../common/DataTable';
import Button from '../common/Button';
import { Supplier } from '../../types/models';

interface SupplierTableProps {
    suppliers: Supplier[];
    onEdit: (supplier: Supplier) => void;
    onDeactivate: (supplier: Supplier) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDeactivate }) => {
    const columns = [
        { key: 'code', label: 'Mã NCC' },
        { key: 'name', label: 'Tên nhà cung cấp' },
        { key: 'phone', label: 'SĐT' },
        { key: 'contactPerson', label: 'Người liên hệ' },
        {
            key: 'isActive',
            label: 'Trạng thái',
            render: (value: boolean) => (
                <span className={value ? 'badge badge--success' : 'badge badge--muted'}>
                    {value ? 'Đang hợp tác' : 'Ngừng hợp tác'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (_: any, row: Supplier) => (
                <div className="table-actions">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Sửa</Button>
                    {row.isActive && (
                        <Button size="sm" variant="danger" onClick={() => onDeactivate(row)}>Ngừng hợp tác</Button>
                    )}
                </div>
            ),
        },
    ];

    return <DataTable columns={columns} data={suppliers} />;
};

export default SupplierTable;