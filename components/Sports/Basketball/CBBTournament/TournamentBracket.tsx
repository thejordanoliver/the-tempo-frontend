import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";
import type {
  BracketGame,
  BracketTeam,
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
import { TournamentBracketCanvas } from "./TournamentBracketCanvas";
import { TournamentBracketEmptyState } from "./TournamentBracketEmptyState";
import { TournamentBracketHeader } from "./TournamentBracketHeader";
import { TournamentBracketSkeleton } from "./TournamentBracketSkeleton";

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

const CBB_LEAGUE_METADATA: LeagueRouteMetadata = {
  id: 10,
  uid: "cbb",
  code: "cbb",
  name: "Men's College Basketball",
  slug: "mens-college-basketball",
};

const WCBB_LEAGUE_METADATA: LeagueRouteMetadata = {
  id: 54,
  uid: "wcbb",
  code: "wcbb",
  name: "Women's College Basketball",
  slug: "womens-college-basketball",
};

const EMPTY_GAME_MAP: ReadonlyMap<string, BracketGame> = new Map<
  string,
  BracketGame
>();

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

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
  const displayTeam = getRenderableBracketTeam(team);

  return (
    displayTeam?.shortName ||
    displayTeam?.abbreviation ||
    displayTeam?.name ||
    fallbackName
  );
}

/* -------------------------------------------------------------------------- */
/*                              Route Team Payload                            */
/* -------------------------------------------------------------------------- */

function toRouteTeam(
  team: BracketTeam | null,
  fallbackName: string,
): RouteTeamPayload {
  const displayTeam = getRenderableBracketTeam(team);

  const displayName = getRouteTeamName(displayTeam, fallbackName);

  const id = toNumber(displayTeam?.id);

  const espnId = id;

  return {
    id,

    /*
     * The tournament bracket currently resolves teams directly
     * from the bracket/ESPN payload instead of the local CBB DB.
     */
    databaseId: null,

    espnId,

    uid: String(espnId || displayTeam?.id || ""),

    name: displayTeam?.name ?? displayName,

    shortName: displayTeam?.shortName ?? displayName,

    code: displayTeam?.abbreviation ?? "TBD",

    city: "",
    state: "",
    location: "",

    logo: displayTeam?.logo ?? "",

    primaryColor: "",
    secondaryColor: "",

    nbaAPIID: 0,

    rank: displayTeam?.seed ?? 0,

    score: toNumber(displayTeam?.score),

    record: "",

    winner: displayTeam?.winner === true,
  };
}

/* -------------------------------------------------------------------------- */
/*                                Route Status                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Game Route Payload                            */
/* -------------------------------------------------------------------------- */

function createRoutePayload(
  game: BracketGame,
  season: number,
  competition: "cbb" | "wcbb",
): RouteGamePayload {
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

  const leagueMetadata =
    competition === "wcbb" ? WCBB_LEAGUE_METADATA : CBB_LEAGUE_METADATA;

  return {
    league: leagueMetadata,

    id: gameId,
    uid: gameId,

    name: `${topTeamName} vs ${bottomTeamName}`,

    shortName: `${topTeamAbbreviation} VS ${bottomTeamAbbreviation}`,

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
     * The bracket uses visual top/bottom positions.
     *
     * Keep bottom mapped to home and top mapped to away
     * because the basketball game route expects that shape.
     */
    home: toRouteTeam(bottomTeam, "Home Team"),

    away: toRouteTeam(topTeam, "Away Team"),

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

/* ========================================================================== */
/*                            Tournament Bracket                              */
/* ========================================================================== */

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

  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);

  const horizontalScrollRef = useRef<ScrollView>(null);

  /* ------------------------------------------------------------------------ */
  /*                         Normalized Tournament                            */
  /* ------------------------------------------------------------------------ */

  const bracketTournament = useMemo(
    () => (tournament ? normalizeTournamentForBracket(tournament) : null),
    [tournament],
  );

  const tournamentKey = bracketTournament
    ? `${
        bracketTournament.tournamentId ?? bracketTournament.tournamentName
      }-${bracketTournament.season}`
    : null;

  /* ------------------------------------------------------------------------ */
  /*                            Reset Scrolling                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!tournamentKey) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      horizontalScrollRef.current?.scrollTo({
        x: 0,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [tournamentKey]);

  /* ------------------------------------------------------------------------ */
  /*                                Refresh                                   */
  /* ------------------------------------------------------------------------ */

  const handleRefresh = useCallback(() => {
    if (!onRefresh || refreshing) {
      return;
    }

    void onRefresh();
  }, [onRefresh, refreshing]);

  /* ------------------------------------------------------------------------ */
  /*                            Game Navigation                               */
  /* ------------------------------------------------------------------------ */

  const handleGamePress = useCallback(
    (game: BracketGame) => {
      if (!bracketTournament || !canNavigateToBracketGame(game)) {
        return;
      }

      const routePayload = createRoutePayload(
        game,
        bracketTournament.season,
        bracketTournament.competition,
      );

      router.push({
        pathname: "/game/basketball/[game]",

        params: {
          game: game.id,

          leagueId: String(
            bracketTournament.competition === "wcbb"
              ? WCBB_LEAGUE_METADATA.id
              : CBB_LEAGUE_METADATA.id,
          ),

          data: encodeURIComponent(JSON.stringify(routePayload)),
        },
      });
    },
    [bracketTournament, router],
  );

  /* ------------------------------------------------------------------------ */
  /*                                Game Map                                  */
  /* ------------------------------------------------------------------------ */

  const gameById = useMemo<ReadonlyMap<string, BracketGame>>(() => {
    if (!bracketTournament) {
      return EMPTY_GAME_MAP;
    }

    return createBracketGameMap(bracketTournament);
  }, [bracketTournament]);

  /* ------------------------------------------------------------------------ */
  /*                            Refresh Control                               */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /*                               Loading                                    */
  /* ------------------------------------------------------------------------ */

  /*
   * Keep an existing bracket visible during background refreshes.
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

  /* ------------------------------------------------------------------------ */
  /*                                 Error                                    */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /*                               No Bracket                                 */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /*                             Empty Bracket                                */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /*                                 Render                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.verticalScrollContent}
      refreshControl={refreshControl}
      nestedScrollEnabled
    >
      <TournamentBracketHeader tournament={bracketTournament} isDark={isDark} />

      <ScrollView
        ref={horizontalScrollRef}
        horizontal
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
