import React, { useState, useCallback } from 'react';
import './styles/global.css';
import HomePage from './pages/HomePage';
import TrackingResultPage from './pages/TrackingResultPage';
import { fetchPackageByTrackingNumber } from './services/packageService';

export default function App() {
    const [page, setPage] = useState('home');          // 'home' | 'result'
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

    return <HomePage onSearch={handleSearch} loading={loading} />;
}