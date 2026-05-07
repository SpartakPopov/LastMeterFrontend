import React, { useState, useCallback } from 'react';
import './styles/global.css';
import HomePage from './pages/HomePage';
import TrackingResultPage from './pages/TrackingResultPage';
import CreatePackagePage from './pages/CreatePackagePage';
import UnclaimedPackagesPage from './pages/UnclaimedPackagesPage';
import OrderRequestsPage from './pages/OrderRequestsPage';
import CreateOrderRequestPage from './pages/CreateOrderRequestPage';
import { fetchPackageByTrackingNumber } from './services/packageService';

export default function App() {
    const [page, setPage] = useState('home');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleBack = useCallback(() => {
        setPage('home');
        setPackageData(null);
        setError(null);
    }, []);

    if (page === 'result') {
        return (
            <TrackingResultPage
                trackingNumber={trackingNumber}
                packageData={packageData}
                loading={loading}
                error={error}
                onBack={handleBack}
                onSearch={handleSearch}
            />
        );
    }

    if (page === 'create') {
        return <CreatePackagePage onBack={handleBack} onCreated={() => {}} />;
    }

    if (page === 'unclaimed') {
        return <UnclaimedPackagesPage onBack={handleBack} />;
    }

    if (page === 'orderRequests') {
        return <OrderRequestsPage onBack={handleBack} />;
    }

    if (page === 'createOrderRequest') {
        return <CreateOrderRequestPage onBack={handleBack} />;
    }

    return (
        <HomePage
            onSearch={handleSearch}
            loading={loading}
            onCreatePackage={() => setPage('create')}
            onViewUnclaimed={() => setPage('unclaimed')}
            onViewOrderRequests={() => setPage('orderRequests')}
            onCreateOrderRequest={() => setPage('createOrderRequest')}
        />
    );
}
