import { Colors } from "constants/styles";
import { getWCBBTeam, getWCBBTeamByESPNId } from "constants/teamsWCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { RefreshControl, ScrollView } from "react-native";
import type { WCBBTeam } from "types/types";
import { OpeningRoundSection } from "./OpeningRoundSection";
import { TournamentBracketCanvas } from "./TournamentBracketCanvas";
import { TournamentBracketEmptyState } from "./TournamentBracketEmptyState";
import { TournamentBracketHeader } from "./TournamentBracketHeader";
import { TournamentBracketSkeleton } from "./TournamentBracketSkeleton";
import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketGame,
  BracketTeam,
  TournamentBracketCompetition,
  TournamentBracketProps,
} from "./tournamentBracket.types";
import {
  canNavigateToBracketGame,
  createBracketGameMap,
  getRenderableBracketTeam,
  isFinalBracketGame,
  isLiveBracketGame,
  normalizeTournamentForBracket,
} from "./tournamentBracket.utils";

type RouteTeamPayload = {
  id: number;
  databaseId: number | null;
  espnId: number;
  uid: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  state: string;
  location: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  nbaAPIID: number;
  rank: number;
  score: number;
  record: string;
  winner: boolean;
};

type RouteGamePayload = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: string;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: number;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    clock: string;
    displayClock: string;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
  };
  broadcasts: string[];
  geoBroadcasts: [];
  periods: number;
  home: RouteTeamPayload;
  away: RouteTeamPayload;
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: boolean;
  wasSuspended: boolean;
  raw: {
    eventId: string;
    competitionId: string;
  };
};

type LeagueRouteMetadata = {
  id: number;
  uid: string;
  code: "cbb" | "wcbb";
  name: string;
  slug: "mens-college-basketball" | "womens-college-basketball";
};

const EMPTY_GAME_MAP: ReadonlyMap<string, BracketGame> = new Map<
  string,
  BracketGame
>();

function getLeagueMetadata(
  competition: TournamentBracketCompetition,
): LeagueRouteMetadata {
  if (competition === "WCBB") {
    return {
      id: 14,
      uid: "wcbb",
      code: "wcbb",
      name: "Women's College Basketball",
      slug: "womens-college-basketball",
    };
  }

  return {
    id: 10,
    uid: "cbb",
    code: "cbb",
    name: "Men's College Basketball",
    slug: "mens-college-basketball",
  };
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getImageUri(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object" && "uri" in value) {
    const uri = (value as { uri?: unknown }).uri;
    return typeof uri === "string" ? uri : "";
  }

  return "";
}

function getExplicitWCBBDatabaseId(team: BracketTeam | null): number | null {
  if (!team) return null;

  const record = team as BracketTeam & {
    databaseId?: string | number | null;
    database_id?: string | number | null;
    dbId?: string | number | null;
    db_id?: string | number | null;
    teamDatabaseId?: string | number | null;
    team_database_id?: string | number | null;
    wcbbTeamId?: string | number | null;
    wcbb_team_id?: string | number | null;
  };

  const value =
    record.databaseId ??
    record.database_id ??
    record.dbId ??
    record.db_id ??
    record.teamDatabaseId ??
    record.team_database_id ??
    record.wcbbTeamId ??
    record.wcbb_team_id;

  const parsed = toNumber(value);

  return parsed > 0 ? parsed : null;
}

function getExplicitWCBBESPNId(team: BracketTeam | null): number | null {
  if (!team) return null;

  const record = team as BracketTeam & {
    espn_id?: string | number | null;
    espnTeamId?: string | number | null;
    espn_team_id?: string | number | null;
  };
  const value =
    record.espnId ?? record.espn_id ?? record.espnTeamId ?? record.espn_team_id;
  const parsed = toNumber(value);

  return parsed > 0 ? parsed : null;
}

function resolveWCBBBracketTeam(team: BracketTeam | null): {
  databaseId: number | null;
  espnId: number;
  team: WCBBTeam | undefined;
} {
  const explicitDatabaseId = getExplicitWCBBDatabaseId(team);
  const explicitESPNId = getExplicitWCBBESPNId(team);
  const resolvedTeam = explicitDatabaseId
    ? getWCBBTeam(explicitDatabaseId)
    : explicitESPNId
      ? getWCBBTeamByESPNId(explicitESPNId)
      : undefined;

  return {
    databaseId: resolvedTeam?.id ?? explicitDatabaseId,
    espnId: resolvedTeam?.espnId ?? explicitESPNId ?? 0,
    team: resolvedTeam,
  };
}

