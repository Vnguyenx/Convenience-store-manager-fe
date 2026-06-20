import React from 'react';
import ProductArea from './ProductArea';
import CategoryChips from './CategoryChips';
import CartPanel from './CartPanel';
import '../../styles/pos/pos.css';

// Dữ liệu mẫu (sẽ lấy từ props sau)
const sampleProducts = [
    { id: '1', name: 'Coca-Cola lon 330ml', price: 10000 },
    { id: '2', name: 'Pepsi lon 330ml', price: 9000, oldPrice: 10000, discount: 10 },
    { id: '3', name: 'Trà xanh Không Độ 500ml', price: 12000 },
    { id: '4', name: 'Sữa tươi Vinamilk có đường 220ml', price: 8000 },
    { id: '5', name: 'Sữa chua uống Yakult 5 chai', price: 22000, oldPrice: 25000, discount: 12 },
    { id: '6', name: 'Mì gói Hảo Hảo tôm chua cay', price: 5000 },
    { id: '7', name: 'Mì ly Omachi xốt bò hầm', price: 13000 },
    { id: '8', name: 'Bánh quy Cosy bơ sữa 270g', price: 18000, oldPrice: 21000, discount: 14 },
];

const sampleCategories = ['Tất cả', 'Nước giải khát', 'Sữa & sản phẩm từ sữa', 'Thực phẩm khô', 'Bánh kẹo', 'Hóa phẩm gia dụng', 'Đồ uống có cồn'];

const sampleCartItems = [
    { id: '1', name: 'Coca-Cola lon 330ml', unitPrice: 10000, quantity: 2, total: 20000 },
    { id: '6', name: 'Mì gói Hảo Hảo tôm chua cay', unitPrice: 5000, quantity: 5, total: 25000 },
    { id: '5', name: 'Sữa chua uống Yakult 5 chai', unitPrice: 22000, quantity: 1, total: 22000, discount: 12 },
];

const POSLayout: React.FC = () => {
    return (
        <div className="pos-layout">
            <section className="pos-products">
                <div className="pos-searchbar">
                    <input className="input" placeholder="Tìm theo tên hoặc mã sản phẩm (SP0001, Coca...)" />
                    <button className="btn btn-secondary">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><rect x="4" y="4" width="5" height="5"/><rect x="4" y="15" width="5" height="5"/><rect x="15" y="4" width="5" height="5"/><rect x="15" y="15" width="5" height="5"/></svg>
                        Quét mã
                    </button>
                </div>

                <CategoryChips categories={sampleCategories} activeCategory="Tất cả" />

                <ProductArea products={sampleProducts} />
            </section>

            <CartPanel
                orderCode="DH00128"
                items={sampleCartItems}
                subtotal={67000}
                discountTotal={3000}
                total={64000}
            />
        </div>
    );
};

export default POSLayout;