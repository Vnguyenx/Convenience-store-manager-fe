import { ReactNode } from 'react';
import Navbar from './Navbar';

function StaffLayout({ children }: { children: ReactNode }) {
    return (
        <div className="staff-layout">
            <Navbar />
            <div className="staff-layout__content">{children}</div>
        </div>
    );
}

export default StaffLayout;