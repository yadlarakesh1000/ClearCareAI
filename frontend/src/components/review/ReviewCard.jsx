import Stars from '../common/Stars';

const SENTIMENT_STYLES = {
  POSITIVE: 'bg-green-50 text-green-700',
  NEUTRAL: 'bg-yellow-50 text-yellow-700',
  NEGATIVE: 'bg-red-50 text-red-700',
};

const STATUS_STYLES = {
  COMPLETED: 'bg-blue-50 text-blue-700',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
};

// Read-only review card. `actions` (optional) renders extra controls (e.g. a
// doctor's Flag button) in the header — completed reviews are never editable.
export default function ReviewCard({ review, showPatient = false, actions = null }) {
  const isCompleted = review.status === 'COMPLETED';
  const isVoicePending = review.status === 'PENDING' && review.source === 'VOICE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {showPatient ? review.patientName : review.doctorName}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            {review.rating ? (
              <Stars rating={review.rating} />
            ) : (
              <span className="text-xs text-gray-400">No rating</span>
            )}
            <span className="text-xs text-gray-400">{review.source}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.isFlagged && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-50 text-orange-700">
              Flagged
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              STATUS_STYLES[review.status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {review.status}
          </span>
          {actions}
        </div>
      </div>

      {/* Voice review still awaiting the call */}
      {isVoicePending && (
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Awaiting voice review call
        </div>
      )}

      {/* Completed voice review — Gemini-processed content */}
      {isCompleted && review.source === 'VOICE' && (
        <div className="mt-4 space-y-3">
          {review.cleanedReview && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {review.cleanedReview}
            </p>
          )}
          {review.summary && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Summary
              </h4>
              <p className="text-sm text-gray-600 mt-1">{review.summary}</p>
            </div>
          )}
          {review.sentiment && (
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                SENTIMENT_STYLES[review.sentiment] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {review.sentiment}
            </span>
          )}
        </div>
      )}

      {/* Completed text review — patient's own words (no summary/sentiment) */}
      {isCompleted && review.source === 'TEXT' && review.rawTranscript && (
        <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
          {review.rawTranscript}
        </p>
      )}
    </div>
  );
}
