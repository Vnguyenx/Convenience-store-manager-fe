// src/pages/admin/transactions/TransactionsToolbar.tsx
import React from 'react';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';

interface TransactionsToolbarProps {
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    paymentFilter: string;
    onPaymentFilterChange: (value: string) => void;
    onSearch: (value: string) => void;
    onReload: () => void;
}

const TransactionsToolbar: React.FC<TransactionsToolbarProps> = ({
                                                                     statusFilter,
                                                                     onStatusFilterChange,
                                                                     paymentFilter,
                                                                     onPaymentFilterChange,
                                                                     onSearch,
                                                                     onReload,
                                                                 }) => {
    return (
        <div className="transactions-toolbar">
            <div className="transactions-toolbar__search">
                <SearchBar
                    placeholder="Tìm theo mã đơn hoặc tên nhân viên..."
                    onSearch={onSearch}
                />
            </div>

            <select
                className="transactions-toolbar__select"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
            >
                <option value="">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã huỷ</option>
            </select>

            <select
                className="transactions-toolbar__select"
                value={paymentFilter}
                onChange={(e) => onPaymentFilterChange(e.target.value)}
            >
                <option value="">Tất cả phương thức</option>
                <option value="cash">Tiền mặt</option>
                <option value="qr">Chuyển khoản (QR)</option>
            </select>

            <Button variant="secondary" size="sm" onClick={onReload}>
                Tải lại
            </Button>
        </div>
    );
};

export default TransactionsToolbar;