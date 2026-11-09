import type { RacingLeague, RacingLeagueDisplayConfig } from "./types";

export const RACING_LEAGUE_CONFIG: Record<
  RacingLeague,
  RacingLeagueDisplayConfig
> = {
  f1: {
    label: "FORMULA 1",
    shortLabel: "F1",
    eventLabel: "GRAND PRIX",
    accentColor: "#E10600",
  },

  nascarpremier: {
    label: "NASCAR CUP SERIES",
    shortLabel: "CUP",
    eventLabel: "RACE DAY",
    accentColor: "#F5C400",
  },

  nascarsecondary: {
    label: "NASCAR XFINITY SERIES",
    shortLabel: "XFINITY",
    eventLabel: "RACE DAY",
    accentColor: "#7B2CBF",
  },

  nascartruck: {
    label: "NASCAR TRUCK SERIES",
    shortLabel: "TRUCK",
    eventLabel: "RACE DAY",
    accentColor: "#1E88E5",
  },
};

export const resolveRacingLeague = (
  ...values: (string | null | undefined)[]
): RacingLeague | null => {
  for (const value of values) {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    switch (normalized) {
      case "f1":
        return "f1";

      case "nascar":
      case "nascarpremier":
        return "nascarpremier";

      case "nascarsecondary":
        return "nascarsecondary";

      case "nascartruck":
        return "nascartruck";
    }
  }

  return null;
};
