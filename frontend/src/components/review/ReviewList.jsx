import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import ReviewCard from './ReviewCard';

// Reusable, presentational list of ReviewCards with pagination. The parent owns the
// query and passes data in, so it works for both patient and doctor review lists.
export default function ReviewList({
  reviews = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  page = 0,
  totalPages = 1,
  onPageChange,
  showPatient = false,
  renderActions,
  emptyText = 'No reviews yet.',
}) {
  if (isLoading) return <LoadingSpinner message="Loading reviews..." />;

  if (isError) {
    return (
      <ErrorMessage
        message={error?.response?.data?.message || error?.message}
        onRetry={onRetry}
      />
    );
  }

  if (reviews.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">{emptyText}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showPatient={showPatient}
            actions={renderActions ? renderActions(review) : null}
          />
        ))}
      </div>
      {onPageChange && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}
