import React from 'react';

interface KPICardProps {
    label: string;
    value: string | number;
    delta?: string;
    deltaType?: 'up' | 'down' | 'warning';
}

const KPICard: React.FC<KPICardProps> = ({ label, value, delta, deltaType }) => {
    const deltaClass = deltaType === 'up' ? 'kpi-card__delta--up'
        : deltaType === 'down' ? 'kpi-card__delta--down'
            : '';
    return (
        <div className="kpi-card">
            <div className="kpi-card__label">{label}</div>
            <div className="kpi-card__value">{value}</div>
            {delta && (
                <div className={`kpi-card__delta ${deltaClass}`}>{delta}</div>
            )}
        </div>
    );
};

export default KPICard;