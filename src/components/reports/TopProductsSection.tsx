// src/components/reports/TopProductsSection.tsx
import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import DataTable from '../common/DataTable';
import Panel from '../common/Panel';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';

function fmt(n: number) { return n.toLocaleString('vi-VN') + ' ₫'; }
function fmtShort(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr';
    if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k';
    return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__label">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="chart-tooltip__row">
                    <span className="chart-tooltip__dot" style={{ background: p.fill }} />
                    <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                        {p.name}: <strong>{p.dataKey === 'revenue' || p.dataKey === 'profit' ? fmt(p.value) : p.value.toLocaleString()}</strong>
                    </span>
                </div>
            ))}
        </div>
    );
};

const TopProductsSection: React.FC = () => {
    const { data, status, error } = useAppSelector((s) => s.report.topProducts);
    const topLimit = useAppSelector((s) => s.report.query.topLimit);
    const [view, setView] = useState<'chart' | 'table'>('chart');

    const title = `Top ${topLimit} sản phẩm bán chạy`;

    const handleExport = () => {
        if (!data?.topProducts.length) return;
        const rows = data.topProducts.map((p, i) => ({
            '#':             i + 1,
            'Sản phẩm':      p.productName,
            'Số lượng bán':  p.quantitySold,
            'Số đơn':        p.orderCount,
            'Doanh thu (₫)': p.revenue,
            'Giá vốn (₫)':  p.cost,
            'Lợi nhuận (₫)': p.profit,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Top ${topLimit} SP`);
        XLSX.writeFile(wb, `top-${topLimit}-san-pham.xlsx`);
    };

    if (status === 'loading') return <Panel title={title}><p className="state-msg">Đang tải...</p></Panel>;
    if (status === 'failed')  return <Panel title={title}><p className="state-msg state-msg--error">{error}</p></Panel>;
    if (!data || data.topProducts.length === 0) {
        return <Panel title={title}><p className="state-msg">Không có dữ liệu.</p></Panel>;
    }

    const rows = data.topProducts.map((p, i) => ({ ...p, _rank: i + 1 }));

    const cols = [
        { key: '_rank',        label: '#' },
        { key: 'productName',  label: 'Sản phẩm' },
        { key: 'quantitySold', label: 'Số lượng',  render: (v: number) => v.toLocaleString('vi-VN') },
        { key: 'orderCount',   label: 'Số đơn',    render: (v: number) => v.toLocaleString('vi-VN') },
        { key: 'revenue',      label: 'Doanh thu', render: (v: number) => fmt(v) },
        { key: 'cost',         label: 'Giá vốn',  render: (v: number) => fmt(v) },
        { key: 'profit',       label: 'Lợi nhuận', render: (v: number) => (
                <span style={{ color: v >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)' }}>
                {fmt(v)}
            </span>
            )},
    ];

    // Rút gọn tên sản phẩm dài cho chart
    const chartData = data.topProducts.slice(0, 15).map((p) => ({
        ...p,
        shortName: p.productName.length > 18 ? p.productName.slice(0, 18) + '…' : p.productName,
    }));

    return (
        <Panel title={title}>
            <div className="section-controls">
                <div className="view-toggle">
                    <button
                        className={view === 'chart' ? 'active' : ''}
                        onClick={() => setView('chart')}
                    >
                        Biểu đồ
                    </button>
                    <button
                        className={view === 'table' ? 'active' : ''}
                        onClick={() => setView('table')}
                    >
                        Bảng
                    </button>
                </div>
                <button className="btn-export" onClick={handleExport}>
                    ↓ Xuất Excel
                </button>
            </div>

            {view === 'chart' ? (
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 40)}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.06)"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                tickFormatter={fmtShort}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="shortName"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={110}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                            />
                            <Bar
                                dataKey="revenue"
                                name="Doanh thu"
                                fill="#6366f1"
                                radius={[0, 4, 4, 0]}
                            />
                            <Bar
                                dataKey="profit"
                                name="Lợi nhuận"
                                fill="#22c55e"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <DataTable columns={cols} data={rows} />
            )}
        </Panel>
    );
};

export default TopProductsSection;