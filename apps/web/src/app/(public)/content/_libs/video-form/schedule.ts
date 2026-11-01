/** What the schedule modal collects: a wall-clock date + "HH:mm" in the admin's own timezone. */
export interface ScheduleConfig {
  date: Date;
  time: string;
}

/** The modal's local date + "HH:mm" → UTC ISO instant for `scheduledAt`. */
export function scheduleToIso({ date, time }: ScheduleConfig): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  return local.toISOString();
}
