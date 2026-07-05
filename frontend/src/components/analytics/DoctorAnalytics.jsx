import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDoctorProfile, useDoctorAnalytics } from '../../hooks/useApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import StatCard from '../common/StatCard';
import Stars from '../common/Stars';
import DoctorProfile from '../doctor/DoctorProfile';
import FlagReviewModal from '../review/FlagReviewModal';

const SENTIMENT_COLORS = { positive: '#16a34a', neutral: '#eab308', negative: '#dc2626' };
const SENTIMENT_BADGE = {
  POSITIVE: 'bg-green-50 text-green-700',
  NEUTRAL: 'bg-yellow-50 text-yellow-700',
  NEGATIVE: 'bg-red-50 text-red-700',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-02" → "Feb"
function monthLabel(key) {
  const parts = key.split('-');
  const idx = Number(parts[1]) - 1;
  return MONTHS[idx] ?? key;
}

export default function DoctorAnalytics() {
  const profileQuery = useDoctorProfile();
  const is404 = profileQuery.error?.response?.status === 404;
  const doctorId = profileQuery.data?.id;

  const analyticsQuery = useDoctorAnalytics(doctorId);

  const [flagReviewId, setFlagReviewId] = useState(null);

  if (profileQuery.isLoading) return <LoadingSpinner message="Loading analytics..." />;

  if (is404) {
    return (
      <div className="p-6 md:p-8">
        <DoctorProfile onSaved={() => profileQuery.refetch()} />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorMessage
          message={profileQuery.error?.response?.data?.message || profileQuery.error?.message}
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  if (analyticsQuery.isLoading) return <LoadingSpinner message="Loading analytics..." />;

  if (analyticsQuery.isError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorMessage
          message={analyticsQuery.error?.response?.data?.message || analyticsQuery.error?.message}
          onRetry={() => analyticsQuery.refetch()}
        />
      </div>
    );
  }

  const a = analyticsQuery.data;

  const monthlyData = Object.entries(a.monthlyBreakdown ?? {}).map(([month, count]) => ({
    month: monthLabel(month),
    count: Number(count),
  }));

  const sentiment = a.sentimentBreakdown ?? {};
  const sentimentData = [
    { name: 'Positive', key: 'positive', value: Number(sentiment.positive ?? 0) },
    { name: 'Neutral', key: 'neutral', value: Number(sentiment.neutral ?? 0) },
    { name: 'Negative', key: 'negative', value: Number(sentiment.negative ?? 0) },
  ];
  const hasSentiment = sentimentData.some((s) => s.value > 0);

  const recentReviews = a.recentReviews ?? [];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="text-gray-500 text-sm mt-1">{a.doctorName} — performance overview.</p>

      {/* Stat cards */}
      <div className="grid gap-4 mt-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Appointments" value={a.totalAppointments} color="blue" />
        <StatCard label="Completed" value={a.completedAppointments} color="green" />
        <StatCard label="Cancelled" value={a.cancelledAppointments} color="red" />
        <StatCard label="Average Rating" value={(a.averageRating ?? 0).toFixed(1)} color="amber" />
        <StatCard label="Total Reviews" value={a.totalReviews} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid gap-5 mt-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Appointments per Month (last 6 months)
          </h2>
          {monthlyData.length === 0 ? (
            <p className="text-gray-400 text-sm py-12 text-center">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Appointments" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Sentiment Breakdown</h2>
          {!hasSentiment ? (
            <p className="text-gray-400 text-sm py-12 text-center">
              No processed reviews yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {sentimentData.map((entry) => (
                    <Cell key={entry.key} fill={SENTIMENT_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent reviews table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-gray-900 p-5 pb-3">Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <p className="text-gray-400 text-sm px-5 pb-6">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-t border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-2.5 font-medium">Patient</th>
                  <th className="px-5 py-2.5 font-medium">Rating</th>
                  <th className="px-5 py-2.5 font-medium">Summary</th>
                  <th className="px-5 py-2.5 font-medium">Sentiment</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800">{rev.patientName}</td>
                    <td className="px-5 py-3">
                      {rev.rating ? <Stars rating={rev.rating} /> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-xs">
                      {rev.summary || rev.rawTranscript || (
                        <span className="text-gray-400 italic">
                          {rev.status === 'PENDING' ? 'Awaiting voice review call' : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {rev.sentiment ? (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            SENTIMENT_BADGE[rev.sentiment] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rev.sentiment}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {rev.isFlagged ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700">
                          Flagged
                        </span>
                      ) : rev.status === 'COMPLETED' ? (
                        <button
                          onClick={() => setFlagReviewId(rev.id)}
                          className="text-xs font-medium text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50"
                        >
                          Flag
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {flagReviewId && (
        <FlagReviewModal
          reviewId={flagReviewId}
          onClose={() => setFlagReviewId(null)}
          onFlagged={() => analyticsQuery.refetch()}
        />
      )}
    </div>
  );
}
