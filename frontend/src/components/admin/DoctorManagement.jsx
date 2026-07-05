import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation, useAdminDoctors } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import Stars from '../common/Stars';

export default function DoctorManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, refetch } = useAdminDoctors({ page, size: 10 });

  // There is no availability-toggle endpoint — deactivating the doctor's USER account
  // is the admin control, so we toggle by userId (not the doctor id).
  const toggleMutation = useApiMutation(
    (userId) => api.put(`/admin/users/${userId}/toggle-active`).then((r) => r.data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      },
    }
  );

  const doctors = data?.content ?? [];
  const toggleErrorMsg =
    toggleMutation.error?.response?.data?.message || toggleMutation.error?.message;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Doctor Management</h2>
      </div>

      {toggleMutation.isError && (
        <div className="p-4">
          <ErrorMessage message={toggleErrorMsg} />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Loading doctors..." />
      ) : isError ? (
        <div className="p-4">
          <ErrorMessage
            message={error?.response?.data?.message || error?.message}
            onRetry={refetch}
          />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No doctors found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Specialization</th>
                <th className="px-5 py-2.5 font-medium">Experience</th>
                <th className="px-5 py-2.5 font-medium">Fee</th>
                <th className="px-5 py-2.5 font-medium">Rating</th>
                <th className="px-5 py-2.5 font-medium">Availability</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map((d) => {
                const busy = toggleMutation.isPending && toggleMutation.variables === d.userId;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800 whitespace-nowrap">
                      Dr. {d.firstName} {d.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {d.specialization}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {d.experienceYears} yrs
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      ₹{d.consultationFee}
                    </td>
                    <td className="px-5 py-3">
                      {d.totalReviews > 0 ? (
                        <Stars rating={d.averageRating} showValue />
                      ) : (
                        <span className="text-gray-400 text-xs">No ratings</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          d.isAvailable
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {d.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleMutation.mutate(d.userId)}
                        disabled={busy}
                        className={`text-xs font-medium rounded px-3 py-1 border disabled:opacity-50 whitespace-nowrap ${
                          d.isAvailable
                            ? 'text-red-700 border-red-200 hover:bg-red-50'
                            : 'text-green-700 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {d.isAvailable ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="p-4">
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
