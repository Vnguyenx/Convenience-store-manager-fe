import React from 'react';

interface CartItem {
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
    total: number;
    discount?: number;
}

interface CartPanelProps {
    orderCode: string;
    items: CartItem[];
    subtotal: number;
    discountTotal: number;
    total: number;
    onQuantityChange?: (id: string, delta: number) => void;
    onCheckout?: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
                                                 orderCode,
                                                 items,
                                                 subtotal,
                                                 discountTotal,
                                                 total,
                                                 onQuantityChange,
                                                 onCheckout,
                                             }) => {
    return (
        <aside className="pos-cart">
            <div className="pos-cart__header">
                <h3>Đơn hàng #{orderCode}</h3>
                <button className="btn btn-secondary btn-sm">Khách lẻ</button>
            </div>

            <div className="pos-cart__items">
                {items.map((item) => (
                    <div key={item.id} className="pos-cart-item">
                        <div className="pos-cart-item__thumb"></div>
                        <div className="pos-cart-item__info">
                            <div className="pos-cart-item__name">{item.name}</div>
                            <div className="pos-cart-item__unit-price">
                                {item.unitPrice.toLocaleString()}đ / {item.discount ? `(-${item.discount}%)` : ''}
                            </div>
                        </div>
                        <div className="pos-cart-item__qty">
                            <button onClick={() => onQuantityChange?.(item.id, -1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => onQuantityChange?.(item.id, 1)}>+</button>
                        </div>
                        <div className="pos-cart-item__line-total">{item.total.toLocaleString()}đ</div>
                    </div>
                ))}
            </div>

            <div className="pos-cart__summary">
                <div className="pos-cart__summary-row"><span>Tạm tính</span><span>{subtotal.toLocaleString()}đ</span></div>
                <div className="pos-cart__summary-row"><span>Giảm giá KM</span><span>-{discountTotal.toLocaleString()}đ</span></div>
                <div className="pos-cart__summary-row pos-cart__summary-row--total"><span>Tổng cộng</span><span>{total.toLocaleString()}đ</span></div>
                <button className="btn btn-primary btn-full pos-cart__pay-btn" onClick={onCheckout}>Thanh toán</button>
            </div>
        </aside>
    );
};

export default CartPanel;