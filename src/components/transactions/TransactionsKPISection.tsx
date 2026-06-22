// src/pages/admin/transactions/TransactionsKPISection.tsx
import React, { useMemo } from 'react';
import KPIGrid from '../../components/common/KPIGrid';
import { SavedOrder } from '../../services/orderService';
import { formatCurrency } from '../../utils/transactionUtils';

interface TransactionsKPISectionProps {
    orders: SavedOrder[];
}

const TransactionsKPISection: React.FC<TransactionsKPISectionProps> = ({ orders }) => {
    const kpis = useMemo(() => {
        const completed = orders.filter((o) => o.status === 'completed');
        const cancelled = orders.filter((o) => o.status === 'cancelled');
        const totalRevenue = completed.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgOrderValue = completed.length ? totalRevenue / completed.length : 0;

        return [
            { label: 'Tổng số đơn', value: orders.length },
            { label: 'Doanh thu (đơn hoàn thành)', value: formatCurrency(totalRevenue) },
            { label: 'Giá trị TB / đơn', value: formatCurrency(avgOrderValue) },
            {
                label: 'Đơn đã huỷ',
                value: cancelled.length,
                deltaType: cancelled.length > 0 ? ('warning' as const) : undefined,
            },
        ];
    }, [orders]);

    return (
        <div className="transactions-kpi">
            <KPIGrid items={kpis} />
        </div>
    );
};

export default TransactionsKPISection;