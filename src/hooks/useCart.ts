// src/hooks/useCart.ts
import { useState, useCallback, useMemo } from 'react';

export interface CartItem {
    id: string;
    name: string;
    unitPrice: number;       // giá gốc
    discountPrice?: number;  // giá sau KM sản phẩm
    quantity: number;
    imageURL?: string;
    stockQuantity: number;
}

export interface CouponResult {
    code: string;
    type: 'percent' | 'fixed';
    value: number;           // % hoặc số tiền cố định
}

// ---- mock coupon DB (sau thay bằng Firestore lookup) ----
const COUPONS: Record<string, CouponResult> = {
    SALE10: { code: 'SALE10', type: 'percent', value: 10 },
    GIAM5K: { code: 'GIAM5K', type: 'fixed', value: 5000 },
};

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState<CouponResult | null>(null);
    const [couponError, setCouponError] = useState<string>('');

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

    // Áp mã giảm giá
    const applyCoupon = useCallback((code: string) => {
        const result = COUPONS[code.toUpperCase().trim()];
        if (result) {
            setCoupon(result);
            setCouponError('');
        } else {
            setCoupon(null);
            setCouponError('Mã giảm giá không hợp lệ');
        }
    }, []);

    const removeCoupon = useCallback(() => {
        setCoupon(null);
        setCouponError('');
    }, []);

    // Tính toán
    const subtotal = useMemo(() =>
            items.reduce((sum, i) => sum + (i.discountPrice ?? i.unitPrice) * i.quantity, 0),
        [items]
    );

    const productDiscount = useMemo(() =>
            items.reduce((sum, i) =>
                sum + (i.discountPrice != null ? (i.unitPrice - i.discountPrice) * i.quantity : 0), 0),
        [items]
    );

    const couponDiscount = useMemo(() => {
        if (!coupon) return 0;
        if (coupon.type === 'percent') return Math.round(subtotal * coupon.value / 100);
        return Math.min(coupon.value, subtotal);
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