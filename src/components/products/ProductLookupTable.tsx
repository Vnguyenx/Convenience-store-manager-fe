// src/components/products/ProductLookupTable.tsx
import React from 'react';
import DataTable from '../common/DataTable';
import { Product } from '../../types/models';
import '../../styles/products/AdminProducts.css';

interface ProductLookupTableProps {
    products: Product[];
    loading?: boolean;
}

const ProductLookupTable: React.FC<ProductLookupTableProps> = ({ products, loading }) => {
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
    ];

    if (loading) return <div>Đang tải...</div>;

    return <DataTable columns={columns} data={products} />;
};

export default ProductLookupTable;