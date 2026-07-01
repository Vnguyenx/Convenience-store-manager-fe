// src/components/products/ProductTable.tsx
import React from 'react';
import DataTable from '../common/DataTable';
import { Product } from '../../types/models';

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (docId: string) => void;
    loading?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete, loading }) => {
    const columns = [
        {
            key: 'imageURL',
            label: 'Ảnh',
            render: (value: string) => (
                <img
                    src={value || '/placeholder-image.png'}
                    alt="product"
                    className="product-table__thumb"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }}
                />
            ),
        },
        { key: 'ID', label: 'Mã SP' },
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'category', label: 'Danh mục' },
        { key: 'unit', label: 'Đơn vị' },
        {
            key: 'sellPrice',
            label: 'Giá bán',
            render: (val: number) => `${val.toLocaleString('vi-VN')}đ`,
        },
        {
            key: 'stockQuantity',
            label: 'Tồn kho',
            render: (val: number) => (
                <span className={val <= 0 ? 'text-danger' : ''}>{val}</span>
            ),
        },
        // ✅ MỚI: cột trạng thái hạn sử dụng — dựa vào field isExpired/daysLeft/expiryDiscountPercent
        // do BE tự tính (enrichWithExpiryInfo), không sửa logic các cột khác.
        {
            key: 'expiryStatus',
            label: 'Hạn sử dụng',
            render: (_: any, row: Product) => {
                if (!row.expiryDate) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
                if (row.isExpired) {
                    return <span className="badge badge-danger">Đã hết hạn</span>;
                }
                if (row.expiryDiscountPercent && row.expiryDiscountPercent > 0) {
                    return (
                        <span className="badge badge-warning">
                            Còn {row.daysLeft} ngày · -{row.expiryDiscountPercent}%
                        </span>
                    );
                }
                return <span style={{ color: 'var(--color-text-muted)' }}>Còn {row.daysLeft} ngày</span>;
            },
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (_: any, row: Product) => (
                <div className="action-buttons">
                    <button className="btn btn-sm btn-primary" onClick={() => onEdit(row)}>
                        Sửa
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(row.docId!)}>
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    if (loading) return <div>Đang tải...</div>;

    return <DataTable columns={columns} data={products} />;
};

export default ProductTable;