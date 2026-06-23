// src/components/employees/Pagination.tsx
import React from 'react';

interface Props {
    page: number;       // trang hiện tại (bắt đầu từ 1)
    pageSize: number;
    total: number;       // tổng số dòng
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

const Pagination: React.FC<Props> = ({
    page, pageSize, total, onPageChange, onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
}) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const to = Math.min(safePage * pageSize, total);

    // Tạo danh sách số trang hiển thị (rút gọn nếu nhiều trang)
    const pages: (number | '...')[] = [];
    const windowSize = 1;
    for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || Math.abs(p - safePage) <= windowSize) {
            pages.push(p);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    if (total === 0) return null;

    return (
        <div className="sm-pagination">
            <div className="sm-pagination__info">
                Hiển thị {from}–{to} / {total}
            </div>

            <div className="sm-pagination__controls">
                <button
                    className="sm-pagination__btn"
                    onClick={() => onPageChange(safePage - 1)}
                    disabled={safePage <= 1}
                    aria-label="Trang trước"
                >
                    ‹
                </button>

                {pages.map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="sm-pagination__ellipsis">…</span>
                    ) : (
                        <button
                            key={p}
                            className={`sm-pagination__btn ${p === safePage ? 'sm-pagination__btn--active' : ''}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    className="sm-pagination__btn"
                    onClick={() => onPageChange(safePage + 1)}
                    disabled={safePage >= totalPages}
                    aria-label="Trang sau"
                >
                    ›
                </button>
            </div>

            {onPageSizeChange && (
                <select
                    className="sm-field__input sm-field__input--select sm-pagination__size"
                    value={pageSize}
                    onChange={e => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt} / trang</option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default Pagination;
