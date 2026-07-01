// src/components/pos/POSLayout.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth'; // lấy currentUser.uid
import { saveOrder, PaymentMethod } from '../../services/orderService';
import { myShiftService } from '../../services/myShiftService'; // FIX: kiểm tra trạng thái ca làm việc
import { exportReceiptPdf } from '../../utils/receiptPdf';
import { Product } from '../../types/models';

import POSProductArea from './POSProductArea';
import CartPanel from './CartPanel';
import PaymentModal from './PaymentModal';

import '../../styles/pos/pos.css';

let orderCounter = 128; // TODO: thay bằng counter từ Firestore nếu cần liên tục

// FIX: lấy ngày hôm nay theo múi giờ VN, khớp cách backend xác định "hôm nay"
function todayVN() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
}

const SHIFT_REQUIRED_MSG = 'Bạn cần check-in ca làm việc trước khi bán hàng';

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

    // FIX: null = đang kiểm tra, true = đang trong ca, false = chưa check-in / đã check-out
    const [onShift, setOnShift] = useState<boolean | null>(null);

    // FIX: kiểm tra trạng thái chấm công hôm nay khi vào trang bán hàng
    const checkShiftStatus = useCallback(async () => {
        try {
            const date = todayVN();
            const res = await myShiftService.getMyAttendance({ from: date, to: date });
            const todayRecord = res.records?.[0];
            const active = !!todayRecord && !!todayRecord.checkIn && !todayRecord.checkOut;
            setOnShift(active);
        } catch (err) {
            console.error('Lỗi kiểm tra trạng thái ca làm việc:', err);
            // Không xác định được -> vẫn cho phép thao tác, backend sẽ chặn nếu thực sự chưa check-in
            setOnShift(true);
        }
    }, []);

    useEffect(() => {
        checkShiftStatus();
    }, [checkShiftStatus]);

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
        // FIX: chặn sớm phía client nếu biết chắc chưa check-in (backend vẫn là nguồn chặn thật sự)
        if (onShift === false) {
            alert(SHIFT_REQUIRED_MSG);
            setShowPayment(false);
            return;
        }

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
        } catch (err: any) {
            console.error('Lỗi lưu đơn hàng:', err);
            // FIX: nếu backend từ chối vì chưa check-in, cập nhật lại trạng thái và báo rõ ràng
            if (err?.message === SHIFT_REQUIRED_MSG) {
                setOnShift(false);
                alert(SHIFT_REQUIRED_MSG);
            } else {
                alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.');
            }
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="pos-layout">
            {/* FIX: cảnh báo nếu chưa check-in ca làm việc hôm nay */}
            {onShift === false && (
                <div className="pos-shift-warning" role="alert">
                    ⚠ Bạn chưa check-in ca làm việc hôm nay. Vui lòng check-in trước khi bán hàng.
                </div>
            )}
            <div style={{    display: 'flex', flexDirection: 'row'}}>
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
                checkoutDisabled={onShift === false}
                checkoutDisabledReason={onShift === false ? SHIFT_REQUIRED_MSG : undefined}
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
        </div>
    );
};

export default POSLayout;