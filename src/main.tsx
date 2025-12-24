import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ добавьте это
import App from './App.tsx';
import './App.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ обернуть App */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);
