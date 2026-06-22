// src/pages/staff/ProductLookupPage.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppBar from '../../components/layout/AppBar';
import Panel from '../../components/common/Panel';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import ProductGrid from '../../components/products/ProductGrid';
import StaffTabs from '../../components/staff/StaffTabs';
import { useProducts } from '../../hooks/useProducts';
import '../../styles/products/AdminProducts.css';

const ProductLookupPage: React.FC = () => {
    const { products, loading, error } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // State cho filter
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name-asc');
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);

    // Lấy danh sách category từ sản phẩm
    useEffect(() => {
        if (products && products.length > 0) {
            const cats = products.map(p => p.category).filter(Boolean) as string[];
            const uniqueCats = Array.from(new Set(cats));
            setCategories(uniqueCats);
        }
    }, [products]);

    // Tiêu đề AppBar với tabs
    const titleNode = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="sidebar__brand-icon" style={{ background: 'var(--color-primary)' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                        <path d="M9 21V12h6v9" />
                    </svg>
                </div>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                    CS Manager
                </strong>
            </div>
            <StaffTabs activeTab="lookup" />
        </div>
    );

    // Lọc và sắp xếp sản phẩm
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];

        let filtered = [...products];

        // Tìm kiếm
        if (searchTerm.trim()) {
            const keyword = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(
                (p) =>
                    (p?.name ?? '').toLowerCase().includes(keyword) ||
                    (p?.ID ?? '').toLowerCase().includes(keyword)
            );
        }

        // Lọc theo danh mục
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        // Lọc theo khoảng giá
        const min = priceMin !== '' ? Number(priceMin) : null;
        const max = priceMax !== '' ? Number(priceMax) : null;
        if (min !== null) {
            filtered = filtered.filter((p) => p.sellPrice >= min);
        }
        if (max !== null) {
            filtered = filtered.filter((p) => p.sellPrice <= max);
        }

        // Sắp xếp
        switch (sortBy) {
            case 'name-asc':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name-desc':
                filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case 'price-asc':
                filtered.sort((a, b) => a.sellPrice - b.sellPrice);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.sellPrice - a.sellPrice);
                break;
            default:
                break;
        }

        return filtered;
    }, [products, searchTerm, selectedCategory, sortBy, priceMin, priceMax]);

    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const validPage = Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        const start = (validPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, validPage, itemsPerPage]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    // Reset trang khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, sortBy, priceMin, priceMax]);

    return (
        <div className="app-shell">
            <div className="main-area" style={{ width: '100%' }}>
                <AppBar variant="app" title={titleNode}/>
                <main className="main-content" style={{ padding: 'var(--sp-6)', width: '1200px', margin: '0 auto'  }}>
                    <Panel>
                        <div className="product-lookup__toolbar">
                            <div className="product-lookup__search">
                                <SearchBar
                                    placeholder="Tìm theo mã hoặc tên sản phẩm..."
                                    onSearch={handleSearch}
                                    value={searchTerm}
                                />
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                {totalItems} sản phẩm
                            </div>
                        </div>

                        {/* Bộ lọc */}
                        <div className="product-filters">
                            <div className="filter-group">
                                <label>Danh mục</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Sắp xếp</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name-asc">Tên A → Z</option>
                                    <option value="name-desc">Tên Z → A</option>
                                    <option value="price-asc">Giá tăng dần</option>
                                    <option value="price-desc">Giá giảm dần</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Giá từ</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    min="0"
                                />
                            </div>

                            <div className="filter-group">
                                <label>đến</label>
                                <input
                                    type="number"
                                    placeholder="∞"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <ProductGrid products={paginatedProducts} loading={loading} />

                        {totalPages > 1 && (
                            <div className="product-list__pagination">
                                <Pagination
                                    currentPage={validPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </Panel>
                </main>
            </div>
        </div>
    );
};

export default ProductLookupPage;