import { formatDate } from '../../utils/format';

// Read-only display of a completed consultation, for patients.
// `date` (optional) is the appointment date, shown when provided.
export default function ConsultationView({ consultation, date }) {
  if (!consultation) return null;

  const Field = ({ label, value }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
        {value || <span className="text-gray-400">Not recorded</span>}
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {consultation.doctorName}
          </h3>
          {date && <p className="text-sm text-gray-500 mt-0.5">{formatDate(date)}</p>}
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
          {consultation.status}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <Field label="Diagnosis" value={consultation.diagnosis} />
        <Field label="Prescription" value={consultation.prescription} />
        <Field label="Notes" value={consultation.notes} />
      </div>
    </div>
  );
}
