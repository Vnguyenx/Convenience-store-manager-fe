// src/types/report.ts

export type GroupBy = 'day' | 'month';

export interface RevenueRange {
    from: string | null;
    to: string | null;
}

export interface RevenueComparison {
    previousPeriod: { from: string; to: string };
    previousRevenue: number;
    previousOrders: number;
    previousProfit: number;
    revenueChangePercent: number;
    ordersChangePercent: number;
    profitChangePercent: number;
}

export interface RevenueOverview {
    range: RevenueRange;
    totalOrders: number;
    totalRevenue: number;
    totalSubtotal: number;
    totalDiscount: number;
    totalItemsSold: number;
    averageOrderValue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    costIsEstimated: boolean;
    comparison: RevenueComparison | null;
}

export interface RevenueTimePoint {
    key: string;          // "YYYY-MM-DD" hoặc "YYYY-MM" tuỳ groupBy
    revenue: number;
    cost: number;
    profit: number;
    orders: number;
    itemsSold: number;
}

export interface RevenueByTimeResponse {
    groupBy: GroupBy;
    range: RevenueRange;
    series: RevenueTimePoint[];
}

export interface PaymentMethodStat {
    paymentMethod: string;
    revenue: number;
    orders: number;
    percentage: number;
}

export interface RevenueByPaymentMethodResponse {
    range: RevenueRange;
    totalRevenue: number;
    breakdown: PaymentMethodStat[];
}

export interface TopProductStat {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
    orderCount: number;
}

export interface TopProductsResponse {
    range: RevenueRange;
    total: number;
    topProducts: TopProductStat[];
}

export interface StaffRevenueStat {
    cashierUID: string;
    cashierName: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
}

export interface RevenueByStaffResponse {
    range: RevenueRange;
    staff: StaffRevenueStat[];
}

export interface CategoryRevenueStat {
    category: string;
    revenue: number;
    cost: number;
    profit: number;
    quantitySold: number;
}

export interface RevenueByCategoryResponse {
    range: RevenueRange;
    categories: CategoryRevenueStat[];
}