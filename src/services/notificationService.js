const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchAllNotifications(userId) {
    const res = await fetch(`${BASE_URL}/notifications/user/${userId}`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
}

export async function fetchUnreadNotifications(userId) {
    const res = await fetch(`${BASE_URL}/notifications/user/${userId}/unread`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
}

export async function markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
}
