import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { useApiMutation, useDoctorProfile, useDoctorSlots } from '../hooks/useApi';
import { formatTime } from '../utils/format';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import DoctorProfile from '../components/doctor/DoctorProfile';

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const titleCase = (day) => day.charAt(0) + day.slice(1).toLowerCase();

export default function SlotManagementPage() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useDoctorProfile();

  const doctorId = profile?.id;

  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
    error: slotsErrorObj,
    refetch: refetchSlots,
  } = useDoctorSlots(doctorId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { dayOfWeek: '', startTime: '', endTime: '' },
  });

  const createMutation = useApiMutation(
    (payload) => api.post('/slots', payload).then((r) => r.data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['slots', doctorId] });
        reset();
      },
    }
  );

  const deleteMutation = useApiMutation(
    (id) => api.delete(`/slots/${id}`).then((r) => r.data),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots', doctorId] }),
    }
  );

  const onSubmit = (values) => {
    createMutation.mutate({
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
    });
  };

  if (profileLoading) return <LoadingSpinner message="Loading your profile..." />;

  // A missing doctor profile (404) means the doctor hasn't set up yet — show the
  // profile form, matching the dashboard behaviour, before slots can be created.
  if (profileError && profileErrorObj?.response?.status === 404) {
    return (
      <div className="p-6 md:p-8">
        <DoctorProfile onSaved={refetchProfile} />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorMessage
          message={profileErrorObj?.response?.data?.message || profileErrorObj?.message}
          onRetry={refetchProfile}
        />
      </div>
    );
  }

  const createErrorMsg =
    createMutation.error?.response?.data?.message || createMutation.error?.message;
  const deleteErrorMsg =
    deleteMutation.error?.response?.data?.message || deleteMutation.error?.message;

  const slotList = slots ?? [];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Slots</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create weekly time slots patients can book. Each slot is 15–60 minutes.
        </p>
      </div>

      {/* Add slot form */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Add a Slot</h2>

        {createMutation.isError && (
          <div className="mt-3">
            <ErrorMessage message={createErrorMsg} />
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 grid gap-4 sm:grid-cols-4 sm:items-end"
        >
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('dayOfWeek', { required: 'Day is required' })}
            >
              <option value="">Select day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {titleCase(d)}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <p className="text-red-600 text-xs mt-1">{errors.dayOfWeek.message}</p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('startTime', { required: 'Start time is required' })}
            />
            {errors.startTime && (
              <p className="text-red-600 text-xs mt-1">{errors.startTime.message}</p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('endTime', { required: 'End time is required' })}
            />
            {errors.endTime && (
              <p className="text-red-600 text-xs mt-1">{errors.endTime.message}</p>
            )}
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Slot'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing slots grouped by day */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Your Slots</h2>

        {deleteMutation.isError && (
          <div className="mt-3">
            <ErrorMessage message={deleteErrorMsg} />
          </div>
        )}

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
              No slots yet. Add your first slot above.
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS.map((day) => {
                const daySlots = slotList
                  .filter((s) => s.dayOfWeek === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                if (daySlots.length === 0) return null;

                return (
                  <div key={day}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {titleCase(day)}
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="text-sm text-gray-800">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                          </span>
                          <button
                            onClick={() => deleteMutation.mutate(slot.id)}
                            disabled={deleteMutation.isPending}
                            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
