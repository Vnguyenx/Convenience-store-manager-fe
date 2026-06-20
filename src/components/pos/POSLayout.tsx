// src/components/pos/POSLayout.tsx
import React, { useState, useCallback } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth'; // lấy currentUser.uid
import { saveOrder, PaymentMethod } from '../../services/orderService';
import { exportReceiptPdf } from '../../utils/receiptPdf';
import { Product } from '../../types/models';

import POSProductArea from './POSProductArea';
import CartPanel from './CartPanel';
import PaymentModal from './PaymentModal';

import '../../styles/pos/pos.css';

let orderCounter = 128; // TODO: thay bằng counter từ Firestore nếu cần liên tục

const POSLayout: React.FC = () => {
    const { products, loading } = useProducts();
    const { currentUser } = useAuth();

    const {
        items, coupon, couponError,
        subtotal, couponDiscount, total,
        addItem, changeQty, setQuantity, removeItem, clearCart,
        applyCoupon, removeCoupon,
    } = useCart();

    const [showPayment, setShowPayment] = useState(false);
    const [payLoading, setPayLoading] = useState(false);
    const [orderCode, setOrderCode] = useState(() => `DH${String(++orderCounter).padStart(5, '0')}`);

    // Thêm sản phẩm vào giỏ
    const handleAddToCart = useCallback((product: Product) => {
        addItem({
            id: product.docId || product.ID,
            name: product.name,
            unitPrice: product.sellPrice,
            discountPrice: product.discountPrice ?? undefined,
            imageURL: product.imageURL,
            stockQuantity: product.stockQuantity ?? 0,
        });
    }, [addItem]);

    // Xác nhận thanh toán
    const handleConfirmPayment = async (method: PaymentMethod, cashReceived?: number) => {
        setPayLoading(true);
        try {
            const saved = await saveOrder({
                items,
                subtotal,
                coupon,
                couponDiscount,
                total,
                paymentMethod: method,
                cashierUID: currentUser?.uid ?? 'anonymous',
            });

            // Xuất PDF hóa đơn
            exportReceiptPdf(saved);

            // Reset
            clearCart();
            setShowPayment(false);
            setOrderCode(`DH${String(++orderCounter).padStart(5, '0')}`);
        } catch (err) {
            console.error('Lỗi lưu đơn hàng:', err);
            alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.');
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="pos-layout">
            {/* Khu vực sản phẩm */}
            <POSProductArea
                products={products ?? []}
                loading={loading}
                onAddToCart={handleAddToCart}
            />

            {/* Giỏ hàng */}
            <CartPanel
                orderCode={orderCode}
                items={items}
                subtotal={subtotal}
                coupon={coupon}
                couponDiscount={couponDiscount}
                couponError={couponError}
                total={total}
                onChangeQty={changeQty}
                onSetQty={setQuantity}
                onRemove={removeItem}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                onCheckout={() => setShowPayment(true)}
            />

            {/* Modal thanh toán */}
            {showPayment && (
                <PaymentModal
                    orderCode={orderCode}
                    total={total}
                    onConfirm={handleConfirmPayment}
                    onClose={() => setShowPayment(false)}
                    loading={payLoading}
                />
            )}
        </div>
    );
};

export default POSLayout;