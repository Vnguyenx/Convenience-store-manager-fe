import React from 'react';
import KPICard from './KPICard';

interface KPIItem {
    label: string;
    value: string | number;
    delta?: string;
    deltaType?: 'up' | 'down' | 'warning';
}

interface KPIGridProps {
    items: KPIItem[];
}

const KPIGrid: React.FC<KPIGridProps> = ({ items }) => {
    return (
        <div className="kpi-grid">
            {items.map((item, idx) => (
                <KPICard key={idx} {...item} />
            ))}
        </div>
    );
};

export default KPIGrid;