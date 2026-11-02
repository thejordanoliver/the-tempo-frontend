import { Colors, Fonts } from "../../constants/styles";
import type {
  DeviceGameWidgetProps,
  DeviceGameWidgetTeam,
} from "../../types/deviceGameWidget";
import type { ExploreWidgetGame } from "../../types/widgets";
import {
  getExploreFavoriteGamePhase,
  prepareExploreFavoriteGames,
} from "./exploreFavoriteGames";

export const DEVICE_GAME_WIDGET_STALE_MS = 15 * 60 * 1000;
export const DEVICE_GAME_WIDGET_URL = "tempo:///(tabs)/(explore)/explore";

type SnapshotOptions = {
  games: readonly ExploreWidgetGame[];
  userId: number | null;
  hasFavorites: boolean;
  loading: boolean;
  error: string | null;
  colorScheme: DeviceGameWidgetProps["colorScheme"];
  now?: number;
};

function gameDate(game: ExploreWidgetGame["game"]): Date | null {
  for (const raw of [game.startDate, game.date]) {
    const timestamp = Date.parse(raw ?? "");
    if (Number.isFinite(timestamp)) return new Date(timestamp);
  }
  const timestamp = Number(game.timestamp);
  return Number.isFinite(timestamp) && timestamp > 0
    ? new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp)
    : null;
}

function teamValue(value: unknown): string {
  return value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
    ? String(value)
    : "—";
}

function mapTeam(
  team: ExploreWidgetGame["game"]["home"] | ExploreWidgetGame["game"]["away"],
  showScore: boolean,
  volleyball: boolean,
): DeviceGameWidgetTeam {
  const rawColor = String(team.primaryColor ?? "").replace(/^#/, "");
  return {
    name: team.name || team.code || "TBD",
    code: team.code || team.name || "TBD",
    value: showScore
      ? teamValue(
          volleyball && "setsWon" in team
            ? (team.setsWon ?? team.score)
            : team.score,
        )
      : team.record || "—",
    color: /^[\da-f]{6}$/i.test(rawColor) ? `#${rawColor}` : Colors.midTone,
  };
}

export function buildDeviceGameWidgetSnapshot({
  games,
  userId,
  hasFavorites,
  loading,
  error,
  colorScheme,
  now = Date.now(),
}: SnapshotOptions): DeviceGameWidgetProps {
  // Never serialize a previous account's games into the shared widget container.
  const visibleGames =
    userId && hasFavorites ? prepareExploreFavoriteGames(games, now) : [];
  const title = !userId
    ? "Sign in to Tempo"
    : !hasFavorites
      ? "Follow your teams"
      : loading && !visibleGames.length
        ? "Loading games"
        : error && !visibleGames.length
          ? "Games unavailable"
          : "Favorite Games";
  const message = !userId
    ? "Open Tempo to see your favorite games."
    : !hasFavorites
      ? "Add favorite teams in Tempo to see their games here."
      : loading
        ? "Open Tempo to refresh your games."
        : error
          ? "Open Tempo to try again."
          : "No recent or upcoming games. Check back soon.";

  return {
    games: visibleGames.map((envelope) => {
      const phase = getExploreFavoriteGamePhase(envelope);
      const game = envelope.game;
      const detail =
        game.status.shortDetail ||
        game.status.detail ||
        game.status.description ||
        "";
      const exceptional =
        /postpon|cancel|delay|suspend|forfeit|tbd|time.*tba/i.test(detail);
      const date = gameDate(game);
      const scheduledLabel = date
        ? date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Time TBD";
      return {
        key: envelope.key,
        league: envelope.league,
        url: `tempo:///(tabs)/(explore)/game/${encodeURIComponent(envelope.sport)}/${encodeURIComponent(envelope.gameId)}?league=${encodeURIComponent(envelope.league)}&leagueId=${encodeURIComponent(envelope.league)}`,
        status:
          phase === "upcoming" && !exceptional
            ? scheduledLabel
            : detail || (phase === "completed" ? "Final" : "Live"),
        live: phase === "live" && !exceptional,
        away: mapTeam(
          game.away,
          phase !== "upcoming",
          envelope.sport === "volleyball",
        ),
        home: mapTeam(
          game.home,
          phase !== "upcoming",
          envelope.sport === "volleyball",
        ),
      };
    }),
    title,
    message,
    url: !userId
      ? "tempo:///login"
      : !hasFavorites
        ? "tempo:///(tabs)/(explore)/edit-favorites"
        : DEVICE_GAME_WIDGET_URL,
    updatedAt: now,
    updatedLabel: `Updated ${new Date(now).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`,
    stale: false,
    colorScheme,
    fonts: { MEDIUM: Fonts.MEDIUM, SEMIBOLD: Fonts.SEMIBOLD, BOLD: Fonts.BOLD },
    palettes: {
      light: {
        background: Colors.light.background,
        text: Colors.light.text,
        secondary: Colors.darkGray,
        live: Colors.light.red,
      },
      dark: {
        background: Colors.dark.background,
        text: Colors.dark.text,
        secondary: Colors.lightGray,
        live: Colors.dark.lightRed,
      },
    },
  };
}

/** A future entry labels cached scores honestly after the app stops supplying updates. */
export function buildDeviceGameWidgetTimeline(props: DeviceGameWidgetProps) {
  return [
    { date: new Date(props.updatedAt), props },
    {
      date: new Date(props.updatedAt + DEVICE_GAME_WIDGET_STALE_MS),
      props: { ...props, stale: true },
    },
  ];
}
