export const HOURS = Array.from({ length: 24 }, (_, hour) => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
});

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function startOfWeek(date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

export function endOfWeek(date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date, amount) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function getWeekDays(anchorDate) {
  const start = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getMonthGrid(anchorDate) {
  const start = startOfWeek(startOfMonth(anchorDate));
  const end = endOfWeek(endOfMonth(anchorDate));
  const days = [];

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(new Date(cursor));
  }

  return days;
}

export function formatApiDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDateInput(date) {
  return formatApiDate(date);
}

export function formatTimeInput(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

export function formatDayName(date, options = {}) {
  return new Intl.DateTimeFormat('en-US', { weekday: options.short ? 'short' : 'long' }).format(date);
}

export function formatDateNumber(date) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date);
}

export function formatTimeRange(startAt, endAt, allDay = false) {
  if (allDay) {
    return 'All day';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${formatter.format(startAt)} - ${formatter.format(endAt)}`;
}

export function combineDateAndTime(dateValue, timeValue) {
  return new Date(`${dateValue}T${timeValue}:00`);
}

export function toLocalDateTimeString(date) {
  return `${formatDateInput(date)}T${formatTimeInput(date)}:00`;
}

export function getRangeForView(view, anchorDate) {
  if (view === 'day') {
    return {
      startDate: startOfDay(anchorDate),
      endDate: endOfDay(anchorDate),
    };
  }

  if (view === 'month') {
    const grid = getMonthGrid(anchorDate);
    return {
      startDate: startOfDay(grid[0]),
      endDate: endOfDay(grid[grid.length - 1]),
    };
  }

  return {
    startDate: startOfWeek(anchorDate),
    endDate: endOfWeek(anchorDate),
  };
}

export function getTimezoneLabel() {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `GMT ${sign}${hours}:${minutes}`;
}

export function parseEventDateTime(value) {
  return new Date(value);
}

export function clampDateRange(date, minDate, maxDate) {
  if (date < minDate) return new Date(minDate);
  if (date > maxDate) return new Date(maxDate);
  return date;
}

export function getInitialEventForm(date, categoryId) {
  // Use the time from the passed date, or default to 9 AM if no time is set
  const startHour = date.getHours() || 9;
  const startMinute = date.getMinutes() || 0;
  
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour + 1, startMinute, 0, 0);

  return {
    title: '',
    categoryId: categoryId ? String(categoryId) : '',
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
    startTime: formatTimeInput(start),
    endTime: formatTimeInput(end),
    allDay: false,
    location: '',
    meetingLink: '',
    attendees: '',
    description: '',
    availability: 'BUSY',
    visibility: 'DEFAULT',
    reminderMinutes: '30',
  };
}
