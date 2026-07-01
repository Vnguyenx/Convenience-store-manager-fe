// src/components/reports/RevenueByCategorySection.tsx
import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import DataTable from '../common/DataTable';
import Panel from '../common/Panel';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import * as XLSX from 'xlsx';

function fmt(n: number) { return n.toLocaleString('vi-VN') + ' ₫'; }
function fmtShort(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr';
    if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k';
    return n.toString();
}

const columns = [
    { key: 'category',     label: 'Danh mục' },
    { key: 'quantitySold', label: 'Số lượng',  render: (v: number) => v.toLocaleString('vi-VN') },
    { key: 'revenue',      label: 'Doanh thu', render: (v: number) => fmt(v) },
    { key: 'cost',         label: 'Giá vốn',  render: (v: number) => fmt(v) },
    { key: 'profit',       label: 'Lợi nhuận', render: (v: number) => (
            <span style={{ color: v >= 0 ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)' }}>
            {fmt(v)}
        </span>
        )},
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__label">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="chart-tooltip__row">
                    <span className="chart-tooltip__dot" style={{ background: p.fill }} />
                    <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                        {p.name}: <strong>{fmt(p.value)}</strong>
                    </span>
                </div>
            ))}
        </div>
    );
};

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

const RevenueByCategorySection: React.FC = () => {
    const { data, status, error } = useAppSelector((s) => s.report.byCategory);
    const [view, setView] = useState<'chart' | 'table'>('chart');

    const handleExport = () => {
        if (!data?.categories.length) return;
        const rows = data.categories.map((r) => ({
            'Danh mục':      r.category,
            'Số lượng':      r.quantitySold,
            'Doanh thu (₫)': r.revenue,
            'Giá vốn (₫)':  r.cost,
            'Lợi nhuận (₫)': r.profit,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Theo danh mục');
        XLSX.writeFile(wb, 'doanh-thu-theo-danh-muc.xlsx');
    };

    if (status === 'loading') return <Panel title="Theo danh mục"><p className="state-msg">Đang tải...</p></Panel>;
    if (status === 'failed')  return <Panel title="Theo danh mục"><p className="state-msg state-msg--error">{error}</p></Panel>;
    if (!data || data.categories.length === 0) {
        return <Panel title="Theo danh mục"><p className="state-msg">Không có dữ liệu.</p></Panel>;
    }

    return (
        <Panel title="Doanh thu theo danh mục">
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
                    <ResponsiveContainer width="100%" height={Math.max(240, data.categories.length * 44)}>
                        <BarChart
                            data={data.categories}
                            layout="vertical"
                            margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
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
                                dataKey="category"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                width={90}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="revenue" name="Doanh thu" radius={[0, 4, 4, 0]}>
                                {data.categories.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <DataTable columns={columns} data={data.categories} />
            )}
        </Panel>
    );
};

export default RevenueByCategorySection;