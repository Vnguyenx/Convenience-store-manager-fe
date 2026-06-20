// src/components/common/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/common/SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (value: string) => void;
    value?: string;
    debounceDelay?: number;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
                                                 placeholder = 'Tìm kiếm...',
                                                 onSearch,
                                                 value = '',
                                                 debounceDelay = 300,
                                             }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(inputValue);
        }, debounceDelay);

        return () => clearTimeout(timer);
    }, [inputValue, debounceDelay, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleClear = () => {
        setInputValue('');
        onSearch('');
    };

    return (
        <div className="search-bar">
            <svg className="search-bar__icon" viewBox="0 0 24 24" width="18" height="18">
                <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" strokeWidth="2" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleChange}
            />
            {inputValue && (
                <button className="search-bar__clear" onClick={handleClear}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;