// src/components/pos/CartPanel.tsx
import React, { useState } from 'react';
import { CartItem, CouponResult } from '../../hooks/useCart';

interface CartPanelProps {
    orderCode: string;
    items: CartItem[];
    subtotal: number;
    coupon: CouponResult | null;
    couponDiscount: number;
    couponError: string;
    total: number;
    onChangeQty: (id: string, delta: number) => void;
    onSetQty: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    onApplyCoupon: (code: string) => void;
    onRemoveCoupon: () => void;
    onCheckout: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
                                                 orderCode, items, subtotal, coupon, couponDiscount, couponError, total,
                                                 onChangeQty, onSetQty, onRemove, onApplyCoupon, onRemoveCoupon, onCheckout,
                                             }) => {
    const [couponInput, setCouponInput] = useState('');

    const handleApply = () => {
        if (couponInput.trim()) {
            onApplyCoupon(couponInput.trim());
        }
    };

    const handleRemoveCoupon = () => {
        setCouponInput('');
        onRemoveCoupon();
    };

    return (
        <aside className="pos-cart">
            {/* Header */}
            <div className="pos-cart__header">
                <h3>Đơn #{orderCode}</h3>
                <span className="pos-cart__item-count">{items.length} SP</span>
            </div>

            {/* Items */}
            <div className="pos-cart__items">
                {items.length === 0 ? (
                    <div className="pos-cart__empty">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <p>Chưa có sản phẩm</p>
                    </div>
                ) : (
                    items.map(item => {
                        const effectivePrice = item.discountPrice ?? item.unitPrice;
                        const lineTotal = effectivePrice * item.quantity;
                        const hasDiscount = item.discountPrice != null && item.discountPrice < item.unitPrice;

                        return (
                            <div key={item.id} className="pos-cart-item">
                                <div className="pos-cart-item__info">
                                    <div className="pos-cart-item__name">{item.name}</div>
                                    <div className="pos-cart-item__price-row">
                                        {hasDiscount && (
                                            <span className="pos-cart-item__price-old">
                                                {item.unitPrice.toLocaleString('vi-VN')}đ
                                            </span>
                                        )}
                                        <span className="pos-cart-item__unit-price">
                                            {effectivePrice.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>

                                <div className="pos-cart-item__controls">
                                    <div className="pos-cart-item__qty">
                                        <button
                                            className="pos-qty-btn"
                                            onClick={() => item.quantity === 1 ? onRemove(item.id) : onChangeQty(item.id, -1)}
                                            title={item.quantity === 1 ? 'Xoá' : 'Giảm'}
                                        >
                                            {item.quantity === 1 ? '🗑' : '−'}
                                        </button>
                                        <input
                                            className="pos-qty-input"
                                            type="number"
                                            min={1}
                                            max={item.stockQuantity}
                                            value={item.quantity}
                                            onChange={e => onSetQty(item.id, Number(e.target.value))}
                                        />
                                        <button
                                            className="pos-qty-btn"
                                            onClick={() => onChangeQty(item.id, 1)}
                                            disabled={item.quantity >= item.stockQuantity}
                                        >+</button>
                                    </div>
                                    <div className="pos-cart-item__line-total">
                                        {lineTotal.toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Coupon */}
            <div className="pos-cart__coupon">
                {coupon ? (
                    <div className="coupon-applied">
                        <span>🏷 {coupon.code} ({coupon.type === 'percent' ? `-${coupon.value}%` : `-${coupon.value.toLocaleString()}đ`})</span>
                        <button className="coupon-remove" onClick={handleRemoveCoupon}>✕</button>
                    </div>
                ) : (
                    <div className="coupon-input-row">
                        <input
                            className="input"
                            placeholder="Mã giảm giá..."
                            value={couponInput}
                            onChange={e => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleApply()}
                        />
                        <button className="btn btn-secondary btn-sm" onClick={handleApply}>Áp dụng</button>
                    </div>
                )}
                {couponError && <div className="coupon-error">{couponError}</div>}
            </div>

            {/* Summary */}
            <div className="pos-cart__summary">
                <div className="pos-cart__summary-row">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {couponDiscount > 0 && (
                    <div className="pos-cart__summary-row pos-cart__summary-row--discount">
                        <span>Giảm giá mã</span>
                        <span>-{couponDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                )}
                <div className="pos-cart__summary-row pos-cart__summary-row--total">
                    <span>Tổng cộng</span>
                    <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <button
                    className="btn btn-primary btn-full pos-cart__pay-btn"
                    onClick={onCheckout}
                    disabled={items.length === 0}
                >
                    Thanh toán
                </button>
            </div>
        </aside>
    );
};

export default CartPanel;