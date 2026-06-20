// src/utils/formatCurrency.ts
export const formatCurrency = (amount: number): string => {
    if (amount == null) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
};