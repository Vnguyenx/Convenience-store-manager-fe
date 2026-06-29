// src/components/products/StockCheckModal.tsx
// Modal chi tiết 1 phiếu kiểm kê: nhập actualQuantity từng dòng + xác nhận phiếu
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import DataTable from '../common/DataTable';
import { InventoryCheck } from '../../types/models';

interface StockCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    check: InventoryCheck | null;
    onUpdateItem: (itemId: string, actualQuantity: number, note?: string) => Promise<void>;
    onConfirm: (id: string) => Promise<void>;
}

const StockCheckModal: React.FC<StockCheckModalProps> = ({ isOpen, onClose, check, onUpdateItem, onConfirm }) => {
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [actualValue, setActualValue] = useState<string>('');
    const [confirming, setConfirming] = useState(false);

    if (!check) {
        // isOpen=true nhưng fetch chưa xong — hiện skeleton thay vì render null
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Đang tải..." size="lg">
                <p className="loading-text">Đang tải dữ liệu phiếu kiểm kê...</p>
            </Modal>
        );
    }
    const isDraft = check.status === 'draft';

    const startEdit = (itemId: string, current: number | null) => {
        setEditingItemId(itemId);
        setActualValue(current !== null ? String(current) : '');
    };

    const saveEdit = async () => {
        const itemId = editingItemId; // capture trước khi clear
        const num = Number(actualValue);
        setEditingItemId(null); // clear ngay, không chờ API — tránh race condition khi blur sang ô khác
        if (!itemId) return;
        if (isNaN(num) || num < 0) {
            // giá trị không hợp lệ: không gọi API, bỏ qua thay đổi
            return;
        }
        await onUpdateItem(itemId, num);
    };

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await onConfirm(check.id);
            onClose();
        } finally {
            setConfirming(false);
        }
    };

    const columns = [
        { key: 'productCode', label: 'Mã SP' },
        { key: 'productName', label: 'Tên sản phẩm' },
        { key: 'systemQuantity', label: 'Tồn hệ thống' },
        {
            key: 'actualQuantity',
            label: 'Tồn thực tế',
            render: (value: number | null, row: any) =>
                isDraft && editingItemId === row.id ? (
                    <Input
                        type="number"
                        value={actualValue}
                        onChange={(e) => setActualValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') setEditingItemId(null);
                        }}
                        autoFocus
                    />
                ) : (
                    <span onClick={() => isDraft && startEdit(row.id, value)} style={{ cursor: isDraft ? 'pointer' : 'default' }}>
                        {value ?? '—'}
                    </span>
                ),
        },
        {
            key: 'difference',
            label: 'Chênh lệch',
            render: (_: any, row: any) => {
                // tính client-side để phản ánh ngay sau khi user cập nhật actualQuantity
                const diff = row.actualQuantity !== null
                    ? row.actualQuantity - row.systemQuantity
                    : null;
                if (diff === null) return '—';
                return (
                    <span className={diff < 0 ? 'text-danger' : diff > 0 ? 'text-warning' : ''}>
                        {diff > 0 ? `+${diff}` : diff}
                    </span>
                );
            },
        },
    ];

    const unfinishedCount = (check.items || []).filter((i) => i.actualQuantity === null).length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Phiếu kiểm kê ${check.checkCode}`} size="lg">
            <p>Trạng thái: <strong>{check.status === 'confirmed' ? 'Đã xác nhận' : 'Đang kiểm kê'}</strong></p>
            <DataTable columns={columns} data={check.items || []} />
            {isDraft && (
                <div className="modal-footer">
                    {unfinishedCount > 0 && <span className="text-warning">Còn {unfinishedCount} sản phẩm chưa nhập</span>}
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={confirming || unfinishedCount > 0}
                    >
                        {confirming ? 'Đang xác nhận...' : 'Xác nhận kiểm kê'}
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default StockCheckModal;