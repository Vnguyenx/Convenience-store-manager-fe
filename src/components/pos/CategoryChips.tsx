import React from 'react';

interface CategoryChipsProps {
    categories: string[];
    activeCategory?: string;
    onSelect?: (cat: string) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ categories, activeCategory, onSelect }) => {
    return (
        <div className="pos-categories">
            {categories.map((cat) => (
                <span
                    key={cat}
                    className={`pos-category-chip ${activeCategory === cat ? 'is-active' : ''}`}
                    onClick={() => onSelect?.(cat)}
                >
          {cat}
        </span>
            ))}
        </div>
    );
};

export default CategoryChips;