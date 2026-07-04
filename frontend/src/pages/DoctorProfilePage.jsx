import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDoctor, useDoctorReviews } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import Stars from '../components/common/Stars';

const SENTIMENT_STYLES = {
  POSITIVE: 'bg-green-50 text-green-700',
  NEUTRAL: 'bg-gray-100 text-gray-600',
  NEGATIVE: 'bg-red-50 text-red-700',
};

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewPage, setReviewPage] = useState(0);

  const doctorQuery = useDoctor(id);
  const reviewsQuery = useDoctorReviews(id, { page: reviewPage, size: 5 });

  if (doctorQuery.isLoading) {
    return <LoadingSpinner message="Loading doctor..." />;
  }

  if (doctorQuery.isError) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <ErrorMessage
          message={doctorQuery.error?.response?.data?.message || 'Doctor not found.'}
          onRetry={() => doctorQuery.refetch()}
        />
      </div>
    );
  }

  const doctor = doctorQuery.data;
  const reviews = reviewsQuery.data?.content ?? [];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Doctor details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <p className="text-blue-600 font-medium mt-0.5">{doctor.specialization}</p>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={doctor.averageRating} showValue />
              <span className="text-xs text-gray-400">
                ({doctor.totalReviews ?? 0} reviews)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/book-appointment/${doctor.id}`)}
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors self-start"
          >
            Book Appointment
          </button>
        </div>

        <dl className="grid gap-4 mt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Qualification</dt>
            <dd className="text-sm text-gray-900 mt-0.5">{doctor.qualification}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Experience</dt>
            <dd className="text-sm text-gray-900 mt-0.5">{doctor.experienceYears} years</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Consultation Fee</dt>
            <dd className="text-sm text-gray-900 mt-0.5">₹{doctor.consultationFee}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Availability</dt>
            <dd className="text-sm mt-0.5">
              {doctor.isAvailable ? (
                <span className="text-green-700">Accepting appointments</span>
              ) : (
                <span className="text-gray-500">Not available</span>
              )}
            </dd>
          </div>
        </dl>

        {doctor.bio && (
          <div className="mt-6">
            <dt className="text-xs text-gray-500">About</dt>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{doctor.bio}</p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Patient Reviews</h2>

        {reviewsQuery.isLoading ? (
          <LoadingSpinner message="Loading reviews..." />
        ) : reviewsQuery.isError ? (
          <ErrorMessage
            message="Could not load reviews."
            onRetry={() => reviewsQuery.refetch()}
          />
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            No reviews yet for this doctor.
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{rev.patientName}</p>
                    <div className="flex items-center gap-2">
                      {rev.sentiment && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            SENTIMENT_STYLES[rev.sentiment] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rev.sentiment}
                        </span>
                      )}
                      <Stars rating={rev.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {rev.cleanedReview || rev.summary || rev.rawTranscript || (
                      <span className="italic text-gray-400">No review text.</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
            <Pagination
              page={reviewsQuery.data.page}
              totalPages={reviewsQuery.data.totalPages}
              onPageChange={setReviewPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
