export async function handleApiError(resp) {
    const text = await resp.text();
    let errorMessage = text || `HTTP ${resp.status}`;
    try {
        const json = JSON.parse(text);
        if (json.error) errorMessage = json.error;
        else if (json.message) errorMessage = json.message;
    } catch (e) {
        // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
}
