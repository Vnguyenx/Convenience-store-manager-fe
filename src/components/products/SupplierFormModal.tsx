// src/components/products/SupplierFormModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Supplier } from '../../types/models';

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: Partial<Supplier>) => Promise<void>;
    editingSupplier?: Supplier | null;
}

const emptyForm = { name: '', phone: '', email: '', address: '', contactPerson: '', note: '' };

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSubmit, editingSupplier }) => {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Invalidate form state mỗi khi đổi đối tượng đang sửa / mở modal tạo mới
    useEffect(() => {
        if (editingSupplier) {
            setForm({
                name: editingSupplier.name || '',
                phone: editingSupplier.phone || '',
                email: editingSupplier.email || '',
                address: editingSupplier.address || '',
                contactPerson: editingSupplier.contactPerson || '',
                note: editingSupplier.note || '',
            });
        } else {
            setForm(emptyForm);
        }
        setErrors({});
    }, [editingSupplier, isOpen]);

    const validate = () => {
        const next: Record<string, string> = {};
        if (!form.name.trim() || form.name.trim().length < 2)
            next.name = 'Tên nhà cung cấp phải có ít nhất 2 ký tự';
        if (form.phone && !/^(0|\+84)[0-9]{9}$/.test(form.phone))
            next.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            next.email = 'Email không hợp lệ';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await onSubmit(form);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}>
            <Input
                label="Tên nhà cung cấp"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
            />
            <Input
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
            />
            <Input
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
            />
            <Input
                label="Địa chỉ"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
                label="Người liên hệ"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            />
            <Input
                label="Ghi chú"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <div className="modal-footer">
                <Button variant="secondary" onClick={onClose}>Hủy</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </div>
        </Modal>
    );
};

export default SupplierFormModal;