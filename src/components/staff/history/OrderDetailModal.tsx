// src/pages/staff/history/OrderDetailModal.tsx
import React from 'react';
import Modal from '../../../components/common/Modal';
import { SavedOrder } from '../../../services/orderService';
import { PAYMENT_LABEL, STATUS_LABEL, formatCurrency, formatDateTime } from '../../../utils/historyUtils';

interface OrderDetailModalProps {
    order: SavedOrder | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={order ? `Chi tiết đơn ${order.orderCode}` : ''}
            size="lg"
        >
            {order && (
                <div className="order-detail">
                    <div className="order-detail__info">
                        <div><strong>Thời gian:</strong> {formatDateTime(order.createdAt)}</div>
                        <div>
                            <strong>Thanh toán:</strong>{' '}
                            {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
                        </div>
                        <div>
                            <strong>Trạng thái:</strong>{' '}
                            {STATUS_LABEL[order.status] || order.status}
                        </div>
                        {order.coupon && (
                            <div><strong>Mã giảm giá:</strong> {order.coupon.code}</div>
                        )}
                        {order.cancelReason && (
                            <div className="order-detail__cancel-reason">
                                <strong>Lý do huỷ:</strong> {order.cancelReason}
                            </div>
                        )}
                    </div>

                    <table className="data-table order-detail__items">
                        <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>SL</th>
                            <th>Thành tiền</th>
                        </tr>
                        </thead>
                        <tbody>
                        {order.items.map((item) => {
                            const price = item.discountPrice ?? item.unitPrice;
                            return (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{formatCurrency(price)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(price * item.quantity)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    <div className="order-detail__totals">
                        <div>Tạm tính: {formatCurrency(order.subtotal)}</div>
                        <div>Giảm giá: -{formatCurrency(order.couponDiscount)}</div>
                        <div className="order-detail__grand-total">
                            Tổng cộng: {formatCurrency(order.total)}
                        </div>
                    </div>

                    {order.customerNote && (
                        <div className="order-detail__note">
                            <strong>Ghi chú:</strong> {order.customerNote}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default OrderDetailModal;