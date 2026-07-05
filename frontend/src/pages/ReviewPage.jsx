import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { useMyAppointments, useMyReviews } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ReviewForm from '../components/review/ReviewForm';
import ReviewList from '../components/review/ReviewList';

export default function ReviewPage() {
  const [page, setPage] = useState(0);

  // Completed appointments → their consultations are candidates for a text review.
  const completedAppointments = useMyAppointments({ status: 'COMPLETED', size: 100 });
  const appointments = completedAppointments.data?.content ?? [];

  // All of the patient's reviews, used to cross-check which consultations already
  // have a COMPLETED review (and to spot a PENDING voice review to convert).
  const allReviews = useMyReviews({ size: 100 });
  const reviewByConsultation = {};
  (allReviews.data?.content ?? []).forEach((r) => {
    reviewByConsultation[r.consultationId] = r;
  });

  // One consultation lookup per completed appointment (404 = not conducted → skipped).
  const consultationQueries = useQueries({
    queries: appointments.map((appt) => ({
      queryKey: ['consultation', 'appointment', appt.id],
      queryFn: () =>
        api.get(`/consultations/appointment/${appt.id}`).then((r) => r.data.data),
      enabled: !!appt.id,
      retry: (count, err) => err?.response?.status !== 404 && count < 1,
    })),
  });

  const eligibilityLoading =
    completedAppointments.isLoading ||
    allReviews.isLoading ||
    consultationQueries.some((q) => q.isLoading);

  // Eligible = COMPLETED consultation with no review, or a still-pending voice review.
  const eligible = consultationQueries
    .map((q) => q.data)
    .filter((c) => c && c.status === 'COMPLETED')
    .map((c) => {
      const review = reviewByConsultation[c.id];
      const pendingVoice =
        review && review.source === 'VOICE' && review.status === 'PENDING';
      const alreadyReviewed = review && !pendingVoice;
      return { consultation: c, pendingVoice, alreadyReviewed };
    })
    .filter((item) => !item.alreadyReviewed);

  // ── My Reviews list (paginated) ──
  const reviewsList = useMyReviews({ page, size: 10 });
  const listData = reviewsList.data;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-10">
      {/* Section 1: Write a Review */}
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share feedback on your completed consultations.
        </p>

        <div className="mt-6">
          {eligibilityLoading ? (
            <LoadingSpinner message="Finding consultations to review..." />
          ) : completedAppointments.isError ? (
            <ErrorMessage
              message={
                completedAppointments.error?.response?.data?.message ||
                completedAppointments.error?.message
              }
              onRetry={completedAppointments.refetch}
            />
          ) : eligible.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No consultations are waiting for a review right now.
            </div>
          ) : (
            <div className="space-y-4">
              {eligible.map(({ consultation, pendingVoice }) => (
                <ReviewForm
                  key={consultation.id}
                  consultation={consultation}
                  pendingVoice={pendingVoice}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: My Reviews */}
      <section>
        <h2 className="text-xl font-bold text-gray-900">My Reviews</h2>
        <div className="mt-4">
          <ReviewList
            reviews={listData?.content ?? []}
            isLoading={reviewsList.isLoading}
            isError={reviewsList.isError}
            error={reviewsList.error}
            onRetry={reviewsList.refetch}
            page={listData?.page ?? 0}
            totalPages={listData?.totalPages ?? 1}
            onPageChange={setPage}
            emptyText="You haven't written any reviews yet."
          />
        </div>
      </section>
    </div>
  );
}
