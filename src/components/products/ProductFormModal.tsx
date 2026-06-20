// src/components/products/ProductFormModal.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createProduct, updateProduct } from '../../store/productSlice';
import { Product } from '../../types/models';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import '../../styles/products/ProductFormModal.css';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Product | null;
}

const defaultFormData = {
    ID: '',
    name: '',
    category: '',
    unit: '',
    importPrice: 0,
    sellPrice: 0,
    discountPrice: 0,
    stockQuantity: 0,
    minStockThreshold: 0,
    expiryDate: '',
    imageURL: '',
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSuccess,
                                                               initialData,
                                                           }) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState(defaultFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ID: initialData.ID,
                name: initialData.name,
                category: initialData.category,
                unit: initialData.unit,
                importPrice: initialData.importPrice,
                sellPrice: initialData.sellPrice,
                discountPrice: initialData.discountPrice ?? 0,
                stockQuantity: initialData.stockQuantity,
                minStockThreshold: initialData.minStockThreshold,
                expiryDate: initialData.expiryDate || '',
                imageURL: initialData.imageURL || '',
            });
        } else {
            setFormData(defaultFormData);
        }
        setErrors({});
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData((prev) => ({ ...prev, [name]: parsedValue }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.ID.trim()) newErrors.ID = 'Mã sản phẩm không được để trống';
        if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm không được để trống';
        if (!formData.category.trim()) newErrors.category = 'Danh mục không được để trống';
        if (!formData.unit.trim()) newErrors.unit = 'Đơn vị không được để trống';
        if (formData.importPrice < 0) newErrors.importPrice = 'Giá nhập không được âm';
        if (formData.sellPrice <= 0) newErrors.sellPrice = 'Giá bán phải lớn hơn 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                discountPrice: formData.discountPrice || null,
                expiryDate: formData.expiryDate || null,
            };

            if (initialData?.docId) {
                await dispatch(updateProduct({ docId: initialData.docId, data: payload })).unwrap();
            } else {
                await dispatch(createProduct(payload)).unwrap();
            }
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Mã sản phẩm *</label>
                        <Input
                            name="ID"
                            value={formData.ID}
                            onChange={handleChange}
                        />
                        {errors.ID && <span className="error">{errors.ID}</span>}
                    </div>
                    <div className="form-group">
                        <label>Tên sản phẩm *</label>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Danh mục *</label>
                        <Input name="category" value={formData.category} onChange={handleChange} />
                        {errors.category && <span className="error">{errors.category}</span>}
                    </div>
                    <div className="form-group">
                        <label>Đơn vị tính *</label>
                        <Input name="unit" value={formData.unit} onChange={handleChange} />
                        {errors.unit && <span className="error">{errors.unit}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Giá nhập *</label>
                        <Input type="number" name="importPrice" value={formData.importPrice} onChange={handleChange} />
                        {errors.importPrice && <span className="error">{errors.importPrice}</span>}
                    </div>
                    <div className="form-group">
                        <label>Giá bán *</label>
                        <Input type="number" name="sellPrice" value={formData.sellPrice} onChange={handleChange} />
                        {errors.sellPrice && <span className="error">{errors.sellPrice}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Giá giảm (nếu có)</label>
                        <Input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Số lượng tồn</label>
                        <Input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Ngưỡng tồn tối thiểu</label>
                        <Input type="number" name="minStockThreshold" value={formData.minStockThreshold} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Hạn sử dụng</label>
                        <Input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>URL hình ảnh</label>
                    <Input name="imageURL" value={formData.imageURL} onChange={handleChange} placeholder="https://..." />
                </div>

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm mới')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductFormModal;