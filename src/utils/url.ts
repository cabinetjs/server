export function buildSearchParams(data: Record<string, string | number>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        params.set(key, value.toString());
    }

    return params;
}
