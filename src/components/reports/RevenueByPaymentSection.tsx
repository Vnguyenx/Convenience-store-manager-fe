// src/components/reports/RevenueByPaymentSection.tsx
import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import DataTable from '../common/DataTable';
import Panel from '../common/Panel';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';

function fmt(n: number) { return n.toLocaleString('vi-VN') + ' ₫'; }

const METHOD_LABEL: Record<string, string> = {
    cash:  'Tiền mặt',
    qr:    'QR / Chuyển khoản',
    card:  'Thẻ',
    vnpay: 'VNPay',
};
function methodLabel(m: string) { return METHOD_LABEL[m] ?? m; }

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

const columns = [
    { key: 'paymentMethod', label: 'Phương thức', render: (v: string) => methodLabel(v) },
    { key: 'orders',        label: 'Số đơn',      render: (v: number) => v.toLocaleString('vi-VN') },
    { key: 'revenue',       label: 'Doanh thu',   render: (v: number) => fmt(v) },
    { key: 'percentage',    label: 'Tỉ lệ',       render: (v: number) => `${v.toFixed(1)}%` },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__label">{item.name}</p>
            <div className="chart-tooltip__row">
                <span className="chart-tooltip__dot" style={{ background: item.payload.fill }} />
                <span style={{ color: '#e2e8f0', fontSize: 12 }}>
                    {fmt(item.value)} — <strong>{item.payload.percentage?.toFixed(1)}%</strong>
                </span>
            </div>
        </div>
    );
};

const RevenueByPaymentSection: React.FC = () => {
    const { data, status, error } = useAppSelector((s) => s.report.byPayment);
    const [view, setView] = useState<'chart' | 'table'>('chart');

    const handleExport = () => {
        if (!data?.breakdown.length) return;
        const rows = data.breakdown.map((r) => ({
            'Phương thức':   methodLabel(r.paymentMethod),
            'Số đơn':        r.orders,
            'Doanh thu (₫)': r.revenue,
            'Tỉ lệ (%)':    r.percentage.toFixed(2),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Theo thanh toán');
        XLSX.writeFile(wb, 'doanh-thu-theo-thanh-toan.xlsx');
    };

    if (status === 'loading') return <Panel title="Theo phương thức thanh toán"><p className="state-msg">Đang tải...</p></Panel>;
    if (status === 'failed')  return <Panel title="Theo phương thức thanh toán"><p className="state-msg state-msg--error">{error}</p></Panel>;
    if (!data || data.breakdown.length === 0) {
        return <Panel title="Theo phương thức thanh toán"><p className="state-msg">Không có dữ liệu.</p></Panel>;
    }

    const chartData = data.breakdown.map((r) => ({
        ...r,
        name: methodLabel(r.paymentMethod),
    }));

    return (
        <Panel title="Theo phương thức thanh toán">
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
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius="55%"
                                outerRadius="80%"
                                paddingAngle={3}
                                dataKey="revenue"
                            >
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <DataTable columns={columns} data={data.breakdown} />
            )}
        </Panel>
    );
};

export default RevenueByPaymentSection;