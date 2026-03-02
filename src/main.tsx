import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'

//   light: sandstone, cosmo, lux, flatly, minty, zephyr, materia | dark: slate, darkly, cyborg
import 'bootswatch/dist/sandstone/bootstrap.min.css'
// import 'bootswatch/dist/slate/bootstrap.min.css'
import './scss/styles.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
