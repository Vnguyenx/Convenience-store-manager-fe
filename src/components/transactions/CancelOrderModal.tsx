// src/pages/admin/transactions/CancelOrderModal.tsx
import React from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { SavedOrder } from '../../services/orderService';

interface CancelOrderModalProps {
    order: SavedOrder | null;
    reason: string;
    onReasonChange: (value: string) => void;
    error: string;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
                                                               order,
                                                               reason,
                                                               onReasonChange,
                                                               error,
                                                               isSubmitting,
                                                               onClose,
                                                               onConfirm,
                                                           }) => {
    return (
        <Modal
            isOpen={!!order}
            onClose={onClose}
            title={order ? `Huỷ đơn ${order.orderCode}` : ''}
            size="sm"
        >
            {order && (
                <div className="cancel-order-modal">
                    <p className="cancel-order-modal__message">
                        Bạn có chắc muốn huỷ đơn hàng <strong>{order.orderCode}</strong>?
                        Hành động này sẽ hoàn lại lượt sử dụng mã giảm giá (nếu có).
                    </p>
                    <Input
                        label="Lý do huỷ"
                        value={reason}
                        onChange={(e) => onReasonChange(e.target.value)}
                        error={error}
                        placeholder="Nhập lý do huỷ đơn..."
                    />
                    <div className="cancel-order-modal__actions">
                        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Đóng
                        </Button>
                        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang huỷ...' : 'Xác nhận huỷ'}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CancelOrderModal;