import { Link } from 'react-router-dom';
import { usePatientProfile, useMyAppointments, useMyReviews } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import PatientProfile from './PatientProfile';

function Stars({ rating }) {
  const r = rating || 0;
  return (
    <span className="text-amber-400 text-sm" aria-label={`${r} out of 5`}>
      {'★'.repeat(r)}
      <span className="text-gray-300">{'★'.repeat(5 - r)}</span>
    </span>
  );
}

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

export default function PatientDashboard() {
  const profileQuery = usePatientProfile();
  const is404 = profileQuery.error?.response?.status === 404;

  const appointmentsQuery = useMyAppointments({ status: 'BOOKED', page: 0, size: 3 });
  const reviewsQuery = useMyReviews({ page: 0, size: 3 });

  if (profileQuery.isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // No profile yet → show the creation form (per spec).
  if (is404) {
    return (
      <div className="p-6 md:p-8">
        <PatientProfile onSaved={() => profileQuery.refetch()} />
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
  const reviews = reviewsQuery.data?.content ?? [];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {profile?.firstName || 'Patient'}!
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Here is a quick overview of your care.
      </p>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link
          to="/doctors"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Book Appointment
        </Link>
        <Link
          to="/appointments"
          className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View All Appointments
        </Link>
        <Link
          to="/reviews"
          className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View My Reviews
        </Link>
      </div>

      <div className="grid gap-5 mt-6 md:grid-cols-2">
        {/* Upcoming appointments */}
        <Card title="Upcoming Appointments">
          {appointmentsQuery.isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : appointmentsQuery.isError ? (
            <ErrorMessage
              message="Could not load appointments."
              onRetry={() => appointmentsQuery.refetch()}
            />
          ) : appointments.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No upcoming appointments.{' '}
              <Link to="/doctors" className="text-blue-600 hover:underline">
                Book your first appointment!
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {appointments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dr. {a.doctorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.appointmentDate} · {a.startTime}–{a.endTime}
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
          {reviewsQuery.isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : reviewsQuery.isError ? (
            <ErrorMessage
              message="Could not load reviews."
              onRetry={() => reviewsQuery.refetch()}
            />
          ) : reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No reviews yet. Reviews appear after your consultations are completed.
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      Dr. {rev.doctorName}
                    </p>
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
