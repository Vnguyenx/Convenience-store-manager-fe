import { ReactNode } from 'react';
// import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';

function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="admin-layout">
            {/*<AdminSidebar />*/}
            <div className="admin-layout__main">
                <Navbar />
                <div className="admin-layout__content">{children}</div>
            </div>
        </div>
    );
}

export default AdminLayout;