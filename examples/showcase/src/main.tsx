import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QuokkaProvider } from 'quokkajs'
import { useAuthStore } from './store'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuokkaProvider getState={useAuthStore.getState}>
      <App />
    </QuokkaProvider>
  </StrictMode>,
)
