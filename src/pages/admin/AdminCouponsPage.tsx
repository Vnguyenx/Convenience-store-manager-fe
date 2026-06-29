// src/pages/admin/AdminCouponsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import AppBar from '../../components/layout/AppBar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import CouponTable from '../../components/coupons/CouponTable';
import CouponFormModal from '../../components/coupons/CouponFormModal';
import { Coupon, CouponFormData } from '../../types/coupon';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from '../../services/couponService';
import '../../styles/admin/adminCoupons.css';

type FilterType = 'all' | 'active' | 'inactive' | 'expired';

const AdminCouponsPage: React.FC = () => {
    /* ---- state ---- */
    const [coupons, setCoupons]         = useState<Coupon[]>([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [filter, setFilter]           = useState<FilterType>('all');

    // modal: form
    const [showForm, setShowForm]       = useState(false);
    const [editing, setEditing]         = useState<Coupon | null>(null);
    const [saving, setSaving]           = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);

    // modal: delete confirm
    const [toDelete, setToDelete]       = useState<Coupon | null>(null);
    const [deleting, setDeleting]       = useState(false);

    /* ---- fetch ---- */
    const load = async () => {
        setLoading(true);
        try {
            const data = await getAllCoupons();
            setCoupons(data);
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    /* ---- derived stats ---- */
    const now = new Date();
    const stats = useMemo(() => {
        const active  = coupons.filter(c => c.isActive && (!c.expiryDate || new Date(c.expiryDate) >= now));
        const expired = coupons.filter(c => c.expiryDate && new Date(c.expiryDate) < now);
        const used    = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
        return { total: coupons.length, active: active.length, expired: expired.length, used };
    }, [coupons]);

    /* ---- filtered list ---- */
    const filtered = useMemo(() => {
        let list = coupons;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(c =>
                c.code.toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q)
            );
        }
        if (filter === 'active')   list = list.filter(c => c.isActive && (!c.expiryDate || new Date(c.expiryDate) >= now));
        if (filter === 'inactive') list = list.filter(c => !c.isActive);
        if (filter === 'expired')  list = list.filter(c => c.expiryDate && new Date(c.expiryDate) < now);
        return list;
    }, [coupons, search, filter]);

    /* ---- handlers ---- */
    const openCreate = () => { setEditing(null); setFormError(null); setShowForm(true); };
    const openEdit   = (c: Coupon) => { setEditing(c); setFormError(null); setShowForm(true); };

    const handleSave = async (data: CouponFormData) => {
        setSaving(true);
        setFormError(null);
        try {
            if (editing) {
                const updated = await updateCoupon(editing.id, data);
                setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await createCoupon(data);
                setCoupons(prev => [created, ...prev]);
            }
            setShowForm(false);
        } catch (e: any) {
            setFormError(e.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (coupon: Coupon) => {
        try {
            const updated = await updateCoupon(coupon.id, { isActive: !coupon.isActive });
            setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
        } catch (e: any) {
            console.error(e);
        }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await deleteCoupon(toDelete.id);
            setCoupons(prev => prev.filter(c => c.id !== toDelete.id));
            setToDelete(null);
        } catch (e: any) {
            console.error(e);
        } finally {
            setDeleting(false);
        }
    };

    /* ---- render ---- */
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#243447' }}>
            <AdminSidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <AppBar
                    variant="app"
                    title="Khuyến mãi"
                    subtitle="Quản lý mã giảm giá"
                />

                <main style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="coupons-page" style={{backgroundColor: '#162130'}}>

                        {/* Header */}
                        <div className="coupons-header">
                            <div className="coupons-header__info">
                                <h1>Mã giảm giá (Coupon)</h1>
                                <p>Tạo và quản lý các chương trình giảm giá cho cửa hàng</p>
                            </div>
                            <div className="coupons-header__actions">
                                <button className="btn btn--outline" onClick={load}>
                                    <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.75-7.39"/></svg>
                                    Làm mới
                                </button>
                                <button className="btn btn--primary" onClick={openCreate}>
                                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Tạo coupon
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="coupons-stats">
                            <div className="stat-card">
                                <div className="stat-card__icon stat-card__icon--blue">
                                    <svg viewBox="0 0 24 24"><path d="M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg>
                                </div>
                                <div className="stat-card__body">
                                    <div className="stat-card__value">{stats.total}</div>
                                    <div className="stat-card__label">Tổng coupon</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card__icon stat-card__icon--green">
                                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <div className="stat-card__body">
                                    <div className="stat-card__value">{stats.active}</div>
                                    <div className="stat-card__label">Đang chạy</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card__icon stat-card__icon--red">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                </div>
                                <div className="stat-card__body">
                                    <div className="stat-card__value">{stats.expired}</div>
                                    <div className="stat-card__label">Hết hạn</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card__icon stat-card__icon--amber">
                                    <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                                <div className="stat-card__body">
                                    <div className="stat-card__value">{stats.used}</div>
                                    <div className="stat-card__label">Tổng lượt dùng</div>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="coupons-toolbar">
                            <div className="coupons-toolbar__search">
                                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input
                                    placeholder="Tìm theo mã hoặc mô tả…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <select
                                className="coupons-toolbar__filter"
                                value={filter}
                                onChange={e => setFilter(e.target.value as FilterType)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang chạy</option>
                                <option value="inactive">Đã tắt</option>
                                <option value="expired">Hết hạn</option>
                            </select>
                        </div>

                        {/* Table */}
                        <CouponTable
                            coupons={filtered}
                            loading={loading}
                            onEdit={openEdit}
                            onDelete={c => setToDelete(c)}
                            onToggleActive={handleToggleActive}
                        />

                    </div>
                </main>
            </div>

            {/* Form Modal */}
            {showForm && (
                <CouponFormModal
                    coupon={editing}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                    saving={saving}
                    error={formError}
                />
            )}

            {/* Delete Confirm Modal */}
            {toDelete && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setToDelete(null)}>
                    <div className="modal confirm-modal">
                        <div className="modal__header">
                            <h2 className="modal__title">Xác nhận xoá</h2>
                            <button className="modal__close" onClick={() => setToDelete(null)}>
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="modal__body">
                            Bạn chắc chắn muốn xoá coupon{' '}
                            <strong>{toDelete.code}</strong>? Hành động này không thể hoàn tác.
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setToDelete(null)} disabled={deleting}>
                                Huỷ
                            </button>
                            <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Đang xoá…' : 'Xoá coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponsPage;