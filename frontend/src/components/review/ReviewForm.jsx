import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useApiMutation } from '../../hooks/useApi';
import ErrorMessage from '../common/ErrorMessage';

// Text-review form for one completed consultation. `pendingVoice` shows a hint that
// submitting converts a scheduled voice review. `consultation` needs id + doctorName.
export default function ReviewForm({ consultation, pendingVoice = false, onSuccess }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState('');

  const mutation = useApiMutation(
    (payload) => api.post('/reviews', payload).then((r) => r.data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['myReviews'] });
        if (onSuccess) onSuccess();
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1) {
      setValidationError('Please select a rating.');
      return;
    }
    if (text.trim().length < 10) {
      setValidationError('Review must be at least 10 characters.');
      return;
    }
    setValidationError('');
    mutation.mutate({
      consultationId: consultation.id,
      rating,
      rawTranscript: text.trim(),
    });
  };

  const errorMsg = mutation.error?.response?.data?.message || mutation.error?.message;
  const activeStars = hovered || rating;

  if (mutation.isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900">{consultation.doctorName}</h3>
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Thanks! Your review was submitted.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900">{consultation.doctorName}</h3>

      {pendingVoice && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">
          A voice review call is scheduled — you can also review by text now.
        </div>
      )}

      {(validationError || mutation.isError) && (
        <div className="mt-3">
          <ErrorMessage message={validationError || errorMsg} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                className={`text-2xl leading-none transition-colors ${
                  star <= activeStars ? 'text-amber-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your review</label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience with this doctor (at least 10 characters)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {mutation.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
