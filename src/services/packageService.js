const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function fetchPackageByTrackingNumber(trackingNumber) {
    const response = await fetch(`${BASE_URL}/packages/${encodeURIComponent(trackingNumber)}`);

    if (response.status === 404) {
        throw new Error('No package found with that tracking number.');
    }

    if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}