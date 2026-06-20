import React from 'react';
import '../../styles/layout/sidebar.css';
import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar__link${isActive ? ' is-active' : ''}`;

const AdminSidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar__brand">
                <div className="sidebar__brand-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M9 21V12h6v9"/></svg>
                </div>
                <div className="sidebar__brand-name">CS Manager<small>Admin Panel</small></div>
            </div>

            <nav className="sidebar__nav">
                <div className="sidebar__group">
                    <NavLink to="/admin/dashboard" end className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
                        Tổng quan
                    </NavLink>
                </div>

                <div className="sidebar__group">
                    <div className="sidebar__group-label">Sản phẩm &amp; Kho</div>
                    <NavLink to="/admin/products" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4v10l8 4 8-4V7z"/><path d="M12 22V12"/><path d="M20 7l-8 5-8-5"/></svg>
                        Sản phẩm
                    </NavLink>
                    <NavLink to="/admin/imports" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        Nhập kho
                    </NavLink>
                    <NavLink to="/admin/suppliers" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        Nhà cung cấp
                    </NavLink>
                    <NavLink to="/admin/inventory" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        Kiểm kê kho
                        <span className="sidebar__badge">3</span>
                    </NavLink>
                </div>

                <div className="sidebar__group">
                    <div className="sidebar__group-label">Khuyến mãi</div>
                    <NavLink to="/admin/promotions" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg>
                        Chương trình KM
                    </NavLink>
                </div>

                <div className="sidebar__group">
                    <div className="sidebar__group-label">Nhân viên</div>
                    <NavLink to="/admin/employees" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Nhân viên
                    </NavLink>
                    <NavLink to="/admin/shifts" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Phân ca làm việc
                    </NavLink>
                </div>

                <div className="sidebar__group">
                    <div className="sidebar__group-label">Khách hàng</div>
                    <NavLink to="/admin/customers" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Khách hàng
                    </NavLink>
                </div>

                <div className="sidebar__group">
                    <div className="sidebar__group-label">Doanh thu &amp; Báo cáo</div>
                    <NavLink to="/admin/revenue" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/></svg>
                        Thống kê doanh thu
                    </NavLink>
                    <NavLink to="/admin/transactions" className={navLinkClass}>
                        <svg viewBox="0 0 24 24"><path d="M16 3H8a2 2 0 0 0-2 2v16l6-3 6 3V5a2 2 0 0 0-2-2z"/></svg>
                        Lịch sử giao dịch
                    </NavLink>
                </div>
            </nav>
        </aside>
    );
};

export default AdminSidebar;