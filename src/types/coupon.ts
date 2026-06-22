// src/types/coupon.ts

export interface Coupon {
    id: string;                  // = document ID (auto-gen, được lưu lại trong field này)
    code: string;
    type: 'percent' | 'fixed';
    value: number;                // % giảm hoặc số tiền giảm cố định
    description?: string;

    // ----- Điều kiện sử dụng -----
    minOrderValue?: number;       // đơn hàng tối thiểu (đ) để áp dụng được mã
    maxDiscount?: number | null;  // giới hạn số tiền giảm tối đa (chủ yếu áp cho type = 'percent')
    startDate?: string | null;    // ISO date (yyyy-mm-dd) - ngày bắt đầu hiệu lực
    expiryDate?: string | null;   // ISO date (yyyy-mm-dd) - ngày hết hạn
    usageLimit?: number | null;   // số lần được sử dụng tối đa (toàn hệ thống), null = không giới hạn
    usedCount: number;            // số lần đã sử dụng tính đến hiện tại
    isActive: boolean;            // cho phép admin khoá mã mà không cần xoá

    createdAt?: string;
    updatedAt?: string;
}

export type CouponFormData = {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    description?: string;
    minOrderValue?: number;
    maxDiscount?: number;
    startDate?: string;
    expiryDate?: string;
    usageLimit?: number;
    isActive: boolean;
};