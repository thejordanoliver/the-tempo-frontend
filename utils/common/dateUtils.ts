import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// ============================================================================
// Configuration
// ============================================================================

dayjs.extend(utc);
dayjs.extend(timezone);

const EASTERN_TIMEZONE = "America/New_York";
const DATE_FORMAT = "YYYY-MM-DD";
const CHAT_OPEN_OFFSET_MS = 15 * 60 * 1000;

const MONTH = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
} as const;

const WEEKDAY = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

// ============================================================================
// Types
// ============================================================================

type DateInput = Date | string | number;

type NullableDateInput = DateInput | null | undefined;

interface DateableGame {
  date?: NullableDateInput;
}

// ============================================================================
// Internal Helpers
// ============================================================================

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function parseDate(value: NullableDateInput): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    value = value.trim();

    if (!value) {
      return null;
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  return isValidDate(date) ? date : null;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

// ============================================================================
// Season Utilities
// ============================================================================

/**
 * Returns the ending year of the NBA season.
 * The season rolls over in September.
 */
export function getNBASeason(): number {
  const today = dayjs();
  const year = today.year();

  return today.month() >= MONTH.SEPTEMBER ? year + 1 : year;
}

/**
 * Returns the WNBA season year.
 * January and February belong to the previous season.
 */
export function getWNBASeason(): number {
  const today = dayjs();
  const year = today.year();

  return today.month() >= MONTH.MARCH ? year : year - 1;
}

/**
 * Returns the ending year of the men's college basketball season.
 * The season rolls over in September.
 */
export function getMCBBSeason(): number {
  const today = dayjs();
  const year = today.year();

  return today.month() >= MONTH.SEPTEMBER ? year + 1 : year;
}

/**
 * Returns the MLB season year.
 */
export function getMLBSeason(date: Date = new Date()): number {
  return date.getFullYear();
}

/**
 * Returns the ending year of the NHL season.
 * The season rolls over in September.
 */
export function getNHLSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();

  return String(month >= MONTH.SEPTEMBER ? year + 1 : year);
}

/**
 * Returns the football season year based on the league.
 */
export function getFootballSeason(
  date: Date = new Date(),
  league = "nfl",
): number {
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (league) {
    case "ufl":
      return year;

    case "cfb":
      return month === MONTH.JANUARY ? year - 1 : year;

    default:
      return month < MONTH.JUNE ? year - 1 : year;
  }
}

/**
 * Returns the MLB standings season.
 * The previous season remains active until March.
 */
export function getMLBStandingsSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();

  return String(month < MONTH.MARCH ? year - 1 : year);
}

/**
 * Returns the active recruiting class year.
 * The recruiting year rolls over in May.
 */
export function getRecruitYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();

  return month >= MONTH.MAY ? year + 1 : year;
}

// ============================================================================
// Holiday Utilities
// ============================================================================

/**
 * Returns the holiday associated with a local calendar date.
 */
export function getHolidayLabel(date: Date | null | undefined): string | null {
  if (!date || !isValidDate(date)) {
    return null;
  }

  const month = date.getMonth();
  const day = date.getDate();
  const weekday = date.getDay();

  switch (month) {
    case MONTH.JANUARY:
      return day === 1 ? "New Year's Day" : null;

    case MONTH.NOVEMBER:
      // Thanksgiving occurs on the fourth Thursday of November.
      return weekday === WEEKDAY.THURSDAY && day >= 22 && day <= 28
        ? "Thanksgiving Day"
        : null;

    case MONTH.DECEMBER:
      return day === 25 ? "Christmas Day" : null;

    default:
      return null;
  }
}

// ============================================================================
// Date Formatting Utilities
// ============================================================================

/**
 * Formats a date as a UTC YYYYMMDD string.
 * Existing YYYYMMDD strings are returned unchanged.
 */
export function formatDateToUTCYYYYMMDD(
  value: NullableDateInput,
): string | null {
  if (typeof value === "string") {
    value = value.trim();

    if (/^\d{8}$/.test(value)) {
      return value;
    }
  }

  const date = parseDate(value);

  if (!date) {
    return null;
  }

  return [
    date.getUTCFullYear(),
    padDatePart(date.getUTCMonth() + 1),
    padDatePart(date.getUTCDate()),
  ].join("");
}

/**
 * Formats a date using the user's local timezone.
 *
 * Examples:
 * - Default: Nov 26
 * - Numeric: 11/26
 * - Full: Thu, Nov 26, 4:30 PM
 */
export function formatDate(
  date: Date | string,
  isNumeric?: boolean,
  isFullDate?: boolean,
): string {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = isNumeric
    ? {
        month: "numeric",
        day: "numeric",
      }
    : isFullDate
      ? {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      : {
          month: "short",
          day: "numeric",
        };

  return parsedDate.toLocaleDateString("en-US", options);
}

/**
 * Formats a time using the user's local timezone.
 *
 * Example: 7:30 PM
 */
export function formatTime(date: Date | string): string {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Returns a valid date, falling back to the current date.
 */
export function safeDate(date?: string | null): Date {
  return parseDate(date) ?? new Date();
}

// ============================================================================
// Player Date Utilities
// ============================================================================

/**
 * Calculates a player's age based on their birth date.
 */
export function calculateAge(birthDate?: string | null): number | null {
  const date = parseDate(birthDate);

  if (!date) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - date.getFullYear();

  const monthDifference = today.getMonth() - date.getMonth();

  const hasBirthdayOccurred =
    monthDifference > 0 ||
    (monthDifference === 0 && today.getDate() >= date.getDate());

  if (!hasBirthdayOccurred) {
    age--;
  }

  return age;
}

/**
 * Formats a player's birth date.
 *
 * Example: Dec 30, 1984
 */
export function formatBirth(birthDate: string | null): string | null {
  const date = parseDate(birthDate);

  if (!date) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ============================================================================
// Game Date Utilities
// ============================================================================

/**
 * Determines whether game chat should be available.
 *
 * Opens 15 minutes before the scheduled start and closes
 * at the start of the following calendar day in Eastern Time.
 */
export function shouldShowGameChat(gameDate: Date | null): boolean {
  if (!gameDate || !isValidDate(gameDate)) {
    return false;
  }

  const chatStart = gameDate.getTime() - CHAT_OPEN_OFFSET_MS;

  const nextDay = dayjs(gameDate)
    .tz(EASTERN_TIMEZONE)
    .add(1, "day")
    .format(DATE_FORMAT);

  const chatEnd = dayjs.tz(nextDay, EASTERN_TIMEZONE).valueOf();

  const currentTime = Date.now();

  return currentTime >= chatStart && currentTime < chatEnd;
}

/**
 * Filters games by the user's local calendar date.
 */
export function filterByDate<Game extends DateableGame>(
  games: readonly Game[],
  date: Date,
): Game[] {
  if (!isValidDate(date)) {
    return [];
  }

  const selectedDate = dayjs(date).format(DATE_FORMAT);

  return games.filter((game) => {
    const gameDate = parseDate(game.date);

    if (!gameDate) {
      return false;
    }

    return dayjs(gameDate).format(DATE_FORMAT) === selectedDate;
  });
}
