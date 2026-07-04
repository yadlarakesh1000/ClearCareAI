import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DASHBOARD_BY_ROLE = {
  ROLE_PATIENT: '/patient/dashboard',
  ROLE_DOCTOR: '/doctor/dashboard',
};

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'ROLE_PATIENT' } });

  const password = watch('password');

  async function onSubmit(values) {
    setServerError('');
    try {
      const role = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
      });
      navigate(DASHBOARD_BY_ROLE[role] || '/');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(message);
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-300' : 'border-gray-300'
    }`;

  const selectedRole = watch('role');

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">ClearCareAI</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {serverError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'ROLE_PATIENT', label: 'Patient' },
                  { value: 'ROLE_DOCTOR', label: 'Doctor' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                      selectedRole === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="sr-only"
                      {...register('role', { required: 'Please select a role' })}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  className={inputClass(errors.firstName)}
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  className={inputClass(errors.lastName)}
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                className={inputClass(errors.phone)}
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Phone number must be exactly 10 digits',
                  },
                })}
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClass(errors.password)}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message:
                      'Must contain an uppercase letter, a lowercase letter, and a digit',
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClass(errors.confirmPassword)}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
