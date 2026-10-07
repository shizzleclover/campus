import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { demoUniversityMap } from './university/data/demo/demoMap'
import { validateMapLayout } from './university/schema/validator'

// Run validation during development
if (import.meta.env.DEV) {
  validateMapLayout(demoUniversityMap);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
