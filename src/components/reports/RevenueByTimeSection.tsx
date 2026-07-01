// src/components/reports/RevenueByTimeSection.tsx
import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import DataTable from '../common/DataTable';
import Panel from '../common/Panel';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';

function fmt(n: number) { return n.toLocaleString('vi-VN') + ' ₫'; }
function fmtShort(n: number) {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr';
    if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'k';
    return n.toString();
}

const columns = [
    { key: 'key',       label: 'Thời gian' },
    { key: 'orders',    label: 'Số đơn',    render: (v: number) => v.toLocaleString('vi-VN') },
    { key: 'revenue',   label: 'Doanh thu', render: (v: number) => fmt(v) },
    { key: 'cost',      label: 'Giá vốn',  render: (v: number) => fmt(v) },
    { key: 'profit',    label: 'Lợi nhuận', render: (v: number) => (
            <span style={{ color: v >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)' }}>
            {fmt(v)}
        </span>
        )},
    { key: 'itemsSold', label: 'SP bán ra', render: (v: number) => v.toLocaleString('vi-VN') },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__label">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="chart-tooltip__row">
                    <span className="chart-tooltip__dot" style={{ background: p.color }} />
                    <span style={{ color: p.color, fontSize: 12 }}>
                        {p.name}: <strong>{fmt(p.value)}</strong>
                    </span>
                </div>
            ))}
        </div>
    );
};

const RevenueByTimeSection: React.FC = () => {
    const { data, status, error } = useAppSelector((s) => s.report.byTime);
    const groupBy = useAppSelector((s) => s.report.query.groupBy);
    const [view, setView] = useState<'chart' | 'table'>('chart');

    const title = `Doanh thu theo ${groupBy === 'month' ? 'tháng' : 'ngày'}`;

    const handleExport = () => {
        if (!data?.series.length) return;
        const rows = data.series.map((r) => ({
            'Thời gian':      r.key,
            'Số đơn':         r.orders,
            'Doanh thu (₫)':  r.revenue,
            'Giá vốn (₫)':   r.cost,
            'Lợi nhuận (₫)': r.profit,
            'SP bán ra':      r.itemsSold,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Theo thời gian');
        XLSX.writeFile(wb, `doanh-thu-theo-${groupBy}.xlsx`);
    };

    if (status === 'loading') return <Panel title={title}><p className="state-msg">Đang tải...</p></Panel>;
    if (status === 'failed')  return <Panel title={title}><p className="state-msg state-msg--error">{error}</p></Panel>;
    if (!data || data.series.length === 0) {
        return <Panel title={title}><p className="state-msg">Không có dữ liệu trong khoảng thời gian này.</p></Panel>;
    }

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
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#4f72b8" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#4f72b8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#3a8f68" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#3a8f68" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" vertical={false} />
                            <XAxis
                                dataKey="key"
                                tick={{ fill: '#8896a5', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={fmtShort}
                                tick={{ fill: '#8896a5', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={56}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ color: '#6b7a8d', fontSize: 12, paddingTop: 8 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu"
                                stroke="#4f72b8"
                                fill="url(#gradRevenue)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#4f72b8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                name="Lợi nhuận"
                                stroke="#3a8f68"
                                fill="url(#gradProfit)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#3a8f68' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <DataTable columns={columns} data={data.series} />
            )}
        </Panel>
    );
};

export default RevenueByTimeSection;