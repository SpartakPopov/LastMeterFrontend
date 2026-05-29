const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function searchUsers(query) {
    if (!query || !query.trim()) return [];
    const response = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query.trim())}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}
