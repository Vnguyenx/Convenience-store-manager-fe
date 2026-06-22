// src/pages/staff/history/HistoryToolbar.tsx
import React from 'react';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';

interface HistoryToolbarProps {
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onSearch: (value: string) => void;
    onReload: () => void;
}

const HistoryToolbar: React.FC<HistoryToolbarProps> = ({
                                                           statusFilter,
                                                           onStatusFilterChange,
                                                           onSearch,
                                                           onReload,
                                                       }) => {
    return (
        <div className="history-toolbar">
            <div className="history-toolbar__search">
                <SearchBar placeholder="Tìm theo mã đơn..." onSearch={onSearch} />
            </div>

            <select
                className="history-toolbar__select"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
            >
                <option value="">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã huỷ</option>
            </select>

            <Button variant="secondary" size="sm" onClick={onReload}>
                Tải lại
            </Button>
        </div>
    );
};

export default HistoryToolbar;