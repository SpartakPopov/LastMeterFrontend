const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function createPackage(data) {
    const response = await fetch(`${BASE_URL}/packages/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const msg = await response.text().catch(() => '');
        throw new Error(msg || `Server error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function fetchUnassignedPackages() {
    const response = await fetch(`${BASE_URL}/packages/unassigned`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}

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