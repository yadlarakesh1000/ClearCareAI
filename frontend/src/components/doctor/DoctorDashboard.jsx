import { Link } from 'react-router-dom';
import {
  useDoctorProfile,
  useDoctorAppointments,
  useDoctorAnalytics,
} from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Stars from '../common/Stars';
import DoctorProfile from './DoctorProfile';

const STATUS_STYLES = {
  BOOKED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function DoctorDashboard() {
  const profileQuery = useDoctorProfile();
  const is404 = profileQuery.error?.response?.status === 404;

  const doctorId = profileQuery.data?.id;
  const today = todayIso();

  const appointmentsQuery = useDoctorAppointments({ date: today, page: 0, size: 10 });
  const analyticsQuery = useDoctorAnalytics(doctorId);

  if (profileQuery.isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // No profile yet → show the creation form (per spec).
  if (is404) {
    return (
      <div className="p-6 md:p-8">
        <DoctorProfile onSaved={() => profileQuery.refetch()} />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorMessage
          message={profileQuery.error?.response?.data?.message || profileQuery.error?.message}
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  const profile = profileQuery.data;
  const appointments = appointmentsQuery.data?.content ?? [];
  const analytics = analyticsQuery.data;
  const recentReviews = (analytics?.recentReviews ?? []).slice(0, 3);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, Dr. {profile?.lastName || ''}!
      </h1>
      <p className="text-gray-500 text-sm mt-1">Here is your practice at a glance.</p>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link
          to="/doctor/slots"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Manage Slots
        </Link>
        <Link
          to="/doctor/appointments"
          className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          All Appointments
        </Link>
        <Link
          to="/doctor/analytics"
          className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Analytics
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 mt-6 sm:grid-cols-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500">Total Appointments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {analyticsQuery.isLoading ? '—' : analytics?.totalAppointments ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500">Average Rating</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {analyticsQuery.isLoading ? '—' : (analytics?.averageRating ?? 0).toFixed(1)}
            </span>
            {!analyticsQuery.isLoading && <Stars rating={analytics?.averageRating} />}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {analyticsQuery.isLoading ? '—' : analytics?.totalReviews ?? 0}
          </p>
        </div>
      </div>

      <div className="grid gap-5 mt-6 md:grid-cols-2">
        {/* Today's appointments */}
        <Card title="Today's Appointments">
          {appointmentsQuery.isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : appointmentsQuery.isError ? (
            <ErrorMessage
              message="Could not load appointments."
              onRetry={() => appointmentsQuery.refetch()}
            />
          ) : appointments.length === 0 ? (
            <p className="text-gray-400 text-sm">No appointments scheduled for today.</p>
          ) : (
            <ul className="space-y-3">
              {appointments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.patientName}</p>
                    <p className="text-xs text-gray-500">
                      {a.startTime}–{a.endTime}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent reviews */}
        <Card title="Recent Reviews">
          {analyticsQuery.isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : analyticsQuery.isError ? (
            <ErrorMessage
              message="Could not load reviews."
              onRetry={() => analyticsQuery.refetch()}
            />
          ) : recentReviews.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No reviews yet. Reviews appear after your consultations are completed.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentReviews.map((rev) => (
                <li
                  key={rev.id}
                  className="border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{rev.patientName}</p>
                    <Stars rating={rev.rating} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {rev.summary || rev.rawTranscript || (
                      <span className="italic">
                        {rev.status === 'PENDING'
                          ? 'Awaiting voice review call'
                          : 'No summary available'}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
