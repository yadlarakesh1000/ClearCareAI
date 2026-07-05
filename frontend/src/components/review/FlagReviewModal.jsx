import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation } from '../../hooks/useApi';
import ErrorMessage from '../common/ErrorMessage';

// Modal for a doctor to flag one of their reviews for admin review.
// `reviewId` is required; `onClose` dismisses; `onFlagged` fires after success.
export default function FlagReviewModal({ reviewId, onClose, onFlagged }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const mutation = useApiMutation(
    (payload) => api.put(`/reviews/${reviewId}/flag`, payload).then((r) => r.data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['doctorReviews'] });
        queryClient.invalidateQueries({ queryKey: ['flaggedReviews'] });
        if (onFlagged) onFlagged();
        onClose();
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim().length === 0) {
      setValidationError('A flag reason is required.');
      return;
    }
    setValidationError('');
    mutation.mutate({ flagReason: reason.trim() });
  };

  const errorMsg = mutation.error?.response?.data?.message || mutation.error?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900">Flag Review</h3>
        <p className="text-sm text-gray-600 mt-1">
          Explain why this review should be reviewed by an admin.
        </p>

        {(validationError || mutation.isError) && (
          <div className="mt-3">
            <ErrorMessage message={validationError || errorMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. This review contains unrelated content and appears to be spam."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          />

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
