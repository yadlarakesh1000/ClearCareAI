import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation } from '../../hooks/useApi';
import { formatDate, formatTime } from '../../utils/format';

const STATUS_STYLES = {
  BOOKED: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

// `role` decides which action (if any) shows on a BOOKED appointment:
//   patient → Cancel, doctor → Start Consultation.
export default function AppointmentCard({ appointment, role }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const cancelMutation = useApiMutation(
    (id) => api.put(`/appointments/${id}/cancel`).then((r) => r.data.data),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myAppointments'] }),
    }
  );

  const isPatient = role === 'ROLE_PATIENT';
  const isDoctor = role === 'ROLE_DOCTOR';
  const isBooked = appointment.status === 'BOOKED';

  const personLabel = isPatient
    ? appointment.doctorName
    : appointment.patientName;
  const personSubtitle = isPatient ? appointment.specialization : 'Patient';

  const cancelErrorMsg =
    cancelMutation.error?.response?.data?.message || cancelMutation.error?.message;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{personLabel}</h3>
          {personSubtitle && (
            <p className="text-sm text-blue-600 mt-0.5">{personSubtitle}</p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            STATUS_STYLES[appointment.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <span>{formatDate(appointment.appointmentDate)}</span>
        <span className="text-gray-300">•</span>
        <span>
          {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
        </span>
      </div>

      {cancelMutation.isError && (
        <p className="text-red-600 text-xs mt-3">{cancelErrorMsg}</p>
      )}

      {isBooked && (isPatient || isDoctor) && (
        <div className="mt-4 flex justify-end">
          {isPatient && (
            <button
              onClick={() => cancelMutation.mutate(appointment.id)}
              disabled={cancelMutation.isPending}
              className="text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-4 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
          {isDoctor && (
            <button
              onClick={() => navigate(`/doctor/consultation/${appointment.id}`)}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-1.5 transition-colors"
            >
              Start Consultation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
