// src/services/orderService.ts
import { getAuth } from 'firebase/auth';
import { CartItem, CouponResult } from '../hooks/useCart';

export type PaymentMethod = 'cash' | 'qr';

export interface OrderPayload {
    items: CartItem[];
    subtotal: number;
    coupon: CouponResult | null;
    couponDiscount: number;
    total: number;
    paymentMethod: PaymentMethod;
    cashierUID: string;       // chỉ để hiển thị/optimistic UI, BE sẽ tự lấy từ token
    customerNote?: string;
}

export interface SavedOrder {
    docId: string;
    orderCode: string;
    status: string;
    paymentMethod: PaymentMethod;
    cashierUID: string;
    cashierName: string; // tên nhân viên, BE lấy & lưu sẵn lúc tạo đơn (denormalize)
    subtotal: number;
    couponDiscount: number;
    total: number;
    coupon: { code: string; type: string; value: number } | null;
    items: Array<{
        id: string;
        name: string;
        unitPrice: number;
        discountPrice: number | null;
        quantity: number;
    }>;
    customerNote: string;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Gọi BE API POST /api/orders (Admin SDK, có verifyToken)
 * KHÔNG ghi trực tiếp xuống Firestore từ client nữa -> tránh lỗi
 * "Missing or insufficient permissions" do Security Rules chặn write trực tiếp.
 */
export async function saveOrder(payload: OrderPayload): Promise<SavedOrder> {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
        throw new Error('Chưa đăng nhập');
    }
    const token = await currentUser.getIdToken();

    const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            items: payload.items.map(i => ({
                id: i.id,
                name: i.name,
                unitPrice: i.unitPrice,
                discountPrice: i.discountPrice ?? null,
                quantity: i.quantity,
            })),
            subtotal: payload.subtotal,
            coupon: payload.coupon,
            couponDiscount: payload.couponDiscount,
            total: payload.total,
            paymentMethod: payload.paymentMethod,
            customerNote: payload.customerNote ?? '',
            // cashierUID KHÔNG cần gửi lên, BE tự lấy từ req.user.uid (verifyToken)
        }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Không thể lưu đơn hàng');
    }

    return json.data as SavedOrder;
}