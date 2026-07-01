// src/components/reports/RevenueKPISection.tsx
import React from 'react';
import { useAppSelector } from '../../store/hooks';
import KPIGrid from '../common/KPIGrid';
import Panel from '../common/Panel';
import * as XLSX from 'xlsx';

/** Format tiền VND ngắn gọn */
function formatVND(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace('.', ',') + ' tr ₫';
    return n.toLocaleString('vi-VN') + ' ₫';
}

function deltaLabel(pct: number): { text: string; type: 'up' | 'down' } {
    const sign = pct >= 0 ? '+' : '';
    return {
        text: `${sign}${pct.toFixed(1)}% so kỳ trước`,
        type: pct >= 0 ? 'up' : 'down',
    };
}

const RevenueKPISection: React.FC = () => {
    const { data, status, error } = useAppSelector((s) => s.report.overview);
    const query = useAppSelector((s) => s.report.query);

    const handleExport = () => {
        if (!data) return;
        const rows = [
            { 'Chỉ số': 'Doanh thu',          'Giá trị': data.totalRevenue },
            { 'Chỉ số': 'Lợi nhuận gộp',      'Giá trị': data.grossProfit },
            { 'Chỉ số': 'Số đơn hàng',        'Giá trị': data.totalOrders },
            { 'Chỉ số': 'Giá trị đơn TB',     'Giá trị': data.averageOrderValue },
            { 'Chỉ số': 'Tổng SP đã bán',     'Giá trị': data.totalItemsSold },
            { 'Chỉ số': 'Tổng giảm giá',      'Giá trị': data.totalDiscount },
            { 'Chỉ số': 'Biên lợi nhuận (%)', 'Giá trị': data.profitMargin.toFixed(2) },
            { 'Chỉ số': 'Tổng giá vốn',       'Giá trị': data.totalCost },
            { 'Chỉ số': 'Kỳ từ ngày',         'Giá trị': query.from ?? '' },
            { 'Chỉ số': 'Kỳ đến ngày',        'Giá trị': query.to ?? '' },
        ];
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tổng quan KPI');
        XLSX.writeFile(wb, 'tong-quan-kpi.xlsx');
    };

    if (status === 'loading') {
        return <Panel title="Tổng quan"><p className="state-msg">Đang tải...</p></Panel>;
    }
    if (status === 'failed') {
        return <Panel title="Tổng quan"><p className="state-msg state-msg--error">{error}</p></Panel>;
    }
    if (!data) return null;

    const cmp = data.comparison;

    const items = [
        {
            label: 'Doanh thu',
            value: formatVND(data.totalRevenue),
            ...(cmp ? deltaLabel(cmp.revenueChangePercent) : {}),
        },
        {
            label: 'Lợi nhuận gộp',
            value: formatVND(data.grossProfit),
            ...(cmp ? deltaLabel(cmp.profitChangePercent) : {}),
        },
        {
            label: 'Số đơn hàng',
            value: data.totalOrders.toLocaleString('vi-VN'),
            ...(cmp ? deltaLabel(cmp.ordersChangePercent) : {}),
        },
        {
            label: 'Giá trị đơn TB',
            value: formatVND(data.averageOrderValue),
        },
        {
            label: 'Tổng SP đã bán',
            value: data.totalItemsSold.toLocaleString('vi-VN'),
        },
        {
            label: 'Tổng giảm giá',
            value: formatVND(data.totalDiscount),
        },
        {
            label: 'Biên lợi nhuận',
            value: `${data.profitMargin.toFixed(1)}%`,
            ...(data.costIsEstimated
                ? { delta: '⚠ Giá vốn ước tính', deltaType: 'warning' as const }
                : {}),
        },
        {
            label: 'Tổng giá vốn',
            value: formatVND(data.totalCost),
            ...(data.costIsEstimated
                ? { delta: '⚠ Ước tính', deltaType: 'warning' as const }
                : {}),
        },
    ];

    return (
        <Panel title="Tổng quan">
            <div className="section-controls">
                <button className="btn-export" onClick={handleExport}>
                    ↓ Xuất Excel
                </button>
            </div>
            {cmp && (
                <p className="revenue-kpi__period-note">
                    Kỳ so sánh: {cmp.previousPeriod.from} → {cmp.previousPeriod.to}
                </p>
            )}
            <KPIGrid items={items} />
        </Panel>
    );
};

export default RevenueKPISection;