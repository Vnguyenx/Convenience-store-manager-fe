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
}