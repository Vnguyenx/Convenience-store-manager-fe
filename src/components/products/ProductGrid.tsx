// src/components/products/ProductGrid.tsx
import React from 'react';
import { Product } from '../../types/models';
import '../../styles/products/ProductGrid.css';

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    onProductClick?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, onProductClick }) => {
    if (loading) return <div>Đang tải...</div>;

    if (products.length === 0) {
        return <div className="product-grid-empty">Không tìm thấy sản phẩm</div>;
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <div
                    key={product.docId || product.ID}
                    className="product-grid__item"
                    onClick={() => onProductClick?.(product)}
                >
                    <div className="product-grid__image">
                        {product.imageURL ? (
                            <img src={product.imageURL} alt={product.name} />
                        ) : (
                            <span>📦</span>
                        )}
                        {product.discountPrice != null && product.discountPrice < product.sellPrice && (
                            <span className="product-grid__badge">-{Math.round((1 - product.discountPrice / product.sellPrice) * 100)}%</span>
                        )}
                    </div>
                    <div className="product-grid__body">
                        <div className="product-grid__name">{product.name}</div>
                        <div className="product-grid__price">
                            {product.discountPrice != null && product.discountPrice < product.sellPrice ? (
                                <>
                                    <span className="product-grid__price-old">
                                        {product.sellPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="product-grid__price-current">
                                        {product.discountPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                </>
                            ) : (
                                <span className="product-grid__price-current">
                                    {product.sellPrice.toLocaleString('vi-VN')}đ
                                </span>
                            )}
                        </div>
                        <div className="product-grid__stock">
                            Tồn: {product.stockQuantity}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;