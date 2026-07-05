import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useApiMutation, useDoctor, useAvailableSlots } from '../hooks/useApi';
import { formatTime, formatDate } from '../utils/format';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Earliest bookable date is tomorrow — appointments must be for a future date.
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const {
    data: doctor,
    isLoading: doctorLoading,
    isError: doctorError,
    error: doctorErrorObj,
    refetch: refetchDoctor,
  } = useDoctor(doctorId);

  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
    error: slotsErrorObj,
    refetch: refetchSlots,
  } = useAvailableSlots(doctorId, date);

  const bookMutation = useApiMutation(
    (payload) => api.post('/appointments', payload).then((r) => r.data.data),
    {
      onSuccess: () => {
        navigate('/appointments', {
          state: { success: 'Appointment booked successfully.' },
        });
      },
    }
  );

  const doctorName = doctor
    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
    : 'the doctor';

  const confirmBooking = () => {
    bookMutation.mutate({
      doctorId: Number(doctorId),
      slotId: selectedSlot.id,
      appointmentDate: date,
    });
  };

  if (doctorLoading) return <LoadingSpinner message="Loading doctor..." />;

  if (doctorError) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <ErrorMessage
          message={doctorErrorObj?.response?.data?.message || doctorErrorObj?.message}
          onRetry={refetchDoctor}
        />
      </div>
    );
  }

  const slotList = slots ?? [];
  const bookErrorMsg =
    bookMutation.error?.response?.data?.message || bookMutation.error?.message;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Doctor header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{doctorName}</h1>
        <p className="text-sm text-blue-600 mt-0.5">{doctor.specialization}</p>
      </div>

      {/* Date picker */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select a date
        </label>
        <input
          type="date"
          min={tomorrowStr()}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot(null);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Available slots */}
      {date && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Available slots</h2>
          <div className="mt-4">
            {slotsLoading ? (
              <LoadingSpinner message="Loading slots..." />
            ) : slotsError ? (
              <ErrorMessage
                message={slotsErrorObj?.response?.data?.message || slotsErrorObj?.message}
                onRetry={refetchSlots}
              />
            ) : slotList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No available slots for this date. Try another day.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {slotList.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirm booking</h3>
            <p className="text-sm text-gray-600 mt-2">
              Book appointment with {doctorName} on{' '}
              <span className="font-medium">{formatDate(date)}</span> at{' '}
              <span className="font-medium">{formatTime(selectedSlot.startTime)}</span>?
            </p>

            {bookMutation.isError && (
              <div className="mt-3">
                <ErrorMessage message={bookErrorMsg} />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSlot(null)}
                disabled={bookMutation.isPending}
                className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={bookMutation.isPending}
                className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {bookMutation.isPending ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
