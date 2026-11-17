import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register the service worker (offline support + installable PWA / WebAPK).
// With registerType 'autoUpdate', new versions activate and reload automatically.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
