// src/components/pos/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../services/orderService';
import { useQrConfig } from '../../hooks/useQrConfig';

interface PaymentModalProps {
    total: number;
    orderCode: string;
    onConfirm: (method: PaymentMethod, cashReceived?: number) => void;
    onClose: () => void;
    loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
                                                       total, orderCode, onConfirm, onClose, loading,
                                                   }) => {
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [cashInput, setCashInput] = useState('');
    const { generateQr, loading: qrLoading, error: qrError } = useQrConfig();
    const [qrData, setQrData] = useState<{ qrUrl: string; bankId: string; accountNo: string; accountName: string } | null>(null);

    const cashReceived = cashInput !== '' ? Number(cashInput.replace(/\./g, '')) : total;
    const change = cashReceived - total;

    const formatVnd = (n: number) =>
        n.toLocaleString('vi-VN').replace(/,/g, '.');

    const handleCashInput = (val: string) => {
        const digits = val.replace(/\D/g, '');
        const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        setCashInput(formatted);
    };

    const handleConfirm = () => {
        onConfirm(method, method === 'cash' ? cashReceived : undefined);
    };

    // Khi chuyển sang tab QR -> gọi BE lấy link QR đã build sẵn
    useEffect(() => {
        if (method === 'qr' && !qrData) {
            generateQr(orderCode, total).then(result => {
                if (result) setQrData(result);
            });
        }
    }, [method]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>

                <div className="modal__header">
                    <h3 className="modal__title">Thanh toán</h3>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="modal__body">
                    <div className="payment-total">
                        <span style={{ fontSize: 'var(--text-sm)', color: 'white' }}>
                            Đơn {orderCode}
                        </span>
                        <strong>{formatVnd(total)}đ</strong>
                    </div>

                    <div className="payment-methods">
                        <button
                            className={`payment-method-btn${method === 'cash' ? ' is-active' : ''}`}
                            onClick={() => setMethod('cash')}
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="2" y="6" width="20" height="12" rx="2"/>
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M6 12h.01M18 12h.01"/>
                            </svg>
                            Tiền mặt
                        </button>

                        <button
                            className={`payment-method-btn${method === 'qr' ? ' is-active' : ''}`}
                            onClick={() => setMethod('qr')}
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <path d="M14 14h3v3M17 20h3M20 17v3"/>
                            </svg>
                            Chuyển khoản QR
                        </button>
                    </div>

                    {method === 'cash' && (
                        <div className="payment-cash-area">
                            <div className="filter-group">
                                <label>Khách đưa</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder={formatVnd(total)}
                                    value={cashInput}
                                    onChange={e => handleCashInput(e.target.value)}
                                    style={{ textAlign: 'right', fontSize: 'var(--text-lg)', fontWeight: 600 }}
                                    autoFocus
                                />
                            </div>

                            <div className="payment-cash-presets">
                                {[20000, 50000, 100000, 200000, 500000].map(amt => (
                                    <button
                                        key={amt}
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setCashInput(formatVnd(amt))}
                                    >
                                        {amt >= 1000 ? `${amt / 1000}K` : amt}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setCashInput(formatVnd(total))}
                                >
                                    Đủ tiền
                                </button>
                            </div>

                            <div className="payment-change">
                                <span>Tiền thừa trả khách</span>
                                <strong style={{
                                    color: change >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'
                                }}>
                                    {change >= 0 ? formatVnd(change) : '—'}đ
                                </strong>
                            </div>
                        </div>
                    )}

                    {method === 'qr' && (
                        <div className="payment-qr-area" style={{ alignItems: 'center' }}>
                            {qrLoading ? (
                                <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                    Đang tạo mã QR...
                                </div>
                            ) : qrData ? (
                                <>
                                    <img
                                        src={qrData.qrUrl}
                                        alt="VietQR"
                                        style={{
                                            width: 180, height: 200,
                                            borderRadius: 10,
                                            border: '1px solid var(--color-border)',
                                            display: 'block',
                                        }}
                                    />
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                                        Quét mã để chuyển khoản · Sau khi nhận tiền nhấn <strong>Xác nhận</strong>
                                    </p>
                                    <div style={{
                                        fontSize: 'var(--text-xs)',
                                        color: 'white',
                                        textAlign: 'center',
                                        lineHeight: 1.6,
                                    }}>
                                        {qrData.bankId} · {qrData.accountNo}<br />
                                        <strong style={{ color: 'white' }}>{qrData.accountName}</strong>
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>
                                    {qrError || 'Chưa cấu hình thông tin ngân hàng.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConfirm}
                        disabled={loading || (method === 'cash' && change < 0)}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;