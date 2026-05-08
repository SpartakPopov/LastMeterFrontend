import React, { useState, useCallback, useEffect } from 'react';
import './styles/global.css';
import Navbar, { SIDEBAR_W, TOPBAR_H } from './components/Navbar';
import HomePage from './pages/HomePage';
import TrackingResultPage from './pages/TrackingResultPage';
import CreatePackagePage from './pages/CreatePackagePage';
import UnclaimedPackagesPage from './pages/UnclaimedPackagesPage';
import OrderRequestsPage from './pages/OrderRequestsPage';
import CreateOrderRequestPage from './pages/CreateOrderRequestPage';
import PackagesDashboardPage from './pages/PackagesDashboardPage';
import MyOrdersPage from './pages/MyOrdersPage';
import { fetchPackageByTrackingNumber } from './services/packageService';

export default function App() {
    const [page, setPage] = useState('home');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        function onResize() { setIsMobile(window.innerWidth < 768); }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleSearch = useCallback(async (number) => {
        setTrackingNumber(number);
        setLoading(true);
        setError(null);
        setPackageData(null);
        setPage('result');
        try {
            const data = await fetchPackageByTrackingNumber(number);
            setPackageData(data);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    function navigate(key) {
        setPage(key);
        setPackageData(null);
        setError(null);
    }

    const contentStyle = {
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        marginTop: isMobile ? TOPBAR_H : 0,
        minHeight: isMobile ? `calc(100vh - ${TOPBAR_H}px)` : '100vh',
    };

    function renderPage() {
        switch (page) {
            case 'result':
                return <TrackingResultPage trackingNumber={trackingNumber} packageData={packageData} loading={loading} error={error} onSearch={handleSearch} />;
            case 'create':
                return <CreatePackagePage />;
            case 'unclaimed':
                return <UnclaimedPackagesPage />;
            case 'orderRequests':
                return <OrderRequestsPage />;
            case 'createOrderRequest':
                return <CreateOrderRequestPage />;
            case 'dashboard':
                return <PackagesDashboardPage />;
            case 'myOrders':
                return <MyOrdersPage />;
            default:
                return <HomePage onSearch={handleSearch} loading={loading} />;
        }
    }

    return (
        <>
            <Navbar currentPage={page} onNavigate={navigate} />
            <div style={contentStyle}>
                {renderPage()}
            </div>
        </>
    );
}
