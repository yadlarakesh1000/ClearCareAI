import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation } from '../../hooks/useApi';
import ErrorMessage from '../common/ErrorMessage';

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Medicine',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

// `existing` (optional) pre-fills the form and switches submit from POST to PUT.
export default function DoctorProfile({ existing = null, onSaved }) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      specialization: existing?.specialization ?? '',
      qualification: existing?.qualification ?? '',
      experienceYears: existing?.experienceYears ?? '',
      consultationFee: existing?.consultationFee ?? '',
      bio: existing?.bio ?? '',
    },
  });

  const mutation = useApiMutation(
    (payload) =>
      isEdit
        ? api.put('/doctors/profile', payload).then((r) => r.data.data)
        : api.post('/doctors/profile', payload).then((r) => r.data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
        if (onSaved) onSaved();
      },
    }
  );

  const onSubmit = (values) => {
    mutation.mutate({
      specialization: values.specialization,
      qualification: values.qualification,
      experienceYears: Number(values.experienceYears),
      consultationFee: Number(values.consultationFee),
      bio: values.bio || null,
    });
  };

  const errorMsg = mutation.error?.response?.data?.message || mutation.error?.message;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Your Profile' : 'Complete Your Doctor Profile'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit
            ? 'Update your professional details.'
            : 'We need a few details before patients can find and book you.'}
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
              Specialization <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('specialization', { required: 'Specialization is required' })}
            >
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.specialization && (
              <p className="text-red-600 text-xs mt-1">{errors.specialization.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MBBS, MD Cardiology"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              {...register('qualification', { required: 'Qualification is required' })}
            />
            {errors.qualification && (
              <p className="text-red-600 text-xs mt-1">{errors.qualification.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="8"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                {...register('experienceYears', {
                  required: 'Experience is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />
              {errors.experienceYears && (
                <p className="text-red-600 text-xs mt-1">{errors.experienceYears.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                {...register('consultationFee', {
                  required: 'Consultation fee is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />
              {errors.consultationFee && (
                <p className="text-red-600 text-xs mt-1">{errors.consultationFee.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              placeholder="A short description of your practice and areas of focus (optional)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              {...register('bio')}
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
