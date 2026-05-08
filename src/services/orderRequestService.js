const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function getAllOrderRequests() {
    const response = await fetch(`${BASE_URL}/order-requests`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}

export async function createOrderRequest(data) {
    const response = await fetch(`${BASE_URL}/order-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const msg = await response.text().catch(() => '');
        throw new Error(msg || `Server error: ${response.status}`);
    }
    return response.json();
}

export async function approveOrderRequest(id, managerNotes) {
    const response = await fetch(`${BASE_URL}/order-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerNotes }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}

export async function rejectOrderRequest(id, managerNotes) {
    const response = await fetch(`${BASE_URL}/order-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerNotes }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}

export async function fulfillOrderRequest(id, packages) {
    const response = await fetch(`${BASE_URL}/order-requests/${id}/fulfill`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}
