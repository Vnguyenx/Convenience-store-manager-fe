// src/components/products/CategoryFilter.tsx
import React from 'react';
import '../../styles/pos/pos.css';

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
                                                           categories,
                                                           activeCategory,
                                                           onCategoryChange,
                                                       }) => {
    return (
        <div className="pos-categories">
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`pos-category-chip ${cat === activeCategory ? 'is-active' : ''}`}
                    onClick={() => onCategoryChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;