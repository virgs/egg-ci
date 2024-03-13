export const hash = async (text: string): Promise<string> => {
    const utf8 = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
    // const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))

    // return hashArray
    //     .map((bytes) => bytes.toString(16).padStart(2, '0'))
    //     .join('');
}
