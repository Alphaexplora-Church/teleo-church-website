import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ScrollToTop from './components/ScrollToTop'; // <-- IMPORT ADDED
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ScrollToTop sits inside Router, outside App */}
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)