import { useEffect, useState, lazy, Suspense } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

import DashboardHeader from '../components/dashboard/DashboardHeader';

/* 🔥 LAZY IMPORTS */
const DashboardKPI = lazy(() => import('../components/dashboard/DashboardKPI'));
const RevenueChart = lazy(() => import('../components/dashboard/RevenueChart'));
const OrderInsights = lazy(() => import('../components/dashboard/OrderInsights'));
const StockAndSLA = lazy(() => import('../components/dashboard/StockAndSLA'));
const RecentOrders = lazy(() => import('../components/dashboard/RecentOrders'));
const OrderSLA = lazy(() => import('../components/dashboard/OrderSLA'));
const TopProductsChart = lazy(() =>
    import('../components/dashboard/TopProductsChart')
);


const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [range, setRange] = useState('7d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/dashboard/stats?range=${range}`);
                if (res.data.success) setStats(res.data.data);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [range]);

    return (
        <Layout>
            <DashboardHeader range={range} setRange={setRange} />

            <Suspense fallback={<SectionLoader />}>
                <DashboardKPI stats={stats} loading={loading} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <RevenueChart revenueChart={stats?.revenue_chart} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <OrderInsights stats={stats} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <StockAndSLA stats={stats} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <RecentOrders orders={stats?.recent_orders} loading={loading} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <OrderSLA range={range} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <TopProductsChart range={range} />
            </Suspense>

        </Layout>
    );
};

export default Dashboard;

/* ================= LOADER ================= */
const SectionLoader = () => (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
);
