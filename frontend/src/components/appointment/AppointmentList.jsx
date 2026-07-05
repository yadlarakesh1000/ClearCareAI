import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMyAppointments, useDoctorAppointments } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import AppointmentCard from './AppointmentCard';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Booked', value: 'BOOKED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function AppointmentList() {
  const { role } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.success;

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const isDoctor = role === 'ROLE_DOCTOR';

  const params = { page, size: 10 };
  if (status) params.status = status;

  // Only the query matching the current role runs; the other stays disabled so we
  // don't fire a request the role isn't authorized for.
  const patientQuery = useMyAppointments(params, { enabled: !isDoctor });
  const doctorQuery = useDoctorAppointments(params, { enabled: isDoctor });

  const query = isDoctor ? doctorQuery : patientQuery;
  const { data, isLoading, isError, error, refetch } = query;

  const appointments = data?.content ?? [];

  const handleFilterChange = (value) => {
    setStatus(value);
    setPage(0);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isDoctor
            ? 'Appointments booked with you. Start a consultation when the patient arrives.'
            : 'Your booked, completed and cancelled appointments.'}
        </p>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mt-6 flex gap-2 border-b border-gray-200">
        {FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              status === f.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <LoadingSpinner message="Loading appointments..." />
        ) : isError ? (
          <ErrorMessage
            message={error?.response?.data?.message || error?.message}
            onRetry={refetch}
          />
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No {status ? status.toLowerCase() : ''} appointments
            {isDoctor ? ' yet.' : ' yet. Book your first appointment!'}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  role={role}
                />
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
