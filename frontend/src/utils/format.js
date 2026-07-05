// Shared display formatters for dates and times coming from the Spring Boot API.

// Backend LocalTime serializes as "HH:mm:ss" (e.g. "09:00:00"). Show a friendly
// 12-hour time like "9:00 AM". Falls back to the raw value if it can't be parsed.
export function formatTime(value) {
  if (!value) return '';
  const [hStr, mStr] = value.split(':');
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

// Backend LocalDate serializes as "yyyy-MM-dd". Show "Wed, 15 Jul 2026".
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Backend LocalDateTime serializes as "yyyy-MM-ddTHH:mm:ss". Show "15 Jul 2026, 10:30".
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// The day-of-week (MONDAY) for a given "yyyy-MM-dd" date — used to match a slot's day.
export function dayOfWeekFromDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
}
