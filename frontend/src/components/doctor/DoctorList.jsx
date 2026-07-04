import { useState } from 'react';
import { useDoctors } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import DoctorCard from './DoctorCard';

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

export default function DoctorList() {
  const [specialization, setSpecialization] = useState('');
  const [page, setPage] = useState(0);

  const params = { page, size: 9 };
  if (specialization) params.specialization = specialization;

  const { data, isLoading, isError, error, refetch } = useDoctors(params);

  const doctors = data?.content ?? [];

  const handleFilterChange = (value) => {
    setSpecialization(value);
    setPage(0);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse specialists and book an appointment.
          </p>
        </div>
        <div>
          <label className="sr-only">Filter by specialization</label>
          <select
            value={specialization}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">All specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <LoadingSpinner message="Loading doctors..." />
        ) : isError ? (
          <ErrorMessage
            message={error?.response?.data?.message || error?.message}
            onRetry={refetch}
          />
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No doctors found
            {specialization ? ` for "${specialization}".` : '.'} Try a different filter.
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
