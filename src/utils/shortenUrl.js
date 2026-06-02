export function shortenUrl(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');
        const path = parsed.pathname.replace(/\/$/, '');
        const label = path.length > 0 ? `${host}${path}` : host;
        return label.length > 50 ? label.slice(0, 47) + '...' : label;
    } catch {
        return url.length > 50 ? url.slice(0, 47) + '...' : url;
    }
}
