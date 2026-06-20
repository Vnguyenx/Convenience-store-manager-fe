// src/components/common/Pagination.tsx
import React from 'react';
import '../../styles/common/Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   maxVisible = 5,
                                               }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, currentPage + half);

        if (end - start + 1 < maxVisible) {
            if (start === 1) {
                end = Math.min(totalPages, start + maxVisible - 1);
            } else if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination">
            <button
                className="pagination__btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ‹
            </button>

            {pages.map((page, index) => (
                <button
                    key={typeof page === 'number' ? page : `ellipsis-${index}`}
                    className={`pagination__btn ${page === currentPage ? 'pagination__btn--active' : ''}`}
                    disabled={page === '...' || page === currentPage}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button
                className="pagination__btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                ›
            </button>
        </div>
    );
};

export default Pagination;