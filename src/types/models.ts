export type UserRole = 'admin' | 'staff';

export interface User {
    uid: string;
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    isActive?: boolean;
}