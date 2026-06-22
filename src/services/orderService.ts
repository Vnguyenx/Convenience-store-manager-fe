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
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Lấy header Authorization kèm Firebase ID token.
 * Dùng chung cho mọi request tới /api/orders.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
        throw new Error('Chưa đăng nhập');
    }
    const token = await currentUser.getIdToken();
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

/**
 * Gọi BE API POST /api/orders (Admin SDK, có verifyToken)
 * KHÔNG ghi trực tiếp xuống Firestore từ client nữa -> tránh lỗi
 * "Missing or insufficient permissions" do Security Rules chặn write trực tiếp.
 */
export async function saveOrder(payload: OrderPayload): Promise<SavedOrder> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: await getAuthHeaders(),
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

export interface GetOrdersFilters {
    status?: string;
    paymentMethod?: string;
    cashierUID?: string;
}

/**
 * GET /api/orders - dùng cho trang Admin > Lịch sử giao dịch
 */
export async function getOrders(filters: GetOrdersFilters = {}): Promise<SavedOrder[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.cashierUID) params.append('cashierUID', filters.cashierUID);

    const res = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
        method: 'GET',
        headers: await getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Không thể lấy danh sách đơn hàng');
    }
    return json.data as SavedOrder[];
}

/**
 * GET /api/orders/:orderCode - xem chi tiết 1 đơn
 */
export async function getOrderByCode(orderCode: string): Promise<SavedOrder> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderCode}`, {
        method: 'GET',
        headers: await getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Không tìm thấy đơn hàng');
    }
    return json.data as SavedOrder;
}

/**
 * PATCH /api/orders/:orderCode/cancel - chỉ admin (BE check requireRole)
 */
export async function cancelOrder(orderCode: string, reason: string): Promise<SavedOrder> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderCode}/cancel`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ reason }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Huỷ đơn thất bại');
    }
    return json.data as SavedOrder;
}

/**
 * DELETE /api/orders/:orderCode - xoá cứng, chỉ admin, hạn chế dùng
 */
export async function deleteOrder(orderCode: string): Promise<{ docId: string; orderCode: string }> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderCode}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Xoá đơn thất bại');
    }
    return json.data as { docId: string; orderCode: string };
}