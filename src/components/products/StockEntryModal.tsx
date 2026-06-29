// src/components/products/StockEntryModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Supplier, Product } from '../../types/models';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts, createProduct } from '../../store/productSlice';
import { formatCurrency } from '../../utils/formatCurrency';

interface DraftItem {
    productDocId: string;
    quantity: number;
    unitPrice: number;
    note: string;
}

interface StockEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    suppliers: Supplier[];
    onSubmit: (payload: { supplierId: string; note?: string; items: { productId: string; quantity: number; unitPrice: number; note?: string }[] }) => Promise<void>;
}

const emptyQuickProduct = {
    ID: '',
    name: '',
    category: '',
    unit: '',
    importPrice: 0,
    sellPrice: 0,
    discountPrice: null as number | null,
    stockQuantity: 0,
    minStockThreshold: 0,
    expiryDate: null as string | null,
    imageURL: '',
};

const StockEntryModal: React.FC<StockEntryModalProps> = ({ isOpen, onClose, suppliers, onSubmit }) => {
    const dispatch = useAppDispatch();
    const products = useAppSelector((state) => state.product.products);

    const [supplierId, setSupplierId] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState<DraftItem[]>([{ productDocId: '', quantity: 1, unitPrice: 0, note: '' }]);
    const [submitting, setSubmitting] = useState(false);

    // quick-create product state
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [creatingForIndex, setCreatingForIndex] = useState<number | null>(null);
    const [quickProduct, setQuickProduct] = useState(emptyQuickProduct);
    const [quickSubmitting, setQuickSubmitting] = useState(false);

    // Invalidate form mỗi khi mở modal mới
    useEffect(() => {
        if (isOpen) {
            setSupplierId('');
            setNote('');
            setItems([{ productDocId: '', quantity: 1, unitPrice: 0, note: '' }]);
            dispatch(fetchProducts()); // luôn lấy danh sách sản phẩm mới nhất khi mở phiếu
        }
    }, [isOpen, dispatch]);

    const updateItem = (index: number, patch: Partial<DraftItem>) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    };

    const addRow = () => setItems((prev) => [...prev, { productDocId: '', quantity: 1, unitPrice: 0, note: '' }]);
    const removeRow = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

    const openCreateProduct = (index: number) => {
        setCreatingForIndex(index);
        setQuickProduct(emptyQuickProduct);
        setIsCreatingProduct(true);
    };

    const handleQuickCreateSubmit = async () => {
        if (!quickProduct.ID.trim() || !quickProduct.name.trim()) return;
        setQuickSubmitting(true);
        try {
            const created = await dispatch(createProduct(quickProduct as Omit<Product, 'docId' | 'createdAt' | 'updatedAt'>)).unwrap();
            await dispatch(fetchProducts()); // invalidate danh sách product để dropdown có sản phẩm mới
            if (creatingForIndex !== null && created?.docId) {
                updateItem(creatingForIndex, { productDocId: created.docId });
            }
            setIsCreatingProduct(false);
            setCreatingForIndex(null);
        } finally {
            setQuickSubmitting(false);
        }
    };

    const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

    const isValid =
        supplierId &&
        items.length > 0 &&
        items.every((it) => it.productDocId && it.quantity > 0 && it.unitPrice >= 0);

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        try {
            await onSubmit({
                supplierId,
                note,
                items: items.map((it) => ({
                    productId: it.productDocId,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    note: it.note,
                })),
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Tạo phiếu nhập kho" size="lg">
                <div className="form-row">
                    <label>Nhà cung cấp</label>
                    <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="select">
                        <option value="">-- Chọn nhà cung cấp --</option>
                        {suppliers.filter((s) => s.isActive).map((s) => (
                            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                        ))}
                    </select>
                </div>

                <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />

                <h4 style={{color: '#8fa5bc'}} >Danh sách sản phẩm</h4>
                {items.map((item, index) => (
                    <div className="stock-entry-row" key={index}>
                        <select
                            value={item.productDocId}
                            onChange={(e) => updateItem(index, { productDocId: e.target.value })}
                            className="select"
                        >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map((p) => (
                                <option key={p.docId} value={p.docId}>{p.ID} - {p.name}</option>
                            ))}
                        </select>
                        <Button size="sm" variant="secondary" type="button" onClick={() => openCreateProduct(index)}>
                            + Sản phẩm mới
                        </Button>
                        <Input
                            type="number"
                            placeholder="Số lượng"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                        />
                        <Input
                            type="number"
                            placeholder="Đơn giá"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                        />
                        <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
                        {items.length > 1 && (
                            <Button size="sm" variant="danger" type="button" onClick={() => removeRow(index)}>Xóa</Button>
                        )}
                    </div>
                ))}
                <Button size="sm" variant="secondary" type="button" onClick={addRow}>+ Thêm dòng</Button>

                <div className="stock-entry-total">Tổng cộng: {formatCurrency(totalAmount)}</div>

                <div className="modal-footer">
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!isValid || submitting}>
                        {submitting ? 'Đang lưu...' : 'Tạo phiếu'}
                    </Button>
                </div>
            </Modal>

            {/* Tạo nhanh sản phẩm mới — form inline, tạm thay cho ProductFormModal vì chưa biết props thật của component đó */}
            <Modal isOpen={isCreatingProduct} onClose={() => setIsCreatingProduct(false)} title="Thêm sản phẩm mới" size="md">
                <Input label="Mã sản phẩm (ID)" value={quickProduct.ID} onChange={(e) => setQuickProduct({ ...quickProduct, ID: e.target.value })} />
                <Input label="Tên sản phẩm" value={quickProduct.name} onChange={(e) => setQuickProduct({ ...quickProduct, name: e.target.value })} />
                <Input label="Danh mục" value={quickProduct.category} onChange={(e) => setQuickProduct({ ...quickProduct, category: e.target.value })} />
                <Input label="Đơn vị" value={quickProduct.unit} onChange={(e) => setQuickProduct({ ...quickProduct, unit: e.target.value })} />
                <Input
                    label="Giá nhập"
                    type="number"
                    value={quickProduct.importPrice}
                    onChange={(e) => setQuickProduct({ ...quickProduct, importPrice: Number(e.target.value) })}
                />
                <Input
                    label="Giá bán"
                    type="number"
                    value={quickProduct.sellPrice}
                    onChange={(e) => setQuickProduct({ ...quickProduct, sellPrice: Number(e.target.value) })}
                />
                <Input
                    label="Ngưỡng tồn tối thiểu"
                    type="number"
                    value={quickProduct.minStockThreshold}
                    onChange={(e) => setQuickProduct({ ...quickProduct, minStockThreshold: Number(e.target.value) })}
                />
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsCreatingProduct(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleQuickCreateSubmit} disabled={quickSubmitting}>
                        {quickSubmitting ? 'Đang lưu...' : 'Tạo sản phẩm'}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default StockEntryModal;