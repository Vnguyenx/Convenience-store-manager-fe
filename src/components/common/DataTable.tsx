import React from 'react';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: Record<string, any>[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
    return (
        <table className="data-table">
            <thead>
            <tr>
                {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, idx) => (
                <tr key={idx}>
                    {columns.map((col) => (
                        <td key={col.key}>
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default DataTable;