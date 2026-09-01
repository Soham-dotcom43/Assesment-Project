// Shared helpers for computing working hours and attendance status

const todayString = (d = new Date()) => {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Returns hours worked (decimal, rounded to 2 places) between two Date objects
const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
};

// Determines status based on check-in time vs the configured "late after" cutoff
// and total hours worked vs the standard work day.
const determineStatus = (checkIn, workingHours) => {
  const standardHours = Number(process.env.STANDARD_WORK_HOURS || 8);
  const lateAfter = process.env.LATE_AFTER || '09:15';
  const [lateH, lateM] = lateAfter.split(':').map(Number);

  const checkInDate = new Date(checkIn);
  const lateThreshold = new Date(checkInDate);
  lateThreshold.setHours(lateH, lateM, 0, 0);

  if (workingHours > 0 && workingHours < standardHours / 2) {
    return 'half-day';
  }
  if (checkInDate > lateThreshold) {
    return 'late';
  }
  return 'present';
};

module.exports = { todayString, calculateWorkingHours, determineStatus };
