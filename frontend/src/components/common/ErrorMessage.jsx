export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 my-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-xl leading-none">✕</span>
        <div className="flex-1">
          <p className="text-red-800 font-medium">Something went wrong</p>
          <p className="text-red-600 text-sm mt-1">{message || 'An unexpected error occurred.'}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-red-700 underline hover:text-red-900"
        >
          Try again
        </button>
      )}
    </div>
  );
}
