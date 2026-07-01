// src/pages/admin/AdminRevenuePage.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchRevenueOverview,
    fetchRevenueByTime,
    fetchRevenueByPaymentMethod,
    fetchTopProducts,
    fetchRevenueByStaff,
    fetchRevenueByCategory,
} from '../../store/reportSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import RevenueFilterBar from '../../components/reports/RevenueFilterBar';
import RevenueKPISection from '../../components/reports/RevenueKPISection';
import RevenueByTimeSection from '../../components/reports/RevenueByTimeSection';
import RevenueByPaymentSection from '../../components/reports/RevenueByPaymentSection';
import TopProductsSection from '../../components/reports/TopProductsSection';
import RevenueByStaffSection from '../../components/reports/RevenueByStaffSection';
import RevenueByCategorySection from '../../components/reports/RevenueByCategorySection';

import '../../styles/admin/AdminRevenue.css';

type TabId = 'overview' | 'products' | 'staff' | 'category';

const TABS: { id: TabId; label: string }[] = [
    { id: 'overview',  label: '📊 Tổng quan' },
    { id: 'products',  label: '🏷️ Sản phẩm' },
    { id: 'staff',     label: '👤 Nhân viên' },
    { id: 'category',  label: '📁 Danh mục' },
];

const AdminRevenuePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const query = useAppSelector((s) => s.report.query);
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const fetchAll = useCallback(() => {
        const { from, to, compare, groupBy, topLimit } = query;
        dispatch(fetchRevenueOverview({ from, to, compare }));
        dispatch(fetchRevenueByTime({ from, to, groupBy }));
        dispatch(fetchRevenueByPaymentMethod({ from, to }));
        dispatch(fetchTopProducts({ from, to, topLimit }));
        dispatch(fetchRevenueByStaff({ from, to }));
        dispatch(fetchRevenueByCategory({ from, to }));
    }, [dispatch, query]);

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AdminLayout title="Thống kê doanh thu" subtitle="Phân tích chi tiết theo khoảng thời gian">
            <div className="revenue-page">

                {/* ── Bộ lọc chung ── */}
                <RevenueFilterBar onApply={fetchAll} />

                {/* ── Tabs ── */}
                <div className="revenue-tabs">
                    <nav className="revenue-tabs__nav">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={activeTab === tab.id ? 'active' : ''}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Tab: Tổng quan */}
                    <div className={`revenue-tab-panel ${activeTab === 'overview' ? 'active' : ''}`}>
                        <RevenueKPISection />
                        <div className="revenue-page__row">
                            <div className="revenue-page__col--wide">
                                <RevenueByTimeSection />
                            </div>
                            <div className="revenue-page__col--narrow">
                                <RevenueByPaymentSection />
                            </div>
                        </div>
                    </div>

                    {/* Tab: Sản phẩm */}
                    <div className={`revenue-tab-panel ${activeTab === 'products' ? 'active' : ''}`}>
                        <TopProductsSection />
                    </div>

                    {/* Tab: Nhân viên */}
                    <div className={`revenue-tab-panel ${activeTab === 'staff' ? 'active' : ''}`}>
                        <RevenueByStaffSection />
                    </div>

                    {/* Tab: Danh mục */}
                    <div className={`revenue-tab-panel ${activeTab === 'category' ? 'active' : ''}`}>
                        <RevenueByCategorySection />
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminRevenuePage;