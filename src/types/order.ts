// src/types/order.ts

export type OrderStatus = 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | string;

export interface OrderItem {
    id: string;
    name: string;
    unitPrice: number;
    discountPrice: number | null;
    quantity: number;
}

export interface OrderCoupon {
    id: string;
    code: string;
    type: string;
    value: number;
}

export interface Order {
    docId: string;
    orderCode: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    cashierUID: string;
    cashierName: string;
    subtotal: number;
    couponDiscount: number;
    total: number;
    coupon: OrderCoupon | null;
    items: OrderItem[];
    customerNote: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
}