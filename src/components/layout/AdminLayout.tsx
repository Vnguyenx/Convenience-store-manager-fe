import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AppBar from './AppBar';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    return (
        <div className="app-shell">
            <AdminSidebar />
            <div className="main-area">
                <AppBar variant="app" title={title} subtitle={subtitle} />
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}

export default AdminLayout;