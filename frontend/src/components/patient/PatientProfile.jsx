import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation } from '../../hooks/useApi';
import ErrorMessage from '../common/ErrorMessage';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

// `existing` (optional) pre-fills the form and switches submit from POST to PUT.
export default function PatientProfile({ existing = null, onSaved }) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dateOfBirth: existing?.dateOfBirth ?? '',
      gender: existing?.gender ?? '',
      bloodGroup: existing?.bloodGroup ?? '',
      address: existing?.address ?? '',
      medicalHistory: existing?.medicalHistory ?? '',
    },
  });

  const mutation = useApiMutation(
    (payload) =>
      isEdit
        ? api.put('/patients/profile', payload).then((r) => r.data.data)
        : api.post('/patients/profile', payload).then((r) => r.data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
        if (onSaved) onSaved();
      },
    }
  );

  const onSubmit = (values) => {
    // Send optional blanks as null so the backend stores them cleanly.
    mutation.mutate({
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      bloodGroup: values.bloodGroup || null,
      address: values.address || null,
      medicalHistory: values.medicalHistory || null,
    });
  };

  const errorMsg =
    mutation.error?.response?.data?.message || mutation.error?.message;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Your Profile' : 'Complete Your Patient Profile'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit
            ? 'Update your personal and medical details.'
            : 'We need a few details before you can book appointments.'}
        </p>

        {mutation.isError && <ErrorMessage message={errorMsg} />}
        {mutation.isSuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Profile saved successfully.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
            />
            {errors.dateOfBirth && (
              <p className="text-red-600 text-xs mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="text-red-600 text-xs mt-1">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('bloodGroup')}
            >
              <option value="">Select blood group (optional)</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              placeholder="Street, city, state"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              {...register('address')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical History
            </label>
            <textarea
              rows={3}
              placeholder="Allergies, chronic conditions, past surgeries (optional)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              {...register('medicalHistory')}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
