// src/hooks/useCart.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCoupons } from '../store/couponSlice';
import { Coupon } from '../types/coupon';

export interface CartItem {
    id: string;
    name: string;
    unitPrice: number;       // giá gốc
    discountPrice?: number;  // giá sau KM sản phẩm
    quantity: number;
    imageURL?: string;
    stockQuantity: number;
}

// Giữ tên CouponResult để CartPanel.tsx không cần sửa import/type
export type CouponResult = Coupon;

export function useCart() {
    const dispatch = useAppDispatch();
    // Danh sách coupon đang active, fetch từ Firestore qua couponSlice
    const coupons = useAppSelector((state) => state.coupon.coupons);

    useEffect(() => {
        dispatch(fetchCoupons());
    }, [dispatch]);

    const [items, setItems] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string>('');

    // ----- Các hàm dưới đây giữ nguyên logic cũ, không đổi -----

    // Thêm sản phẩm (nếu đã có thì tăng qty)
    const addItem = useCallback((product: {
        id: string; name: string; unitPrice: number;
        discountPrice?: number; imageURL?: string; stockQuantity: number;
    }) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stockQuantity) return prev; // hết hàng
                return prev.map(i =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            if (product.stockQuantity === 0) return prev;
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    // Thay đổi qty trực tiếp (từ input)
    const setQuantity = useCallback((id: string, qty: number) => {
        setItems(prev => prev
            .map(i => i.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stockQuantity)) } : i)
        );
    }, []);

    // Tăng/giảm qty
    const changeQty = useCallback((id: string, delta: number) => {
        setItems(prev => prev
            .map(i => i.id === id
                ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.stockQuantity)) }
                : i
            )
        );
    }, []);

    // Xoá item
    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    // Xoá toàn bộ
    const clearCart = useCallback(() => {
        setItems([]);
        setCoupon(null);
        setCouponError('');
    }, []);

    // Tính toán (không đổi)
    const subtotal = useMemo(() =>
            items.reduce((sum, i) => sum + (i.discountPrice ?? i.unitPrice) * i.quantity, 0),
        [items]
    );

    const productDiscount = useMemo(() =>
            items.reduce((sum, i) =>
                sum + (i.discountPrice != null ? (i.unitPrice - i.discountPrice) * i.quantity : 0), 0),
        [items]
    );

    // ----- Phần coupon: thay mock bằng validate điều kiện thật -----

    const applyCoupon = useCallback((codeInput: string) => {
        const code = codeInput.toUpperCase().trim();
        const found = coupons.find(c => c.code.toUpperCase() === code);

        if (!found) {
            setCoupon(null);
            setCouponError('Mã giảm giá không tồn tại');
            return;
        }

        if (!found.isActive) {
            setCoupon(null);
            setCouponError('Mã giảm giá hiện đã bị khoá');
            return;
        }

        const now = new Date();

        if (found.startDate && now < new Date(found.startDate)) {
            setCoupon(null);
            setCouponError('Mã giảm giá chưa đến thời gian áp dụng');
            return;
        }

        if (found.expiryDate && now > new Date(found.expiryDate)) {
            setCoupon(null);
            setCouponError('Mã giảm giá đã hết hạn');
            return;
        }

        if (found.minOrderValue && subtotal < found.minOrderValue) {
            setCoupon(null);
            setCouponError(
                `Đơn hàng cần tối thiểu ${found.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`
            );
            return;
        }

        if (found.usageLimit != null && found.usedCount >= found.usageLimit) {
            setCoupon(null);
            setCouponError('Mã giảm giá đã hết lượt sử dụng');
            return;
        }

        setCoupon(found);
        setCouponError('');
    }, [coupons, subtotal]);

    const removeCoupon = useCallback(() => {
        setCoupon(null);
        setCouponError('');
    }, []);

    const couponDiscount = useMemo(() => {
        if (!coupon) return 0;

        let discount = 0;
        if (coupon.type === 'percent') {
            discount = Math.round(subtotal * coupon.value / 100);
            if (coupon.maxDiscount != null) {
                discount = Math.min(discount, coupon.maxDiscount); // giới hạn giảm tối đa
            }
        } else {
            discount = coupon.value;
        }

        return Math.min(discount, subtotal); // không cho giảm vượt quá tổng tiền
    }, [coupon, subtotal]);

    const total = Math.max(0, subtotal - couponDiscount);

    return {
        items,
        coupon,
        couponError,
        subtotal,
        productDiscount,
        couponDiscount,
        total,
        addItem,
        setQuantity,
        changeQty,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
    };
}