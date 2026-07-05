// Colored stat card used across the analytics and admin dashboards.
const COLORS = {
  blue: 'bg-blue-50 border-blue-100 text-blue-700',
  green: 'bg-green-50 border-green-100 text-green-700',
  red: 'bg-red-50 border-red-100 text-red-700',
  amber: 'bg-amber-50 border-amber-100 text-amber-700',
  purple: 'bg-purple-50 border-purple-100 text-purple-700',
  indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
};

export default function StatCard({ label, value, color = 'gray' }) {
  return (
    <div className={`rounded-xl border p-4 ${COLORS[color] ?? COLORS.gray}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
