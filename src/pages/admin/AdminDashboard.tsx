// src/pages/admin/AdminDashboard.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchRevenueOverview,
    fetchTopProducts,
    fetchRevenueByTime,
} from '../../store/reportSlice';
import { fetchInventoryAlerts } from '../../store/inventorySlice';
import AdminLayout from '../../components/layout/AdminLayout';
import KPIGrid from '../../components/common/KPIGrid';
import Panel from '../../components/common/Panel';
import DataTable from '../../components/common/DataTable';
import '../../styles/admin/AdminDashboard.css';

// Helper: lấy ngày hôm nay định dạng YYYY-MM-DD
function getTodayStr(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
}

// Helper: lấy khoảng ngày trước đó số ngày
function getDateRange(daysAgo: number): { from: string; to: string } {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - daysAgo);
    const from = fromDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    const to = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    return { from, to };
}

// Helper: format tiền VND
function formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + 'đ';
}

const AdminDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const today = getTodayStr();
    const last7Days = getDateRange(6); // 7 ngày bao gồm hôm nay

    // Lấy dữ liệu từ Redux
    const overviewState = useAppSelector((state) => state.report.overview);
    const topProductsState = useAppSelector((state) => state.report.topProducts);
    const byTimeState = useAppSelector((state) => state.report.byTime);
    const alertsState = useAppSelector((state) => state.inventory.alerts);
    const alertsLoading = useAppSelector((state) => state.inventory.alertsLoading);

    // Gọi API khi component mount
    useEffect(() => {
        dispatch(fetchRevenueOverview({ from: today, to: today, compare: false }));
        dispatch(fetchTopProducts({ from: today, to: today, topLimit: 5 }));
        dispatch(fetchRevenueByTime({ from: last7Days.from, to: last7Days.to, groupBy: 'day' }));
        dispatch(fetchInventoryAlerts(undefined));
    }, [dispatch, today, last7Days.from, last7Days.to]);

    // --- Xây dựng dữ liệu cho KPI ---
    const overviewData = overviewState.data;
    const totalRevenue = overviewData?.totalRevenue ?? 0;
    const totalOrders = overviewData?.totalOrders ?? 0;
    const grossProfit = overviewData?.grossProfit ?? 0;
    const totalAlerts = alertsState?.summary?.total ?? 0;

    const kpiItems = [
        {
            label: 'Doanh thu hôm nay',
            value: formatCurrency(totalRevenue),
            delta: totalOrders > 0 ? `${totalOrders} đơn hàng` : undefined,
            deltaType: totalRevenue > 0 ? ('up' as const) : undefined,
        },
        {
            label: 'Đơn hàng',
            value: totalOrders,
            delta: totalOrders > 0 ? 'hôm nay' : undefined,
            deltaType: totalOrders > 0 ? ('up' as const) : undefined,
        },
        {
            label: 'Lợi nhuận tạm tính',
            value: formatCurrency(grossProfit),
            delta: grossProfit > 0 ? 'hôm nay' : undefined,
            deltaType: grossProfit > 0 ? ('up' as const) : ('down' as const),
        },
        {
            label: 'Cảnh báo kho',
            value: totalAlerts,
            delta: totalAlerts > 0 ? 'cần xử lý' : 'tốt',
            deltaType: totalAlerts > 0 ? ('warning' as const) : ('up' as const),
        },
    ];

    // --- Xây dựng dữ liệu top sản phẩm ---
    const topProducts = topProductsState.data?.topProducts ?? [];
    const topProductsTableData = topProducts.map((p) => ({
        product: p.productName,
        sold: p.quantitySold,
        revenue: formatCurrency(p.revenue),
    }));

    // --- Xây dựng dữ liệu doanh thu theo ngày (7 ngày gần nhất) ---
    const byTimeData = byTimeState.data?.series ?? [];
    const revenueTableData = byTimeData.map((item) => ({
        ngay: item.key,
        doanhThu: formatCurrency(item.revenue),
        soDon: item.orders,
        loiNhuan: formatCurrency(item.profit),
    }));

    // --- Xây dựng dữ liệu cảnh báo kho ---
    let stockWarnings: { product: string; status: React.ReactNode }[] = [];
    if (alertsState) {
        const { lowStock, nearExpiry, expired } = alertsState;
        const allWarnings: { product: string; status: React.ReactNode }[] = [];

        lowStock.forEach((item) => {
            allWarnings.push({
                product: `${item.name} (${item.code})`,
                status: <span className="tag tag--warning">Tồn thấp ({item.stockQuantity}/{item.minStockThreshold})</span>,
            });
        });

        nearExpiry.forEach((item) => {
            allWarnings.push({
                product: `${item.name} (${item.code})`,
                status: <span className="tag tag--danger">Cận HSD {item.daysLeft} ngày</span>,
            });
        });

        expired.forEach((item) => {
            allWarnings.push({
                product: `${item.name} (${item.code})`,
                status: <span className="tag tag--danger">Hết HSD ({item.daysExpired} ngày)</span>,
            });
        });

        stockWarnings = allWarnings.slice(0, 5);
    }

    const subtitle = (() => {
        const now = new Date();
        const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayOfWeek = days[now.getDay()];
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${dayOfWeek}, ${day}/${month}/${year}`;
    })();

    return (
        <AdminLayout title="Tổng quan" subtitle={subtitle}>
            <KPIGrid items={kpiItems} />

            <div className="two-col">
                <Panel title="Sản phẩm bán chạy hôm nay" className="mt-20">
                    <DataTable
                        columns={[
                            { key: 'product', label: 'Sản phẩm' },
                            { key: 'sold', label: 'Đã bán' },
                            { key: 'revenue', label: 'Doanh thu' },
                        ]}
                        data={topProductsTableData}
                    />
                </Panel>

                <Panel title="Cảnh báo kho">
                    {alertsLoading ? (
                        <div>Đang tải cảnh báo...</div>
                    ) : (
                        <DataTable
                            columns={[
                                { key: 'product', label: 'Sản phẩm' },
                                { key: 'status', label: 'Trạng thái', render: (val) => val },
                            ]}
                            data={stockWarnings}
                        />
                    )}
                </Panel>
            </div>

            <div style={{ marginTop: '20px' }}>
                <Panel title={`Doanh thu theo ngày (${last7Days.from} - ${last7Days.to})`}>
                    <DataTable
                        columns={[
                            { key: 'ngay', label: 'Ngày' },
                            { key: 'doanhThu', label: 'Doanh thu' },
                            { key: 'soDon', label: 'Số đơn' },
                            { key: 'loiNhuan', label: 'Lợi nhuận' },
                        ]}
                        data={revenueTableData}
                    />
                </Panel>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;