import React from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    discount?: number;
    image?: string;
}

interface ProductAreaProps {
    products: Product[];
    onProductClick?: (product: Product) => void;
}

const ProductArea: React.FC<ProductAreaProps> = ({ products, onProductClick }) => {
    return (
        <div className="pos-product-grid">
            {products.map((p) => (
                <div key={p.id} className="pos-product-card" onClick={() => onProductClick?.(p)}>
                    {p.discount && <span className="pos-product-card__badge">-{p.discount}%</span>}
                    <div className="pos-product-card__img">{p.image || '[ảnh]'}</div>
                    <div className="pos-product-card__body">
                        <div className="pos-product-card__name">{p.name}</div>
                        <div>
                            {p.oldPrice && <span className="pos-product-card__price-old">{p.oldPrice.toLocaleString()}đ</span>}
                            <span className="pos-product-card__price">{p.price.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductArea;