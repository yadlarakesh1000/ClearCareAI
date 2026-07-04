import { useNavigate } from 'react-router-dom';
import Stars from '../common/Stars';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

  return (
    <button
      type="button"
      onClick={() => navigate(`/doctors/${doctor.id}`)}
      className="text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{fullName}</h3>
          <p className="text-sm text-blue-600 mt-0.5">{doctor.specialization}</p>
        </div>
        {doctor.isAvailable ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">
            Available
          </span>
        ) : (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
            Unavailable
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Stars rating={doctor.averageRating} showValue />
        <span className="text-xs text-gray-400">
          ({doctor.totalReviews ?? 0} reviews)
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">{doctor.experienceYears} yrs experience</span>
        <span className="font-semibold text-gray-900">₹{doctor.consultationFee}</span>
      </div>
    </button>
  );
}