function getRouteTeamName(
  team: BracketTeam | null,
  fallbackName: string,
): string {
  const displayTeam = getRenderableBracketTeam(team);

  return (
    displayTeam?.shortName ||
    displayTeam?.abbreviation ||
    displayTeam?.name ||
    fallbackName
  );
}

function toRouteTeam(
  team: BracketTeam | null,
  fallbackName: string,
  competition: TournamentBracketCompetition,
): RouteTeamPayload {
  const displayTeam = getRenderableBracketTeam(team);
  const displayName = getRouteTeamName(displayTeam, fallbackName);

  const isWCBB = competition === "WCBB";
  const wcbbTeam = isWCBB ? resolveWCBBBracketTeam(displayTeam) : null;
  const id = isWCBB ? (wcbbTeam?.databaseId ?? 0) : toNumber(displayTeam?.id);
  const espnId = isWCBB
    ? (wcbbTeam?.espnId ?? 0)
    : toNumber(displayTeam?.espnId) || id;
  const resolvedTeam = wcbbTeam?.team;

  return {
    id,
    databaseId: isWCBB ? (wcbbTeam?.databaseId ?? null) : null,
    espnId,
    uid: String(espnId || displayTeam?.id || ""),
    name:
      resolvedTeam?.fullName ??
      resolvedTeam?.name ??
      displayTeam?.name ??
      displayName,
    shortName: resolvedTeam?.shortName ?? displayName,
    code: resolvedTeam?.code ?? displayTeam?.abbreviation ?? "TBD",
    city: resolvedTeam?.city ?? "",
    state: resolvedTeam?.state ?? "",
    location: resolvedTeam?.location ?? "",
    logo: getImageUri(resolvedTeam?.logo) || displayTeam?.logo || "",
    primaryColor: resolvedTeam?.primaryColor ?? "",
    secondaryColor: resolvedTeam?.secondaryColor ?? "",
    nbaAPIID: 0,
    rank: displayTeam?.seed ?? 0,
    score: toNumber(displayTeam?.score),
    record: "",
    winner: displayTeam?.winner === true,
  };
}

function getRouteStatus(game: BracketGame): RouteGamePayload["status"] {
  const isFinal = isFinalBracketGame(game);
  const isLive = isLiveBracketGame(game);

  const fallbackStatus = isFinal
    ? "Final"
    : isLive
      ? "In Progress"
      : "Scheduled";

  const statusText = game.statusText?.trim() || fallbackStatus;

  return {
    state: isFinal ? "post" : isLive ? "in" : "pre",
    description: statusText,
    detail: statusText,
    shortDetail: statusText,
    period: 0,
    clock: "",
    displayClock: "",
    completed: isFinal,
  };
}

function createRoutePayload(
  game: BracketGame,
  competition: TournamentBracketCompetition,
  season: number,
): RouteGamePayload {
  const league = getLeagueMetadata(competition);
  const gameId = game.id;
  const date = game.date ?? "";

  const parsedTimestamp = date ? new Date(date).getTime() : 0;

  const timestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : 0;

  const topTeam = getRenderableBracketTeam(game.topTeam);
  const bottomTeam = getRenderableBracketTeam(game.bottomTeam);

  const topTeamName = topTeam?.name ?? topTeam?.shortName ?? "TBD";

  const bottomTeamName = bottomTeam?.name ?? bottomTeam?.shortName ?? "TBD";

  const topTeamAbbreviation =
    topTeam?.abbreviation ?? topTeam?.shortName ?? "TBD";

  const bottomTeamAbbreviation =
    bottomTeam?.abbreviation ?? bottomTeam?.shortName ?? "TBD";

  const venue = game.venue;
  const isLive = isLiveBracketGame(game);

  return {
    league: {
      id: league.id,
      uid: league.uid,
      code: league.code,
      name: league.name,
      slug: league.slug,
    },

    id: gameId,
    uid: gameId,

    name: `${topTeamName} vs ${bottomTeamName}`,
    shortName: `${topTeamAbbreviation} VS ` + bottomTeamAbbreviation,

    headline: game.headline ?? game.roundLabel ?? "",

    date,
    startDate: date,
    timestamp,

    season: {
      year: season,
      type: 3,
      slug: "post-season",
    },

    status: getRouteStatus(game),

    venue: {
      id: venue?.id ?? "",
      name: venue?.name ?? "",
      city: venue?.city ?? "",
      state: venue?.state ?? "",
      indoor: venue?.indoor ?? true,
    },

    broadcasts: game.broadcast ? [game.broadcast] : [],

    geoBroadcasts: [],
    periods: 2,

    /*
     * The bracket API uses visual top/bottom positioning.
     * Continue mapping bottom to home and top to away so the
     * existing game details route receives its expected shape.
     */
    home: toRouteTeam(bottomTeam, "Home Team", competition),

    away: toRouteTeam(topTeam, "Away Team", competition),

    isConferenceGame: false,
    isNeutralSite: true,
    attendance: 0,
    playByPlayAvailable: Boolean(gameId),
    recent: isLive,
    wasSuspended: false,

    raw: {
      eventId: gameId,
      competitionId: gameId,
    },
  };
}

export default function TournamentBracket({
  tournament,
  loading = false,
  error = null,
  refreshing = false,
  onRefresh,
}: TournamentBracketProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const bracketTournament = useMemo(
    () => (tournament ? normalizeTournamentForBracket(tournament) : null),
    [tournament],
  );
  const tournamentKey = bracketTournament
    ? `${bracketTournament.tournamentId ?? bracketTournament.tournamentName}-${bracketTournament.season}`
    : null;

  useEffect(() => {
    if (!tournamentKey) return;

    const frame = requestAnimationFrame(() => {
      horizontalScrollRef.current?.scrollTo({ x: 0, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [tournamentKey]);

  const handleRefresh = useCallback(() => {
    if (!onRefresh || refreshing) {
      return;
    }

    void onRefresh();
  }, [onRefresh, refreshing]);

  const handleGamePress = useCallback(
    (game: BracketGame) => {
      if (!bracketTournament || !canNavigateToBracketGame(game)) {
        return;
      }

      const league = getLeagueMetadata(bracketTournament.competition);

      const routePayload = createRoutePayload(
        game,
        bracketTournament.competition,
        bracketTournament.season,
      );

      router.push({
        pathname: "/game/basketball/[game]",
        params: {
          game: game.id,
          leagueId: String(league.id),
          data: encodeURIComponent(JSON.stringify(routePayload)),
        },
      });
    },
    [bracketTournament, router],
  );

  const gameById = useMemo<ReadonlyMap<string, BracketGame>>(() => {
    if (!bracketTournament) {
      return EMPTY_GAME_MAP;
    }

    return createBracketGameMap(bracketTournament);
  }, [bracketTournament]);

  const refreshControl = useMemo(() => {
    if (!onRefresh) {
      return undefined;
    }

    const indicatorColor = isDark ? Colors.white : Colors.black;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={indicatorColor}
        colors={[indicatorColor]}
      />
    );
  }, [handleRefresh, isDark, onRefresh, refreshing]);

  /*
   * Keep an existing bracket visible when a background refetch
   * starts. Only replace the content with a skeleton when no
   * tournament has loaded yet.
   */
  if (loading && !bracketTournament) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.verticalScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <TournamentBracketSkeleton isDark={isDark} />
      </ScrollView>
    );
  }

  /*
   * A refresh can fail while valid bracket data remains cached.
   * Only show the full error state when there is no tournament
   * available to display.
   */
  if (error && !bracketTournament) {
    return (
      <TournamentBracketEmptyState
        title="Bracket unavailable"
        message={error}
        isDark={isDark}
        onRetry={onRefresh ? handleRefresh : undefined}
      />
    );
  }

  if (!bracketTournament) {
    return (
      <TournamentBracketEmptyState
        title="No bracket selected"
        message="Tournament bracket data will appear here once it is available."
        isDark={isDark}
        onRetry={onRefresh ? handleRefresh : undefined}
      />
    );
  }

  const hasBracketData =
    bracketTournament.regions.length > 0 ||
    bracketTournament.openingRoundGames.length > 0 ||
    bracketTournament.finalFourGames.length > 0 ||
    Boolean(bracketTournament.championshipGame);

  if (!hasBracketData) {
    return (
      <TournamentBracketEmptyState
        title="Bracket not populated"
        message="Tournament games are unavailable for this bracket."
        isDark={isDark}
        onRetry={onRefresh ? handleRefresh : undefined}
      />
    );
  }

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.verticalScrollContent}
      refreshControl={refreshControl}
      nestedScrollEnabled
    >
      <TournamentBracketHeader tournament={bracketTournament} isDark={isDark} />

      <OpeningRoundSection
        label={bracketTournament.openingRoundLabel ?? "Opening Round"}
        games={bracketTournament.openingRoundGames}
        isDark={isDark}
        competition={bracketTournament.competition}
        regions={bracketTournament.regions}
        allGamesById={gameById}
        onGamePress={handleGamePress}
      />

      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <TournamentBracketCanvas
          tournament={bracketTournament}
          isDark={isDark}
          allGamesById={gameById}
          onGamePress={handleGamePress}
        />
      </ScrollView>
    </ScrollView>
  );
}
