import React, { useState, useCallback, useEffect } from 'react';
import './styles/global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar, { SIDEBAR_W, TOPBAR_H } from './components/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TrackingResultPage from './pages/TrackingResultPage';
import CreatePackagePage from './pages/CreatePackagePage';
import UnclaimedPackagesPage from './pages/UnclaimedPackagesPage';
import OrderRequestsPage from './pages/OrderRequestsPage';
import CreateOrderRequestPage from './pages/CreateOrderRequestPage';
import PackagesDashboardPage from './pages/PackagesDashboardPage';
import MyOrdersPage from './pages/MyOrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import { fetchPackageByTrackingNumber } from './services/packageService';
import { fetchUnreadNotifications } from './services/notificationService';

export default function App() {
    return (
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    );
}

function AppShell() {
    const { currentUser } = useAuth();

    if (!currentUser) return <LoginPage />;
    return <AuthenticatedApp />;
}

const ADMIN_PAGES = new Set(['create', 'orderRequests', 'dashboard']);

function AuthenticatedApp() {
    const { currentUser } = useAuth();
    const [page, setPage] = useState('home');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        function onResize() { setIsMobile(window.innerWidth < 768); }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const refreshUnreadCount = useCallback(async () => {
        try {
            const data = await fetchUnreadNotifications(currentUser.id);
            setUnreadCount(data.length);
        } catch {
            // Silently ignore — badge stays at last known value
        }
    }, [currentUser.id]);

    useEffect(() => {
        refreshUnreadCount();
        const interval = setInterval(refreshUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [refreshUnreadCount]);

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
        if (ADMIN_PAGES.has(key) && currentUser.role !== 'ADMIN') return;
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
        if (ADMIN_PAGES.has(page) && currentUser.role !== 'ADMIN') {
            return <HomePage onSearch={handleSearch} loading={loading} />;
        }
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
                return <PackagesDashboardPage onViewDetails={handleSearch} />;
            case 'myOrders':
                return <MyOrdersPage />;
            case 'notifications':
                return (
                    <NotificationsPage
                        userId={currentUser.id}
                        onViewPackage={handleSearch}
                        onUnreadCountChange={refreshUnreadCount}
                    />
                );
            default:
                return <HomePage onSearch={handleSearch} loading={loading} />;
        }
    }

    return (
        <>
            <Navbar currentPage={page} onNavigate={navigate} unreadCount={unreadCount} />
            <div style={contentStyle}>
                {renderPage()}
            </div>
        </>
    );
}
