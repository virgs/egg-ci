export const hash = async (text: string): Promise<string> => {
    const utf8 = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}
