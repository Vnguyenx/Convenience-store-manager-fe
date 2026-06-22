// src/pages/staff/POSPage.tsx
import React from 'react';
import AppBar from '../../components/layout/AppBar';
import POSLayout from '../../components/pos/POSLayout';
import StaffTabs from '../../components/staff/StaffTabs';
import '../../styles/pos/pos.css';

const POSPage: React.FC = () => {
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
            <StaffTabs activeTab="pos" />
        </div>
    );

    return (
        <div className="app-shell">
            <div className="main-area" style={{ width: '100%' }}>
                <AppBar variant="app" title={titleNode}/>
                <POSLayout />
            </div>
        </div>
    );
};

export default POSPage;