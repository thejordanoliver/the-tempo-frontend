import { Colors } from "constants/styles";
import type { MessageAccent, MessageThemePreference } from "types/messages";
import { favoriteTeamsList } from "utils/teams";

type RawThemePreference = Partial<MessageThemePreference> | null | undefined;

const VALID_THEME_MODES = new Set<MessageThemePreference["mode"]>([
  "default",
  "favorite_team",
  "manual",
]);

export const DEFAULT_MESSAGE_THEME_PREFERENCE: MessageThemePreference = {
  mode: "default",
  league: null,
  teamId: null,
  primaryColor: null,
  secondaryColor: null,
};

export const DEFAULT_MESSAGE_ACCENT: MessageAccent = {
  primary: Colors.black,
  secondary: Colors.white,
};

const parseThemePreference = (value: unknown): RawThemePreference => {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  return typeof value === "object"
    ? (value as Partial<MessageThemePreference>)
    : null;
};

const normalizeString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const normalizeTeamId = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return null;
};

const normalizeColor = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;

export const normalizeMessageThemePreference = (
  value?: unknown,
): MessageThemePreference => {
  const raw = parseThemePreference(value);
  const rawRecord = raw as
    | (Partial<MessageThemePreference> & {
        team_id?: unknown;
        primary_color?: unknown;
        secondary_color?: unknown;
      })
    | null
    | undefined;
  const mode = rawRecord?.mode;

  if (!mode || !VALID_THEME_MODES.has(mode)) {
    return DEFAULT_MESSAGE_THEME_PREFERENCE;
  }

  if (mode === "default") {
    return DEFAULT_MESSAGE_THEME_PREFERENCE;
  }

  return {
    mode,
    league: normalizeString(rawRecord.league),
    teamId: normalizeTeamId(rawRecord.teamId ?? rawRecord.team_id),
    primaryColor: normalizeString(
      rawRecord.primaryColor ?? rawRecord.primary_color,
    ),
    secondaryColor: normalizeString(
      rawRecord.secondaryColor ?? rawRecord.secondary_color,
    ),
  };
};

const findThemeTeam = (
  league: string | null,
  teamId: string | number | null,
) => {
  if (!league || teamId == null) return null;

  return (
    favoriteTeamsList.find(
      (team) =>
        String(team.league).toUpperCase() === String(league).toUpperCase() &&
        String(team.id) === String(teamId),
    ) ?? null
  );
};

export const resolveMessageAccent = (value?: unknown): MessageAccent => {
  const preference = normalizeMessageThemePreference(value);

  if (preference.mode === "default") {
    return DEFAULT_MESSAGE_ACCENT;
  }

  if (preference.mode === "manual") {
    return {
      primary: normalizeColor(
        preference.primaryColor,
        DEFAULT_MESSAGE_ACCENT.primary,
      ),
      secondary: normalizeColor(
        preference.secondaryColor,
        DEFAULT_MESSAGE_ACCENT.secondary,
      ),
    };
  }

  const team = findThemeTeam(preference.league, preference.teamId);

  if (!team?.color) {
    return DEFAULT_MESSAGE_ACCENT;
  }

  return {
    primary: normalizeColor(team.color, DEFAULT_MESSAGE_ACCENT.primary),
    secondary: normalizeColor(
      team.secondaryColor,
      DEFAULT_MESSAGE_ACCENT.secondary,
    ),
  };
};

const parseColorToRgb = (color: string | null | undefined) => {
  if (!color) return null;

  const value = color.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expanded =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : hex;

    if (expanded.length < 6) return null;

    const rgb = expanded.slice(0, 6);
    const intValue = Number.parseInt(rgb, 16);

    if (Number.isNaN(intValue)) return null;

    return {
      r: (intValue >> 16) & 255,
      g: (intValue >> 8) & 255,
      b: intValue & 255,
    };
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
  );

  if (!rgbMatch) return null;

  return {
    r: Math.min(255, Number(rgbMatch[1])),
    g: Math.min(255, Number(rgbMatch[2])),
    b: Math.min(255, Number(rgbMatch[3])),
  };
};

const getRelativeLuminance = (color: string | null | undefined) => {
  const rgb = parseColorToRgb(color);

  if (!rgb) return 0;

  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * toLinear(rgb.r) +
    0.7152 * toLinear(rgb.g) +
    0.0722 * toLinear(rgb.b)
  );
};

const isLightColor = (color: string | null | undefined) =>
  getRelativeLuminance(color) > 0.48;

export const getReadableTextColor = (backgroundColor: string) =>
  isLightColor(backgroundColor) ? Colors.black : Colors.white;

export const getReadableTimestampColor = (backgroundColor: string) =>
  isLightColor(backgroundColor)
    ? "rgba(29, 29, 29, 0.68)"
    : "rgba(255, 255, 255, 0.72)";
