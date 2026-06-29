// src/components/products/CreateCheckModal.tsx
// Modal tạo phiếu kiểm kê: chọn toàn bộ kho hoặc chọn thủ công từng sản phẩm
import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Product } from '../../types/models';

interface CreateCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onSubmit: (payload: { note?: string; productIds?: string[] }) => Promise<void>;
}

type Mode = 'all' | 'manual';

const CreateCheckModal: React.FC<CreateCheckModalProps> = ({ isOpen, onClose, products, onSubmit }) => {
    const [mode, setMode] = useState<Mode>('all');
    const [note, setNote] = useState('');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    // reset state mỗi khi mở modal
    React.useEffect(() => {
        if (isOpen) {
            setMode('all');
            setNote('');
            setSearch('');
            setSelected(new Set());
        }
    }, [isOpen]);

    // chỉ làm việc với sản phẩm đã có docId (đã được lưu trên Firestore)
    const validProducts = useMemo(
        () => products.filter((p): p is Product & { docId: string } => !!p.docId),
        [products]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return validProducts;
        return validProducts.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.ID.toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
        );
    }, [validProducts, search]);

    const toggleOne = (docId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(docId) ? next.delete(docId) : next.add(docId);
            return next;
        });
    };

    const toggleAll = () => {
        const allChecked = filtered.every((p) => selected.has(p.docId));
        setSelected((prev) => {
            const next = new Set(prev);
            filtered.forEach((p) => (allChecked ? next.delete(p.docId) : next.add(p.docId)));
            return next;
        });
    };

    const allFilteredChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.docId));
    const isValid = mode === 'all' || selected.size > 0;

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        try {
            await onSubmit({
                note: note.trim() || undefined,
                productIds: mode === 'manual' ? Array.from(selected) : undefined,
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !submitting && onClose()} title="Tạo phiếu kiểm kê mới" size="lg">
            {/* ── Ghi chú ── */}
            <Input
                label="Ghi chú (tuỳ chọn)"
                placeholder="VD: Kiểm kê cuối tháng 6"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />

            {/* ── Chọn chế độ ── */}
            <div className="create-check__mode-row">
                <button
                    type="button"
                    className={`create-check__mode-btn ${mode === 'all' ? 'create-check__mode-btn--active' : ''}`}
                    onClick={() => setMode('all')}
                >
                    <span className="create-check__mode-icon">📦</span>
                    <span>
                        <strong>Toàn bộ kho</strong>
                        <small>Tự động lấy tất cả {validProducts.length} sản phẩm</small>
                    </span>
                </button>
                <button
                    type="button"
                    className={`create-check__mode-btn ${mode === 'manual' ? 'create-check__mode-btn--active' : ''}`}
                    onClick={() => setMode('manual')}
                >
                    <span className="create-check__mode-icon">✏️</span>
                    <span>
                        <strong>Chọn thủ công</strong>
                        <small>Tick từng sản phẩm cần kiểm</small>
                    </span>
                </button>
            </div>

            {/* ── Bảng chọn thủ công ── */}
            {mode === 'manual' && (
                <div className="create-check__picker">
                    <div className="create-check__picker-toolbar">
                        <input
                            className="input"
                            placeholder="Tìm theo tên, mã, danh mục..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="create-check__count">
                            Đã chọn <strong>{selected.size}</strong> / {validProducts.length}
                        </span>
                    </div>

                    <div className="create-check__table-wrap">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input
                                        type="checkbox"
                                        checked={allFilteredChecked}
                                        onChange={toggleAll}
                                        title="Chọn/bỏ tất cả kết quả"
                                    />
                                </th>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Tồn kho</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        Không tìm thấy sản phẩm nào.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr
                                        key={p.docId}
                                        className={selected.has(p.docId) ? 'create-check__row--selected' : ''}
                                        onClick={() => toggleOne(p.docId)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selected.has(p.docId)}
                                                onChange={() => toggleOne(p.docId)}
                                            />
                                        </td>
                                        <td>{p.ID}</td>
                                        <td>{p.name}</td>
                                        <td>{p.category || '—'}</td>
                                        <td>{p.stockQuantity ?? '—'}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {selected.size === 0 && (
                        <p className="create-check__warn">Vui lòng chọn ít nhất 1 sản phẩm.</p>
                    )}
                </div>
            )}

            {/* ── Footer ── */}
            <div className="modal-footer">
                <Button variant="secondary" onClick={onClose} disabled={submitting}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!isValid || submitting}>
                    {submitting
                        ? 'Đang tạo...'
                        : mode === 'all'
                            ? `Tạo phiếu (${validProducts.length} SP)`
                            : `Tạo phiếu (${selected.size} SP)`}
                </Button>
            </div>
        </Modal>
    );
};

export default CreateCheckModal;