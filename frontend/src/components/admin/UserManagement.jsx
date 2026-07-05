import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation, useAdminUsers } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';

const ROLE_FILTERS = [
  { label: 'All roles', value: '' },
  { label: 'Patients', value: 'ROLE_PATIENT' },
  { label: 'Doctors', value: 'ROLE_DOCTOR' },
  { label: 'Admins', value: 'ROLE_ADMIN' },
];

const ROLE_LABEL = {
  ROLE_PATIENT: 'Patient',
  ROLE_DOCTOR: 'Doctor',
  ROLE_ADMIN: 'Admin',
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);

  const params = { page, size: 10 };
  if (role) params.role = role;

  const { data, isLoading, isError, error, refetch } = useAdminUsers(params);

  const toggleMutation = useApiMutation(
    (id) => api.put(`/admin/users/${id}/toggle-active`).then((r) => r.data.data),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }) }
  );

  const users = data?.content ?? [];
  const toggleErrorMsg =
    toggleMutation.error?.response?.data?.message || toggleMutation.error?.message;

  const handleFilter = (value) => {
    setRole(value);
    setPage(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">User Management</h2>
        <select
          value={role}
          onChange={(e) => handleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {ROLE_FILTERS.map((f) => (
            <option key={f.value || 'all'} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {toggleMutation.isError && (
        <div className="p-4">
          <ErrorMessage message={toggleErrorMsg} />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Loading users..." />
      ) : isError ? (
        <div className="p-4">
          <ErrorMessage
            message={error?.response?.data?.message || error?.message}
            onRetry={refetch}
          />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const busy = toggleMutation.isPending && toggleMutation.variables === u.id;
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800 whitespace-nowrap">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          u.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleMutation.mutate(u.id)}
                        disabled={busy}
                        className={`text-xs font-medium rounded px-3 py-1 border disabled:opacity-50 whitespace-nowrap ${
                          u.isActive
                            ? 'text-red-700 border-red-200 hover:bg-red-50'
                            : 'text-green-700 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
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
