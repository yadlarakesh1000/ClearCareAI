import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABELS = {
  ROLE_PATIENT: 'Patient',
  ROLE_DOCTOR: 'Doctor',
  ROLE_ADMIN: 'Admin',
};

const ROLE_BADGE_COLORS = {
  ROLE_PATIENT: 'bg-green-100 text-green-700',
  ROLE_DOCTOR: 'bg-blue-100 text-blue-700',
  ROLE_ADMIN: 'bg-purple-100 text-purple-700',
};

const NAV_LINKS = {
  ROLE_PATIENT: [
    { to: '/patient/dashboard', label: 'Dashboard' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/reviews', label: 'Reviews' },
  ],
  ROLE_DOCTOR: [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/slots', label: 'Slots' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/analytics', label: 'Analytics' },
  ],
  ROLE_ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const role = user?.role;
  const links = (role && NAV_LINKS[role]) || [];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          ClearCareAI
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/doctors"
              className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Find Doctors
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                ROLE_BADGE_COLORS[role] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {ROLE_LABELS[role] || role}
            </span>
            <span className="text-sm text-gray-700 hidden sm:block">{user.email}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
