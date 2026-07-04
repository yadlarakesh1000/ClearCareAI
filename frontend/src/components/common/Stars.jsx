// Displays a 1–5 star rating. Rounds to the nearest whole star for display,
// and shows the numeric value alongside when `showValue` is set.
export default function Stars({ rating, showValue = false }) {
  const value = Number(rating) || 0;
  const rounded = Math.round(value);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-amber-400 text-sm" aria-label={`${value} out of 5`}>
        {'★'.repeat(rounded)}
        <span className="text-gray-300">{'★'.repeat(5 - rounded)}</span>
      </span>
      {showValue && (
        <span className="text-xs text-gray-500">
          {value > 0 ? value.toFixed(1) : 'No ratings'}
        </span>
      )}
    </span>
  );
}
