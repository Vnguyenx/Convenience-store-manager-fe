// src/components/pos/POSProductArea.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Product } from '../../types/models';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';

const ITEMS_PER_PAGE = 8;

interface POSProductAreaProps {
    products: Product[];
    loading?: boolean;
    onAddToCart: (product: Product) => void;
}

const POSProductArea: React.FC<POSProductAreaProps> = ({ products, loading, onAddToCart }) => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);

    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean) as string[];
        return ['Tất cả', ...Array.from(new Set(cats))];
    }, [products]);

    const filtered = useMemo(() => {
        let list = [...products];
        if (activeCategory !== 'Tất cả') {
            list = list.filter(p => p.category === activeCategory);
        }
        if (search.trim()) {
            const kw = search.toLowerCase();
            list = list.filter(p =>
                p.name?.toLowerCase().includes(kw) ||
                p.ID?.toLowerCase().includes(kw) ||
                (p as any).code?.toLowerCase().includes(kw)
            );
        }
        return list;
    }, [products, activeCategory, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const paginated = useMemo(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, safePage]);

    const handleSearch = useCallback((val: string) => {
        setSearch(val);
        setCurrentPage(1);
    }, []);

    const handleCategory = useCallback((cat: string) => {
        setActiveCategory(cat);
        setCurrentPage(1);
    }, []);

    return (
        <div className="pos-products">
            {/* ── Vùng 1: Toolbar ── */}
            <div className="pos-toolbar-bg">
                <div className="pos-toolbar-inner">
                    <SearchBar
                        placeholder="Tìm theo tên hoặc mã sản phẩm..."
                        onSearch={handleSearch}
                        value={search}
                        debounceDelay={200}
                    />
                    <div className="pos-categories">
                        <select
                            className="pos-category-select"
                            value={activeCategory}
                            onChange={(e) => handleCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Vùng 2: Grid + Pagination ── */}
            <div className="pos-grid-bg">
                {loading ? (
                    <div className="pos-product-grid">
                        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                            <div key={i} className="pos-product-card pos-product-card--skeleton" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="pos-empty">Không tìm thấy sản phẩm</div>
                ) : (
                    <div className="pos-product-grid">
                        {paginated.map(p => {
                            const hasDiscount = p.discountPrice != null && p.discountPrice < p.sellPrice;
                            const pct = hasDiscount
                                ? Math.round((1 - p.discountPrice! / p.sellPrice) * 100)
                                : 0;
                            const outOfStock = (p.stockQuantity ?? 0) === 0;

                            return (
                                <div
                                    key={p.docId || p.ID}
                                    className={`pos-product-card${outOfStock ? ' is-out-of-stock' : ''}`}
                                    onClick={() => !outOfStock && onAddToCart(p)}
                                    title={outOfStock ? 'Hết hàng' : p.name}
                                >
                                    <div className="pos-product-card__img">
                                        {p.imageURL
                                            ? <img src={p.imageURL} alt={p.name} loading="lazy" />
                                            : <span className="pos-product-card__img-placeholder">📦</span>
                                        }
                                        {hasDiscount && !outOfStock && (
                                            <span className="pos-product-card__badge">-{pct}%</span>
                                        )}
                                        {outOfStock && (
                                            <span className="pos-product-card__out-badge">Hết hàng</span>
                                        )}
                                    </div>
                                    <div className="pos-product-card__body">
                                        <div className="pos-product-card__name">{p.name}</div>
                                        <div className="pos-product-card__price-row">
                                            {hasDiscount && (
                                                <span className="pos-product-card__price-old">
                                                    {p.sellPrice.toLocaleString('vi-VN')}đ
                                                </span>
                                            )}
                                            <span className="pos-product-card__price">
                                                {(hasDiscount ? p.discountPrice! : p.sellPrice).toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                        <div className="pos-product-card__stock">
                                            Tồn: {p.stockQuantity ?? 0}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pos-pagination">
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            maxVisible={7}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default POSProductArea;