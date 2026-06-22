// src/utils/productOptions.ts
// Danh sách gợi ý cho Danh mục & Đơn vị tính.
// Đây CHỈ là danh sách gợi ý (dùng với <datalist>), không phải danh sách ép buộc cứng:
// người dùng vẫn có thể gõ tên mới nếu sản phẩm thuộc loại chưa có trong list.
// => Khi gặp danh mục/đơn vị mới, hãy bổ sung trực tiếp vào 2 mảng dưới đây.

export const CATEGORIES: string[] = [
    'Nước giải khát',
    'Sữa & sản phẩm từ sữa',
    'Thực phẩm khô',
    'Bánh kẹo',
    'Thực phẩm chế biến',
    'Thực phẩm tươi sống',
    'Hóa phẩm gia dụng',
    'Y tế & sức khỏe',
    'Đồ dùng khác',
    'Đồ uống có cồn',
];

export const UNITS: string[] = [
    'lon',
    'chai',
    'hộp',
    'gói',
    'lốc',
    'ly',
    'cây',
    'vỉ',
    'kg',
    'cái',
];

// Bảng map "category nào thường đi với unit nào" — dùng để CẢNH BÁO (không chặn cứng).
// Nếu category chưa có trong map (vd: category mới chưa từng gặp) -> coi như hợp lệ,
// không cảnh báo, vì không có cơ sở để so sánh.
export const CATEGORY_UNIT_MAP: Record<string, string[]> = {
    'Nước giải khát': ['lon', 'chai'],
    'Sữa & sản phẩm từ sữa': ['hộp', 'lốc', 'chai'],
    'Thực phẩm khô': ['gói', 'ly'],
    'Bánh kẹo': ['gói'],
    'Thực phẩm chế biến': ['gói', 'hộp'],
    'Thực phẩm tươi sống': ['hộp', 'kg'],
    'Hóa phẩm gia dụng': ['chai', 'lốc', 'cây'],
    'Y tế & sức khỏe': ['hộp'],
    'Đồ dùng khác': ['vỉ', 'cái'],
    'Đồ uống có cồn': ['lon', 'chai'],
};

/**
 * Kiểm tra xem unit có "hợp lý" với category không.
 * Trả về true nếu hợp lệ HOẶC category chưa có trong map (không đủ cơ sở để cảnh báo).
 * Trả về false nếu category đã có trong map nhưng unit không nằm trong danh sách cho phép.
 */
export function isCategoryUnitMatch(category: string, unit: string): boolean {
    const allowedUnits = CATEGORY_UNIT_MAP[category];
    if (!allowedUnits) return true; // category mới, chưa có dữ liệu để so sánh -> không cảnh báo
    return allowedUnits.includes(unit);
}