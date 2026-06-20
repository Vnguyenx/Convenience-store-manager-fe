// src/components/staff/StaffTabs.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface StaffTabsProps {
    activeTab: 'pos' | 'lookup' | 'shift';
}

const StaffTabs: React.FC<StaffTabsProps> = ({ activeTab }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'pos', label: 'Bán hàng', path: '/pos' },
        { id: 'lookup', label: 'Tra cứu sản phẩm', path: '/products/lookup' },
        { id: 'shift', label: 'Ca làm của tôi', path: '/staff/shift' },
    ];

    return (
        <nav style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className="pos-category-chip"
                    style={{
                        background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                        borderColor: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                        color: activeTab === tab.id ? '#fff' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--fw-semi)',
                        border: '1.5px solid',
                        transition: 'all var(--transition)',
                    }}
                    onClick={() => navigate(tab.path)}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

export default StaffTabs;