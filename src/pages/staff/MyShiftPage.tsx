// src/pages/staff/MyShiftPage.tsx
import React from 'react';
import AppBar from '../../components/layout/AppBar';
import Panel from '../../components/common/Panel';
import StaffTabs from '../../components/staff/StaffTabs';
import AttendanceHistory from "../../components/staff/shift/AttendanceHistory";
import ShiftCard from "../../components/staff/shift/ShiftCard";
import '../../styles/pos/myShift.css';


const MyShiftPage: React.FC = () => {
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
            <StaffTabs activeTab="shift" />
        </div>
    );

    return (
        <div className="app-shell">
            <div className="main-area" style={{ width: '100%' }}>
                <AppBar variant="app" title={titleNode} />
                <main className="main-content" style={{ padding: 'var(--sp-6)' }}>
                    <Panel>
                        <div className="my-shift-page">
                            <div className="my-shift-page__container">
                                <ShiftCard/>
                                <AttendanceHistory/>
                            </div>
                        </div>
                    </Panel>
                </main>
            </div>
        </div>
    );
};

export default MyShiftPage;