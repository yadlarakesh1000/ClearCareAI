import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import SlotManagementPage from './pages/SlotManagementPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentListPage from './pages/AppointmentListPage';
import ConsultationPage from './pages/ConsultationPage';
import ReviewPage from './pages/ReviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function RootRedirect() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ROLE_PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user?.role === 'ROLE_DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user?.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctors" element={<DoctorListPage />} />
        <Route path="/doctors/:id" element={<DoctorProfilePage />} />

        {/* Patient routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute requiredRole="ROLE_PATIENT">
              <PatientDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute requiredRole="ROLE_PATIENT">
              <AppointmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-appointment/:doctorId"
          element={
            <ProtectedRoute requiredRole="ROLE_PATIENT">
              <BookAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute requiredRole="ROLE_PATIENT">
              <ReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Doctor routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute requiredRole="ROLE_DOCTOR">
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/slots"
          element={
            <ProtectedRoute requiredRole="ROLE_DOCTOR">
              <SlotManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute requiredRole="ROLE_DOCTOR">
              <AppointmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/consultation/:appointmentId"
          element={
            <ProtectedRoute requiredRole="ROLE_DOCTOR">
              <ConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/analytics"
          element={
            <ProtectedRoute requiredRole="ROLE_DOCTOR">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
