import AdminLayout from '../../components/layout/AdminLayout';
import KPIGrid from '../../components/common/KPIGrid';
import Panel from '../../components/common/Panel';
import DataTable from '../../components/common/DataTable';
import '../../styles/admin/AdminDashboard.css';

const kpiData = [
    { label: 'Doanh thu hôm nay', value: '12.480.000đ', delta: '▲ 8.2% so với hôm qua', deltaType: 'up' as const },
    { label: 'Đơn hàng', value: '86', delta: '▲ 5 đơn', deltaType: 'up' as const },
    { label: 'Lợi nhuận tạm tính', value: '3.210.000đ', delta: '▼ 1.4%', deltaType: 'down' as const },
    { label: 'SP cận hết hàng', value: '7', delta: 'Cần nhập thêm', deltaType: 'warning' as const },
];

const topProducts = [
    { product: 'Coca-Cola lon 330ml', sold: 42, revenue: '420.000đ' },
    { product: 'Mì gói Hảo Hảo tôm chua cay', sold: 65, revenue: '325.000đ' },
    { product: 'Sữa tươi Vinamilk 220ml', sold: 38, revenue: '304.000đ' },
    { product: 'Bia Tiger lon 330ml', sold: 20, revenue: '340.000đ' },
];

const stockWarnings = [
    { product: 'Trứng gà ta hộp 10 quả', status: <span className="tag tag--danger">Cận HSD 5 ngày</span> },
    { product: 'Xúc xích Đức Việt 200g', status: <span className="tag tag--danger">Cận HSD 12 ngày</span> },
    { product: 'Pin AA Energizer', status: <span className="tag tag--warning">Tồn thấp (8/30)</span> },
    { product: 'Kẹo dẻo Haribo 80g', status: <span className="tag tag--success">Bình thường</span> },
];

function AdminDashboard() {
    return (
        <AdminLayout title="Tổng quan" subtitle="Thứ Bảy, 20/06/2026">
            <KPIGrid items={kpiData} />
            <div className="two-col">
                <Panel title="Sản phẩm bán chạy hôm nay">
                            <DataTable
                                columns={[
                                    { key: 'product', label: 'Sản phẩm' },
                                    { key: 'sold', label: 'Đã bán' },
                                    { key: 'revenue', label: 'Doanh thu' },
                                ]}
                                data={topProducts}
                            />
                        </Panel>

                        <Panel title="Cảnh báo kho">
                            <DataTable
                                columns={[
                                    { key: 'product', label: 'Sản phẩm' },
                                    { key: 'status', label: 'Trạng thái', render: (val) => val },
                                ]}
                                data={stockWarnings}
                            />
                        </Panel>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;