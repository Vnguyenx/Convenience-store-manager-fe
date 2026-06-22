// src/components/coupons/CouponStatusBadge.tsx
import React from 'react';

interface Props {
    isActive: boolean;
    expiryDate?: string | null;
}

const CouponStatusBadge: React.FC<Props> = ({ isActive, expiryDate }) => {
    const now = new Date();
    const expired = expiryDate ? new Date(expiryDate) < now : false;

    if (!isActive) return <span className="badge badge--inactive">Tắt</span>;
    if (expired)   return <span className="badge badge--expired">Hết hạn</span>;
    return              <span className="badge badge--active">Đang chạy</span>;
};

export default CouponStatusBadge;