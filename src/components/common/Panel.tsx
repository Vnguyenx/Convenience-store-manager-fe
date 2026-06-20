import React from 'react';

interface PanelProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, children, className = '' }) => {
    return (
        <section className={`panel ${className}`}>
            {title && (
                <div className="panel__header">
                    <h3>{title}</h3>
                </div>
            )}
            <div className="panel__body">{children}</div>
        </section>
    );
};

export default Panel;