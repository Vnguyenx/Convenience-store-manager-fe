export type UserRole = 'admin' | 'staff';

export interface User {
    uid: string;
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    isActive?: boolean;
    photoURL?: string;
}

// Thêm Product
export interface Product {
    docId?: string;          // ID của document Firestore (không bắt buộc khi tạo)
    ID: string;              // Mã sản phẩm (unique)
    name: string;
    category: string;
    unit: string;
    importPrice: number;
    sellPrice: number;
    discountPrice: number | null;
    stockQuantity: number;
    minStockThreshold: number;
    expiryDate: string | null; // ISO date string
    imageURL: string;
    createdAt?: string;
    updatedAt?: string;
    // ✅ MỚI: các field BE tự tính (enrichWithExpiryInfo), không lưu trong Firestore.
    // Optional vì các nơi khác trong code tạo Product object (ví dụ payload tạo/sửa) không có field này.
    effectivePrice?: number;
    expiryDiscountPercent?: number;
    daysLeft?: number | null;
    isExpired?: boolean;
}

// ✅ MỚI: cấu hình 1 tier giảm giá theo số ngày còn lại đến hết hạn
export interface ExpiryDiscountTier {
    maxDays: number;
    percent: number;
}
// src/types/models.ts (bổ sung)
export interface Supplier {
    id: string;
    code: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    contactPerson: string;
    note: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryCheckItem {
    id: string;
    productId: string;
    productCode: string;
    productName: string;
    systemQuantity: number;
    actualQuantity: number | null;
    difference: number | null;
    note: string;
}

export interface InventoryCheck {
    id: string;
    checkCode: string;
    note: string;
    status: 'draft' | 'confirmed';
    checkedBy: string;
    confirmedAt: string | null;
    createdAt: string;
    updatedAt: string;
    items?: InventoryCheckItem[];
}

export interface LowStockItem {
    id: string; code: string; name: string;
    stockQuantity: number; minStockThreshold: number; shortage: number;
}
export interface NearExpiryItem {
    id: string; code: string; name: string;
    expiryDate: string; stockQuantity: number; daysLeft: number;
}
export interface ExpiredItem {
    id: string; code: string; name: string;
    expiryDate: string; stockQuantity: number; daysExpired: number;
}
export interface InventoryAlerts {
    summary: { lowStock: number; nearExpiry: number; expired: number; total: number };
    lowStock: LowStockItem[];
    nearExpiry: NearExpiryItem[];
    expired: ExpiredItem[];
}

export interface PurchaseOrderItem {
    id: string;
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    note: string;
}

export interface PurchaseOrder {
    id: string;
    poCode: string;
    supplierId: string;
    supplierName: string;
    supplierCode: string;
    status: 'draft' | 'confirmed' | 'cancelled';
    note: string;
    createdBy: string;
    confirmedAt: string | null;
    createdAt: string;
    updatedAt: string;
    items?: PurchaseOrderItem[];
}