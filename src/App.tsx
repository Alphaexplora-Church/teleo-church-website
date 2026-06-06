import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop'; //

// --- IMPORT YOUR PAGES ---

import Login from './pages/Login';
import AdminDashboard from './features/Admin/AdminDashboard';
import AdminEvents from './features/Admin/AdminEvents';
import AdminRegistrations from './features/Admin/AdminRegistrations';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* Reset scroll on every route change */}
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
      </Routes>
    </AnimatePresence>
  );
}