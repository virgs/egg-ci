/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CORS_PROXY_URL?: string
}

declare module '*?raw' {
    const content: string
    export default content
}
