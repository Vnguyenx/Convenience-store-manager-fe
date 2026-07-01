// src/components/reports/RevenueByStaffSection.tsx
import React from 'react';
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

const columns = [
    { key: 'cashierName',       label: 'Nhân viên' },
    { key: 'orders',            label: 'Số đơn',       render: (v: number) => v.toLocaleString('vi-VN') },
    { key: 'revenue',           label: 'Doanh thu',    render: (v: number) => fmt(v) },
    { key: 'averageOrderValue', label: 'Giá trị đơn TB', render: (v: number) => fmt(v) },
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

const RevenueByStaffSection: React.FC = () => {
    const { data, status, error } = useAppSelector((s) => s.report.byStaff);
    const [view, setView] = React.useState<'chart' | 'table'>('chart');

    const handleExport = () => {
        if (!data?.staff.length) return;
        const rows = data.staff.map((r) => ({
            'Nhân viên':          r.cashierName,
            'Số đơn':             r.orders,
            'Doanh thu (₫)':     r.revenue,
            'Giá trị đơn TB (₫)': r.averageOrderValue,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Theo nhân viên');
        XLSX.writeFile(wb, 'doanh-thu-theo-nhan-vien.xlsx');
    };

    if (status === 'loading') return <Panel title="Theo nhân viên"><p className="state-msg">Đang tải...</p></Panel>;
    if (status === 'failed')  return <Panel title="Theo nhân viên"><p className="state-msg state-msg--error">{error}</p></Panel>;
    if (!data || data.staff.length === 0) {
        return <Panel title="Theo nhân viên"><p className="state-msg">Không có dữ liệu.</p></Panel>;
    }

    return (
        <Panel title="Doanh thu theo nhân viên">
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
                    <ResponsiveContainer width="100%" height={Math.max(240, data.staff.length * 52)}>
                        <BarChart
                            data={data.staff}
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
                                dataKey="cashierName"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                width={90}
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
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <DataTable columns={columns} data={data.staff} />
            )}
        </Panel>
    );
};

export default RevenueByStaffSection;