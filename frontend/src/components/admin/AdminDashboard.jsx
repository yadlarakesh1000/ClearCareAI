import { useAdminDashboard } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import StatCard from '../common/StatCard';
import FlaggedReviews from './FlaggedReviews';
import UserManagement from './UserManagement';
import DoctorManagement from './DoctorManagement';

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and moderation.</p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : isError ? (
        <ErrorMessage
          message={error?.response?.data?.message || error?.message}
          onRetry={refetch}
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Users" value={data.totalUsers} color="blue" />
          <StatCard label="Total Doctors" value={data.totalDoctors} color="indigo" />
          <StatCard label="Total Patients" value={data.totalPatients} color="green" />
          <StatCard label="Total Appointments" value={data.totalAppointments} color="purple" />
          <StatCard label="Total Reviews" value={data.totalReviews} color="amber" />
          <StatCard label="Flagged Reviews" value={data.totalFlaggedReviews} color="red" />
        </div>
      )}

      {/* Flagged reviews (prominent) */}
      <section>
        <FlaggedReviews />
      </section>

      {/* User management */}
      <section>
        <UserManagement />
      </section>

      {/* Doctor management */}
      <section>
        <DoctorManagement />
      </section>
    </div>
  );
}
