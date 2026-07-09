import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { RefreshControl, ScrollView } from "react-native";
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
  isFinalBracketGame,
  isLiveBracketGame,
} from "./tournamentBracket.utils";

type RouteTeamPayload = {
  id: number;
  wid: number | null;
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

function getRouteTeamName(
  team: BracketTeam | null,
  fallbackName: string,
): string {
  return team?.shortName || team?.abbreviation || team?.name || fallbackName;
}

function toRouteTeam(
  team: BracketTeam | null,
  fallbackName: string,
): RouteTeamPayload {
  const displayName = getRouteTeamName(team, fallbackName);

  const id = toNumber(team?.id);
  const espnId = toNumber(team?.espnId) || id;

  return {
    id,
    wid: id || null,
    espnId,
    uid: String(team?.espnId ?? team?.id ?? ""),
    name: team?.name || displayName,
    shortName: displayName,
    code: team?.abbreviation || "TBD",
    city: "",
    state: "",
    location: "",
    logo: team?.logo ?? "",
    primaryColor: "",
    secondaryColor: "",
    nbaAPIID: 0,
    rank: team?.seed ?? 0,
    score: toNumber(team?.score),
    record: "",
    winner: team?.winner === true,
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
  const eventId = game.eventId ?? game.id;
  const date = game.date ?? "";

  const parsedTimestamp = date ? new Date(date).getTime() : 0;

  const timestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : 0;

  const topTeamName = game.topTeam?.name ?? game.topTeam?.shortName ?? "TBD";

  const bottomTeamName =
    game.bottomTeam?.name ?? game.bottomTeam?.shortName ?? "TBD";

  const topTeamAbbreviation =
    game.topTeam?.abbreviation ?? game.topTeam?.shortName ?? "TBD";

  const bottomTeamAbbreviation =
    game.bottomTeam?.abbreviation ?? game.bottomTeam?.shortName ?? "TBD";

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

    id: eventId,
    uid: eventId,

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
    home: toRouteTeam(game.bottomTeam, "Home Team"),

    away: toRouteTeam(game.topTeam, "Away Team"),

    isConferenceGame: false,
    isNeutralSite: true,
    attendance: 0,
    playByPlayAvailable: Boolean(eventId),
    recent: isLive,
    wasSuspended: false,

    raw: {
      eventId,
      competitionId: game.id,
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
  const tournamentKey = tournament
    ? `${tournament.tournamentId ?? tournament.tournamentName}-${tournament.season}`
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
      if (!tournament || !game.eventId || !canNavigateToBracketGame(game)) {
        return;
      }

      const league = getLeagueMetadata(tournament.competition);

      const routePayload = createRoutePayload(
        game,
        tournament.competition,
        tournament.season,
      );

      router.push({
        pathname: "/game/basketball/[game]",
        params: {
          game: game.eventId,
          leagueId: String(league.id),
          data: encodeURIComponent(JSON.stringify(routePayload)),
        },
      });
    },
    [router, tournament],
  );

  const gameById = useMemo<ReadonlyMap<string, BracketGame>>(() => {
    if (!tournament) {
      return EMPTY_GAME_MAP;
    }

    return createBracketGameMap(tournament);
  }, [tournament]);

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
  if (loading && !tournament) {
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
  if (error && !tournament) {
    return (
      <TournamentBracketEmptyState
        title="Bracket unavailable"
        message={error}
        isDark={isDark}
        onRetry={onRefresh ? handleRefresh : undefined}
      />
    );
  }

  if (!tournament) {
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
    tournament.regions.length > 0 ||
    tournament.openingRoundGames.length > 0 ||
    tournament.finalFourGames.length > 0 ||
    Boolean(tournament.championshipGame);

  if (!hasBracketData) {
    return (
      <TournamentBracketEmptyState
        title="Bracket not populated"
        message="The tournament is available, but games have not been assigned to the bracket yet."
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
      <TournamentBracketHeader tournament={tournament} isDark={isDark} />

      <OpeningRoundSection
        label={tournament.openingRoundLabel ?? "Opening Round"}
        games={tournament.openingRoundGames}
        isDark={isDark}
        competition={tournament.competition}
        regions={tournament.regions}
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
          tournament={tournament}
          isDark={isDark}
          allGamesById={gameById}
          onGamePress={handleGamePress}
        />
      </ScrollView>
    </ScrollView>
  );
}
