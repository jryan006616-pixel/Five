import { ShiftTimingConfig, AttendanceStatus } from '../types';

/**
 * Parses any time string format into minutes from midnight (0 to 1439).
 * Supported inputs: "18:00", "18:00:00", "21:01", "09:01 PM", "9:01pm", "6:00 pm", "03:00", "03:00:00"
 */
export function parseTimeToMinutes(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim().toUpperCase();

  // Check 12-hour format with AM/PM
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3];

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Check 24-hour format "HH:MM" or "HH:MM:SS"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return (hours % 24) * 60 + minutes;
  }

  return 0;
}

/**
 * Formats minutes from midnight into 12-Hour format (e.g. 1080 -> "06:00 PM", 1261 -> "09:01 PM")
 */
export function formatMinutesTo12Hour(minutesFromMidnight: number): string {
  const normalized = ((minutesFromMidnight % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const paddedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`;
  const paddedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${paddedHours}:${paddedMins} ${meridiem}`;
}

/**
 * Formats a 24-hour time string ("18:00") into 12-hour format ("06:00 PM PKT")
 */
export function formatTimeTo12HourWithTimezone(timeStr: string, tz: string = 'PKT'): string {
  if (!timeStr) return '--:--';
  const mins = parseTimeToMinutes(timeStr);
  return `${formatMinutesTo12Hour(mins)} ${tz}`;
}

export interface CheckInEvaluation {
  isLate: boolean;
  lateMinutes: number;
  status: AttendanceStatus;
  notes: string;
  isWithinGrace: boolean;
  shiftExpectedStart12h: string;
  checkIn12h: string;
}

/**
 * Evaluates a Check-In against the active Shift Timing and Grace Period.
 * Handles overnight shifts (e.g. 6:00 PM / 18:00 to 3:00 AM / 03:00).
 */
export function evaluateCheckIn(
  checkInTimeStr: string,
  shiftConfig: ShiftTimingConfig,
  customGraceMinutes?: number
): CheckInEvaluation {
  const graceMinutes = customGraceMinutes !== undefined ? customGraceMinutes : shiftConfig.gracePeriodMinutes;
  const shiftStartMins = parseTimeToMinutes(shiftConfig.startTime);
  const checkInMins = parseTimeToMinutes(checkInTimeStr);

  const isOvernight = shiftConfig.isOvernight || parseTimeToMinutes(shiftConfig.endTime) < shiftStartMins;

  let elapsedSinceShiftStart = 0;

  if (isOvernight) {
    // For an overnight shift starting e.g. at 18:00 (1080 min):
    // If checking in between 12:00 (720 min) and 23:59 (1439 min):
    if (checkInMins >= 720) {
      elapsedSinceShiftStart = checkInMins - shiftStartMins;
    } else {
      // Checked in past midnight (00:00 to 11:59):
      // On shift timeline: 1440 + checkInMins
      elapsedSinceShiftStart = 1440 + checkInMins - shiftStartMins;
    }
  } else {
    // Regular daytime shift (e.g. 09:00 to 18:00)
    elapsedSinceShiftStart = checkInMins - shiftStartMins;
  }

  const shiftStart12h = formatMinutesTo12Hour(shiftStartMins);
  const checkIn12h = formatMinutesTo12Hour(checkInMins);

  // If check-in happened before shift starts (early arrival)
  if (elapsedSinceShiftStart <= 0) {
    return {
      isLate: false,
      lateMinutes: 0,
      status: 'Present',
      notes: `Checked in on time / early at ${checkIn12h} PKT (Shift Start: ${shiftStart12h} PKT).`,
      isWithinGrace: true,
      shiftExpectedStart12h: shiftStart12h,
      checkIn12h,
    };
  }

  // If check-in is within the allowed grace period (e.g. within 15 mins)
  if (elapsedSinceShiftStart <= graceMinutes) {
    return {
      isLate: false,
      lateMinutes: elapsedSinceShiftStart,
      status: 'Present',
      notes: `Checked in at ${checkIn12h} PKT (+${elapsedSinceShiftStart}m, within ${graceMinutes}m grace period).`,
      isWithinGrace: true,
      shiftExpectedStart12h: shiftStart12h,
      checkIn12h,
    };
  }

  // Check-in is beyond grace period -> FLAGGED AS LATE!
  const isHalfDay = elapsedSinceShiftStart >= (shiftConfig.halfDayThresholdMinutes || 240); // 4 hours late

  return {
    isLate: true,
    lateMinutes: elapsedSinceShiftStart,
    status: isHalfDay ? 'Half Day' : 'Late',
    notes: isHalfDay
      ? `Half Day logged: Checked in at ${checkIn12h} PKT (+${elapsedSinceShiftStart} mins / ${(elapsedSinceShiftStart / 60).toFixed(1)} hrs late against ${shiftStart12h} PKT shift).`
      : `Late Arrival logged: Checked in at ${checkIn12h} PKT (+${elapsedSinceShiftStart} mins late against ${shiftStart12h} PKT shift with ${graceMinutes}m grace).`,
    isWithinGrace: false,
    shiftExpectedStart12h: shiftStart12h,
    checkIn12h,
  };
}

/**
 * Calculates net working hours, total break deduction, and overtime.
 */
export function calculateWorkingHours(
  checkInStr: string | null,
  checkOutStr: string | null,
  totalBreakMinutes: number = 0,
  shiftConfig?: ShiftTimingConfig
): {
  totalWorkingMinutes: number;
  overtimeMinutes: number;
  isEarlyDeparture: boolean;
  earlyDepartureMinutes: number;
} {
  if (!checkInStr || !checkOutStr) {
    return {
      totalWorkingMinutes: 0,
      overtimeMinutes: 0,
      isEarlyDeparture: false,
      earlyDepartureMinutes: 0,
    };
  }

  const checkInMins = parseTimeToMinutes(checkInStr);
  const checkOutMins = parseTimeToMinutes(checkOutStr);

  let rawElapsed = 0;
  if (checkOutMins >= checkInMins) {
    rawElapsed = checkOutMins - checkInMins;
  } else {
    // Spans midnight
    rawElapsed = 1440 - checkInMins + checkOutMins;
  }

  const netWorkingMinutes = Math.max(0, rawElapsed - totalBreakMinutes);
  const standardWorkMinutes = 480; // 8 hours net
  const overtimeMinutes = netWorkingMinutes > standardWorkMinutes ? netWorkingMinutes - standardWorkMinutes : 0;

  // Check early departure if shiftConfig provided
  let isEarlyDeparture = false;
  let earlyDepartureMinutes = 0;

  if (shiftConfig) {
    const shiftEndMins = parseTimeToMinutes(shiftConfig.endTime);
    // If overnight
    let shiftDurationMins = 0;
    const shiftStartMins = parseTimeToMinutes(shiftConfig.startTime);
    if (shiftEndMins >= shiftStartMins) {
      shiftDurationMins = shiftEndMins - shiftStartMins;
    } else {
      shiftDurationMins = 1440 - shiftStartMins + shiftEndMins;
    }

    if (rawElapsed < shiftDurationMins - 30) {
      isEarlyDeparture = true;
      earlyDepartureMinutes = shiftDurationMins - rawElapsed;
    }
  }

  return {
    totalWorkingMinutes: netWorkingMinutes,
    overtimeMinutes,
    isEarlyDeparture,
    earlyDepartureMinutes,
  };
}

export const DEFAULT_SHIFT_CONFIG: ShiftTimingConfig = {
  shiftName: 'US Night Shift (Karachi RCM Center)',
  season: 'Regular',
  startTime: '18:00', // 06:00 PM PKT
  endTime: '03:00', // 03:00 AM PKT
  isOvernight: true,
  timezone: 'Asia/Karachi (PKT / UTC+5)',
  gracePeriodMinutes: 15,
  summerStartTime: '18:00', // 6:00 PM PKT
  summerEndTime: '03:00', // 3:00 AM PKT
  winterStartTime: '19:00', // 7:00 PM PKT
  winterEndTime: '04:00', // 4:00 AM PKT
  halfDayThresholdMinutes: 180, // 3 hours late
};
