// src/pages/admin/AdminStockCheckPage.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import KPIGrid from '../../components/common/KPIGrid';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StockCheckModal from '../../components/products/StockCheckModal';
import CreateCheckModal from '../../components/products/CreateCheckModal';
import LowStockAlert from '../../components/products/LowStockAlert';
import ExpiryAlert from '../../components/products/ExpiryAlert';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../store/productSlice';
import {
    fetchInventoryChecks,
    fetchInventoryCheckDetail,
    createInventoryCheck,
    updateInventoryCheckItem,
    confirmInventoryCheck,
    fetchInventoryAlerts,
    clearCurrentCheck,
} from '../../store/inventorySlice';
import '../../styles/admin/adminCoupons.css';


const PAGE_SIZE = 10;
type Tab = 'checks' | 'alerts';

const AdminStockCheckPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { checks, currentCheck, alerts, loading, alertsLoading } = useAppSelector((state) => state.inventory);
    const products = useAppSelector((state) => state.product.products);

    const [tab, setTab] = useState<Tab>('checks');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [checksPage, setChecksPage] = useState(1);
    const [isCheckDirty, setIsCheckDirty] = useState(false);

    useEffect(() => {
        if (tab === 'checks') dispatch(fetchInventoryChecks(undefined));
        if (tab === 'alerts') dispatch(fetchInventoryAlerts(30));
    }, [dispatch, tab]);

    useEffect(() => {
        setChecksPage(1);
    }, [tab]);

    const openCreateModal = () => {
        dispatch(fetchProducts()); // luôn lấy danh sách mới nhất khi mở
        setIsCreateOpen(true);
    };

    const handleCreate = async (payload: { note?: string; productIds?: string[] }) => {
        await dispatch(createInventoryCheck(payload)).unwrap();
        await dispatch(fetchInventoryChecks(undefined));
        setChecksPage(1);
    };

    const openDetail = async (id: string) => {
        setIsCheckDirty(false);
        setIsDetailOpen(true);
        await dispatch(fetchInventoryCheckDetail(id));
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        dispatch(clearCurrentCheck());
        if (isCheckDirty) dispatch(fetchInventoryChecks(undefined));
        setIsCheckDirty(false);
    };

    const checksColumns = [
        { key: 'checkCode', label: 'Mã phiếu' },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value: string) => (
                <span className={`badge badge--${value === 'confirmed' ? 'success' : 'warning'}`}>
                    {value === 'confirmed' ? 'Đã xác nhận' : 'Đang kiểm kê'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
        },
        {
            key: 'actions',
            label: '',
            render: (_: any, row: any) => (
                <Button size="sm" variant="secondary" onClick={() => openDetail(row.id)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const checksTotalPages = Math.max(1, Math.ceil(checks.length / PAGE_SIZE));
    const pagedChecks = checks.slice((checksPage - 1) * PAGE_SIZE, checksPage * PAGE_SIZE);

    return (
        <AdminLayout title="Kiểm kê kho" subtitle="Kiểm kê tồn kho và cảnh báo">
            <div className="tabs">
                <button className={tab === 'checks' ? 'tab is-active' : 'tab'} onClick={() => setTab('checks')}>
                    Phiếu kiểm kê
                </button>
                <button className={tab === 'alerts' ? 'tab is-active' : 'tab'} onClick={() => setTab('alerts')}>
                    Cảnh báo kho
                </button>
            </div>

            {tab === 'checks' && (
                <Panel title="Danh sách phiếu kiểm kê">
                    <div className="panel-toolbar">
                        <Button variant="primary" onClick={openCreateModal}>
                            + Tạo phiếu kiểm kê mới
                        </Button>
                    </div>
                    {loading ? (
                        <p className="loading-text">Đang tải...</p>
                    ) : checks.length === 0 ? (
                        <p className="empty-state">Chưa có phiếu kiểm kê nào.</p>
                    ) : (
                        <>
                            <DataTable columns={checksColumns} data={pagedChecks} />
                            <Pagination currentPage={checksPage} totalPages={checksTotalPages} onPageChange={setChecksPage} />
                        </>
                    )}
                </Panel>
            )}

            {tab === 'alerts' && (
                <>
                    {alerts && (
                        <KPIGrid
                            items={[
                                { label: 'Tồn thấp', value: alerts.summary.lowStock, deltaType: 'warning' },
                                { label: 'Cận hạn sử dụng', value: alerts.summary.nearExpiry, deltaType: 'warning' },
                                { label: 'Đã hết hạn', value: alerts.summary.expired, deltaType: 'down' },
                            ]}
                        />
                    )}
                    <Panel title="Tồn kho thấp">
                        {alertsLoading ? <p className="loading-text">Đang tải...</p> : <LowStockAlert items={alerts?.lowStock || []} />}
                    </Panel>
                    <Panel title="Hạn sử dụng">
                        {alertsLoading ? (
                            <p className="loading-text">Đang tải...</p>
                        ) : (
                            <ExpiryAlert nearExpiry={alerts?.nearExpiry || []} expired={alerts?.expired || []} />
                        )}
                    </Panel>
                </>
            )}

            {/* ── Modal tạo phiếu kiểm kê ── */}
            <CreateCheckModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                products={products}
                onSubmit={handleCreate}
            />

            {/* ── Modal chi tiết phiếu kiểm kê ── */}
            <StockCheckModal
                isOpen={isDetailOpen}
                onClose={closeDetail}
                check={currentCheck}
                onUpdateItem={(itemId, actualQuantity, note) => {
                    if (!currentCheck) return Promise.resolve();
                    setIsCheckDirty(true);
                    return dispatch(updateInventoryCheckItem({ checkId: currentCheck.id, itemId, actualQuantity, note })).then(() => {});
                }}
                onConfirm={(id) => {
                    setIsCheckDirty(true);
                    return dispatch(confirmInventoryCheck(id)).then(() => {});
                }}
            />
        </AdminLayout>
    );
};

export default AdminStockCheckPage;