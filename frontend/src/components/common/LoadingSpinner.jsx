export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
