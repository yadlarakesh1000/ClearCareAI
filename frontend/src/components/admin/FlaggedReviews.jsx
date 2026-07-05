import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation, useFlaggedReviews } from '../../hooks/useApi';
import { formatDateTime } from '../../utils/format';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import Stars from '../common/Stars';

// Flagged-review queue for admins. Keep (unflag) or Delete (with confirmation).
// `standalone` renders its own page heading; embedded in the dashboard it does not.
export default function FlaggedReviews({ standalone = false }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null); // review pending delete confirmation

  const { data, isLoading, isError, error, refetch } = useFlaggedReviews({ page, size: 10 });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['flaggedReviews'] });
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
  };

  const keepMutation = useApiMutation(
    (id) => api.put(`/admin/reviews/${id}/unflag`).then((r) => r.data.data),
    { onSuccess: invalidate }
  );

  const deleteMutation = useApiMutation(
    (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),
    {
      onSuccess: () => {
        invalidate();
        setConfirmDelete(null);
      },
    }
  );

  const reviews = data?.content ?? [];
  const actionErrorMsg =
    keepMutation.error?.response?.data?.message ||
    keepMutation.error?.message ||
    deleteMutation.error?.response?.data?.message ||
    deleteMutation.error?.message;

  return (
    <div className={standalone ? 'p-6 md:p-8 max-w-5xl mx-auto' : ''}>
      {standalone && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Flagged Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">
            Reviews flagged by doctors, awaiting your decision.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-red-50 border-b border-red-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-red-700">
            Flagged Reviews{data ? ` (${data.totalElements})` : ''}
          </h2>
        </div>

        {(keepMutation.isError || deleteMutation.isError) && (
          <div className="p-4">
            <ErrorMessage message={actionErrorMsg} />
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading flagged reviews..." />
        ) : isError ? (
          <div className="p-4">
            <ErrorMessage
              message={error?.response?.data?.message || error?.message}
              onRetry={refetch}
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No flagged reviews. All clear.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-2.5 font-medium">Patient</th>
                  <th className="px-5 py-2.5 font-medium">Doctor</th>
                  <th className="px-5 py-2.5 font-medium">Review</th>
                  <th className="px-5 py-2.5 font-medium">Rating</th>
                  <th className="px-5 py-2.5 font-medium">Flag Reason</th>
                  <th className="px-5 py-2.5 font-medium">Flagged</th>
                  <th className="px-5 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((rev) => {
                  const text = rev.cleanedReview || rev.rawTranscript || rev.summary || '—';
                  const busy =
                    (keepMutation.isPending && keepMutation.variables === rev.id) ||
                    (deleteMutation.isPending && deleteMutation.variables === rev.id);
                  return (
                    <tr key={rev.id} className="hover:bg-gray-50 align-top">
                      <td className="px-5 py-3 text-gray-800 whitespace-nowrap">
                        {rev.patientName}
                      </td>
                      <td className="px-5 py-3 text-gray-800 whitespace-nowrap">
                        {rev.doctorName}
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs">
                        <span className="line-clamp-2">{text}</span>
                      </td>
                      <td className="px-5 py-3">
                        {rev.rating ? <Stars rating={rev.rating} /> : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs">
                        <span className="line-clamp-2">{rev.flagReason}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {formatDateTime(rev.flaggedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => keepMutation.mutate(rev.id)}
                            disabled={busy}
                            className="text-xs font-medium text-green-700 border border-green-200 rounded px-3 py-1 hover:bg-green-50 disabled:opacity-50 whitespace-nowrap"
                          >
                            Keep Review
                          </button>
                          <button
                            onClick={() => setConfirmDelete(rev)}
                            disabled={busy}
                            className="text-xs font-medium text-red-700 border border-red-200 rounded px-3 py-1 hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
                          >
                            Delete Review
                          </button>
                        </div>
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

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete review?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This permanently removes the flagged review from {confirmDelete.patientName} for{' '}
              {confirmDelete.doctorName}. This cannot be undone.
            </p>

            {deleteMutation.isError && (
              <div className="mt-3">
                <ErrorMessage
                  message={
                    deleteMutation.error?.response?.data?.message || deleteMutation.error?.message
                  }
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleteMutation.isPending}
                className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
