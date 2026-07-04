export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded border text-sm font-medium ${
            p === page
              ? 'border-blue-500 bg-blue-600 text-white'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
