// src/pages/staff/history/historyUtils.ts

export const PAYMENT_LABEL: Record<string, string> = {
    cash: 'Tiền mặt',
    qr: 'Chuyển khoản (QR)',
};

export const STATUS_LABEL: Record<string, string> = {
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ',
};

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

export const formatDateTime = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN');
};