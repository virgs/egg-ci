// To change the active light or dark theme, replace the import paths below with any Bootswatch theme.
// Browse themes at https://bootswatch.com/ — use the path pattern 'bootswatch/dist/<name>/bootstrap.min.css?url'.
// Examples — light: sandstone, cosmo, lux, flatly, minty, zephyr, materia | dark: slate, darkly, cyborg
import sandstoneUrl from 'bootswatch/dist/sandstone/bootstrap.min.css?url'
import slateUrl from 'bootswatch/dist/slate/bootstrap.min.css?url'

export type Theme = 'light' | 'dark'

const THEME_URLS: Record<Theme, string> = {
    light: sandstoneUrl,
    dark: slateUrl,
}

export const applyTheme = (theme: Theme): void => {
    const existing = document.getElementById('app-theme') as HTMLLinkElement | null
    const link = existing ?? document.createElement('link')
    if (!existing) {
        link.id = 'app-theme'
        link.rel = 'stylesheet'
        document.head.insertBefore(link, document.head.firstChild)
    }
    link.href = THEME_URLS[theme]
}
