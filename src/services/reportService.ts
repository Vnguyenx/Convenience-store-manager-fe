// src/services/reportService.ts
import { apiClient } from './apiClient';
import type {
    GroupBy,
    RevenueOverview,
    RevenueByTimeResponse,
    RevenueByPaymentMethodResponse,
    TopProductsResponse,
    RevenueByStaffResponse,
    RevenueByCategoryResponse,
} from '../types/report';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate định dạng "YYYY-MM-DD" và tính hợp lệ của ngày */
function isValidDate(d: string): boolean {
    return DATE_RE.test(d) && !isNaN(Date.parse(d));
}

/**
 * Build query string từ object, bỏ qua các key có giá trị null/undefined/empty.
 * Trả về "" nếu không có tham số.
 */
function buildQS(params: Record<string, string | number | boolean | null | undefined>): string {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined && v !== '') {
            parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
        }
    }
    return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Validate + chuẩn hoá cặp ngày from/to.
 * Throw Error với message tiếng Việt nếu vi phạm.
 */
function validateDateRange(from: string | null, to: string | null): void {
    if (from && !isValidDate(from)) throw new Error('Ngày bắt đầu không hợp lệ (YYYY-MM-DD)');
    if (to   && !isValidDate(to))   throw new Error('Ngày kết thúc không hợp lệ (YYYY-MM-DD)');
    if (from && to && from > to)    throw new Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc');
}

/**
 * Validate topLimit: số nguyên dương, tối đa 100.
 */
function validateTopLimit(limit: number): number {
    const n = Math.floor(limit);
    if (!isFinite(n) || n < 1) return 10;
    return Math.min(n, 100);
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const reportService = {
    /**
     * GET /admin/statistics/revenue/overview
     * compare=true chỉ có hiệu lực khi cả from lẫn to đều được truyền.
     */
    async getRevenueOverview(
        from: string | null,
        to: string | null,
        compare: boolean,
    ): Promise<RevenueOverview> {
        validateDateRange(from, to);
        const qs = buildQS({ from, to, compare: compare && from && to ? 'true' : undefined });
        return apiClient.get(`/admin/statistics/revenue/overview${qs}`);
    },

    /**
     * GET /admin/statistics/revenue/by-time
     * groupBy mặc định 'day'; chỉ chấp nhận 'day' | 'month'.
     */
    async getRevenueByTime(
        from: string | null,
        to: string | null,
        groupBy: GroupBy,
    ): Promise<RevenueByTimeResponse> {
        validateDateRange(from, to);
        const safeGroupBy: GroupBy = groupBy === 'month' ? 'month' : 'day';
        const qs = buildQS({ from, to, groupBy: safeGroupBy });
        return apiClient.get(`/admin/statistics/revenue/by-time${qs}`);
    },

    /**
     * GET /admin/statistics/revenue/by-payment-method
     */
    async getRevenueByPaymentMethod(
        from: string | null,
        to: string | null,
    ): Promise<RevenueByPaymentMethodResponse> {
        validateDateRange(from, to);
        const qs = buildQS({ from, to });
        return apiClient.get(`/admin/statistics/revenue/by-payment-method${qs}`);
    },

    /**
     * GET /admin/statistics/revenue/top-products
     * limit: 1–100, mặc định 10.
     */
    async getTopProducts(
        from: string | null,
        to: string | null,
        limit: number,
    ): Promise<TopProductsResponse> {
        validateDateRange(from, to);
        const safeLimit = validateTopLimit(limit);
        const qs = buildQS({ from, to, limit: safeLimit });
        return apiClient.get(`/admin/statistics/revenue/top-products${qs}`);
    },

    /**
     * GET /admin/statistics/revenue/by-staff
     */
    async getRevenueByStaff(
        from: string | null,
        to: string | null,
    ): Promise<RevenueByStaffResponse> {
        validateDateRange(from, to);
        const qs = buildQS({ from, to });
        return apiClient.get(`/admin/statistics/revenue/by-staff${qs}`);
    },

    /**
     * GET /admin/statistics/revenue/by-category
     */
    async getRevenueByCategory(
        from: string | null,
        to: string | null,
    ): Promise<RevenueByCategoryResponse> {
        validateDateRange(from, to);
        const qs = buildQS({ from, to });
        return apiClient.get(`/admin/statistics/revenue/by-category${qs}`);
    },
};