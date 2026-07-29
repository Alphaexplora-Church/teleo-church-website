import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './shared/components/ScrollToTop';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { AuthProvider } from './shared/context/AuthContext';
import LoginView from './features/Auth/login/view/LoginView';
import AdminDashboardView from './features/Admin/dashboard/view/AdminDashboardView';
import AdminEventsView from './features/Admin/events/view/AdminEventsView';
import AdminRegistrationsView from './features/Admin/registrations/view/AdminRegistrationsView';
import AdminSettingsView from './features/Admin/settings/view/AdminSettingsView';
import AdminUsersView from './features/Admin/users/view/AdminUsersView';
import AdminPrayerWallView from './features/Admin/prayer-wall/view/AdminPrayerWallView';

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoginView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardView /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><AdminEventsView /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute><AdminRegistrationsView /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsView /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsersView /></ProtectedRoute>} />
          <Route path="/admin/prayer-wall" element={<ProtectedRoute><AdminPrayerWallView /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}
