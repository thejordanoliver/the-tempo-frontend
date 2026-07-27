import AsyncStorage from "@react-native-async-storage/async-storage";

export const LEAGUE_CALENDAR_CACHE_VERSION = 1;
export const LEAGUE_CALENDAR_CACHE_KEY_PREFIX = `league-calendar:v${LEAGUE_CALENDAR_CACHE_VERSION}:`;

export const LEAGUE_CALENDAR_CURRENT_MONTH_TTL = 60 * 60 * 1000;
export const LEAGUE_CALENDAR_FUTURE_MONTH_TTL = 6 * 60 * 60 * 1000;
export const LEAGUE_CALENDAR_PAST_MONTH_TTL = 30 * 24 * 60 * 60 * 1000;

export type CachedLeagueCalendar = {
  calendar: string[];
  fetchedAt: number;
  league: string;
  month: string;
};

export type LeagueCalendarCacheState = "fresh" | "stale";

export type CachedLeagueCalendarResult = {
  cache: CachedLeagueCalendar;
  cacheState: LeagueCalendarCacheState;
};

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const EXACT_DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;

const padDatePart = (value: number) => String(value).padStart(2, "0");

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isValidMonthKey = (month: string) => {
  const match = month.match(MONTH_KEY_PATTERN);
  if (!match) return false;

  const monthNumber = Number(match[2]);
  return monthNumber >= 1 && monthNumber <= 12;
};

const isValidDateKey = (dateKey: string) => {
  const match = dateKey.match(EXACT_DATE_KEY_PATTERN);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
};

export const normalizeLeagueCalendarLeague = (league: string) =>
  league.trim().toLowerCase();

export const getLeagueCalendarDateKey = (value: string): string | null => {
  const match = value.trim().match(DATE_KEY_PATTERN);

  if (!match) return null;

  const dateKey = `${match[1]}-${match[2]}-${match[3]}`;
  return isValidDateKey(dateKey) ? dateKey : null;
};

export const getLeagueCalendarMonth = (
  anchorDate: string | null | undefined,
): string | null => {
  if (!anchorDate) return null;

  const dateKey = getLeagueCalendarDateKey(anchorDate);
  if (!dateKey) return null;

  const month = dateKey.slice(0, 7);
  return isValidMonthKey(month) ? month : null;
};

export const getLeagueCalendarMonthAnchor = (month: string) => `${month}-01`;

export const getLeagueCalendarCacheKey = (league: string, month: string) => {
  return `${LEAGUE_CALENDAR_CACHE_KEY_PREFIX}${normalizeLeagueCalendarLeague(
    league,
  )}:${month}`;
};

const getCurrentMonthKey = (now: Date) => {
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}`;
};

export const getLeagueCalendarCacheTtl = (month: string, now = new Date()) => {
  const currentMonth = getCurrentMonthKey(now);

  if (month === currentMonth) {
    return LEAGUE_CALENDAR_CURRENT_MONTH_TTL;
  }

  return month > currentMonth
    ? LEAGUE_CALENDAR_FUTURE_MONTH_TTL
    : LEAGUE_CALENDAR_PAST_MONTH_TTL;
};

const normalizeCalendarDates = (calendar: unknown): string[] | null => {
  if (!Array.isArray(calendar)) return null;

  const dates: string[] = [];

  for (const value of calendar) {
    if (typeof value !== "string") return null;

    const dateKey = getLeagueCalendarDateKey(value);
    if (!dateKey) return null;

    dates.push(dateKey);
  }

  return Array.from(new Set(dates));
};

const parseCachedLeagueCalendar = (
  value: unknown,
  expectedLeague: string,
  expectedMonth: string,
): CachedLeagueCalendar | null => {
  if (!isRecord(value)) return null;

  const league =
    typeof value.league === "string"
      ? normalizeLeagueCalendarLeague(value.league)
      : null;

  if (league !== expectedLeague) return null;

  const month = typeof value.month === "string" ? value.month : null;
  if (month !== expectedMonth || !isValidMonthKey(month)) return null;

  const fetchedAt =
    typeof value.fetchedAt === "number" && Number.isFinite(value.fetchedAt)
      ? value.fetchedAt
      : null;

  if (fetchedAt === null) return null;

  const calendar = normalizeCalendarDates(value.calendar);
  if (!calendar) return null;

  return {
    calendar,
    fetchedAt,
    league,
    month,
  };
};

const safeRemoveItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove league calendar cache entry:", error);
  }
};

export async function getCachedLeagueCalendar(
  league: string,
  month: string,
): Promise<CachedLeagueCalendarResult | null> {
  const normalizedLeague = normalizeLeagueCalendarLeague(league);
  const key = getLeagueCalendarCacheKey(normalizedLeague, month);

  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    const cache = parseCachedLeagueCalendar(parsed, normalizedLeague, month);

    if (!cache) {
      await safeRemoveItem(key);
      return null;
    }

    const age = Math.max(0, Date.now() - cache.fetchedAt);

    return {
      cache,
      cacheState:
        age <= getLeagueCalendarCacheTtl(cache.month) ? "fresh" : "stale",
    };
  } catch {
    await safeRemoveItem(key);
    return null;
  }
}

export async function setCachedLeagueCalendar(
  league: string,
  month: string,
  calendar: string[],
) {
  const normalizedLeague = normalizeLeagueCalendarLeague(league);
  const normalizedCalendar = normalizeCalendarDates(calendar);

  if (!normalizedCalendar || !isValidMonthKey(month)) return;

  const cache: CachedLeagueCalendar = {
    calendar: normalizedCalendar,
    fetchedAt: Date.now(),
    league: normalizedLeague,
    month,
  };

  try {
    await AsyncStorage.setItem(
      getLeagueCalendarCacheKey(normalizedLeague, month),
      JSON.stringify(cache),
    );
  } catch (error) {
    console.warn("Failed to write league calendar cache:", error);
  }
}
