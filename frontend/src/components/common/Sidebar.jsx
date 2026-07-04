import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SIDEBAR_LINKS = {
  ROLE_PATIENT: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/doctors', label: 'Doctors', icon: '🩺' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/reviews', label: 'Reviews', icon: '⭐' },
  ],
  ROLE_DOCTOR: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/doctor/slots', label: 'Slots', icon: '🕐' },
    { to: '/doctor/appointments', label: 'Appointments', icon: '📅' },
    { to: '/doctor/analytics', label: 'Analytics', icon: '📊' },
  ],
  ROLE_ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/admin/dashboard#users', label: 'Users', icon: '👥' },
    { to: '/admin/dashboard#doctors', label: 'Doctors', icon: '🩺' },
    { to: '/admin/dashboard#appointments', label: 'Appointments', icon: '📅' },
    { to: '/admin/dashboard#reviews', label: 'Reviews', icon: '⭐' },
  ],
};

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;
  const links = (role && SIDEBAR_LINKS[role]) || [];

  return (
    <aside className="w-56 min-h-screen bg-gray-50 border-r border-gray-200 pt-6 hidden md:block">
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
