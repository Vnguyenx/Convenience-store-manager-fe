// src/components/coupons/CouponTable.tsx
import React from 'react';
import { Coupon } from '../../types/coupon';
import CouponStatusBadge from './CouponStatusBadge';

interface Props {
    coupons: Coupon[];
    loading: boolean;
    onEdit: (coupon: Coupon) => void;
    onDelete: (coupon: Coupon) => void;
    onToggleActive: (coupon: Coupon) => void;
}

const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
};

const isExpired = (iso?: string | null) =>
    !!iso && new Date(iso) < new Date();

const CouponTable: React.FC<Props> = ({ coupons, loading, onEdit, onDelete, onToggleActive }) => {
    if (loading) {
        return <div className="table-loading">Đang tải dữ liệu…</div>;
    }

    if (coupons.length === 0) {
        return (
            <div className="table-empty">
                <svg viewBox="0 0 24 24">
                    <path d="M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <circle cx="7" cy="7" r="1"/>
                </svg>
                <p>Không tìm thấy coupon nào</p>
            </div>
        );
    }

    return (
        <div className="coupons-table-wrap">
            <table className="coupons-table">
                <thead>
                <tr>
                    <th>Mã</th>
                    <th>Loại / Giá trị</th>
                    <th>Đ. tối thiểu</th>
                    <th>Lượt dùng</th>
                    <th>Hiệu lực</th>
                    <th>Trạng thái</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {coupons.map(c => {
                    const usagePct = c.usageLimit
                        ? Math.min((c.usedCount / c.usageLimit) * 100, 100)
                        : 0;

                    return (
                        <tr key={c.id}>
                            {/* Code */}
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span className="coupon-code">{c.code}</span>
                                    {c.description && (
                                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                                                {c.description}
                                            </span>
                                    )}
                                </div>
                            </td>

                            {/* Value */}
                            <td>
                                {c.type === 'percent' ? (
                                    <span className="coupon-value--percent">
                                            -{c.value}%
                                        {c.maxDiscount
                                            ? <span style={{ fontSize: '0.75rem', color: '#475569', marginLeft: 4 }}>
                                                    (tối đa {fmt(c.maxDiscount)})
                                                  </span>
                                            : null}
                                        </span>
                                ) : (
                                    <span className="coupon-value--fixed">-{fmt(c.value)}</span>
                                )}
                            </td>

                            {/* Min order */}
                            <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                {c.minOrderValue ? fmt(c.minOrderValue) : '—'}
                            </td>

                            {/* Usage */}
                            <td>
                                <div className="usage-bar-wrap">
                                    {c.usageLimit ? (
                                        <>
                                            <div className="usage-bar">
                                                <div className="usage-bar__fill" style={{ width: `${usagePct}%` }} />
                                            </div>
                                            <span className="usage-bar__text">
                                                    {c.usedCount}/{c.usageLimit}
                                                </span>
                                        </>
                                    ) : (
                                        <span className="usage-bar__text">{c.usedCount} lần</span>
                                    )}
                                </div>
                            </td>

                            {/* Dates */}
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span className="coupon-date">{fmtDate(c.startDate)} →</span>
                                    <span className={`coupon-date${isExpired(c.expiryDate) ? ' coupon-date--expired' : ''}`}>
                                            {fmtDate(c.expiryDate)}
                                        </span>
                                </div>
                            </td>

                            {/* Status */}
                            <td>
                                <CouponStatusBadge isActive={c.isActive} expiryDate={c.expiryDate} />
                            </td>

                            {/* Actions */}
                            <td>
                                <div className="action-cell">
                                    <button
                                        className="action-btn"
                                        title={c.isActive ? 'Tắt coupon' : 'Bật coupon'}
                                        onClick={() => onToggleActive(c)}
                                    >
                                        {c.isActive ? (
                                            <svg viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3"/></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                    <button
                                        className="action-btn"
                                        title="Chỉnh sửa"
                                        onClick={() => onEdit(c)}
                                    >
                                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button
                                        className="action-btn action-btn--danger"
                                        title="Xoá"
                                        onClick={() => onDelete(c)}
                                    >
                                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default CouponTable;