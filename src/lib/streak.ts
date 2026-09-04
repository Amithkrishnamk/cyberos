export function calculateStudyStreak(sessions: Array<{ startedAt: string | Date; endedAt?: string | Date | null }>): number {
  if (!sessions || sessions.length === 0) return 0;

  // Gather unique calendar dates (YYYY-MM-DD) in local user time
  const uniqueDatesSet = new Set<string>();

  sessions.forEach((s) => {
    const rawDate = s.endedAt || s.startedAt;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        // Local date string format YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        uniqueDatesSet.add(`${year}-${month}-${day}`);
      }
    }
  });

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const hasStudiedToday = uniqueDatesSet.has(todayStr);
  const hasStudiedYesterday = uniqueDatesSet.has(yesterdayStr);

  // If student hasn't studied today or yesterday, active streak is broken (0)
  if (!hasStudiedToday && !hasStudiedYesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = hasStudiedToday ? new Date(now) : new Date(yesterday);

  while (true) {
    const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (uniqueDatesSet.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
