import { CustomHeader } from "@/components/CustomHeader";
import GameLeaders from "@/components/Sports/Football/GameDetails/GameLeaders";
import PlayByPlay from "@/components/Sports/Football/GameDetails/PlayByPlay/PlayByPlay";
import TeamDrives from "@/components/Sports/Football/GameDetails/TeamDrives";
import TeamScoringSummary from "@/components/Sports/Football/GameDetails/TeamScoringSummary";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballGameDetails } from "@/hooks/FootballHooks/useFootballGameDetails";
import useTeamDetails from "@/hooks/useTeams";
import { useVenue } from "@/hooks/useVenue";
import { FootballGameCardProps } from "@/types/football/football";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "@/utils/games";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import GameHeader from "components/Sports/Football/GameDetails/GameHeader";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLastFiveGames } from "hooks/FootballHooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeather } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import {
  formatDate,
  formatTime,
  getFootballSeason,
  getHolidayLabel,
  safeDate,
  shouldShowGameChat,
} from "utils/dateUtils";
import {
  FanPredictionVote,
  GameLiveChatOverlay,
  GameLocation,
  GameTeamStats,
  HeadCoaches,
  Highlights,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  Officials,
  TeamInjuries,
} from "../../../components/Sports/Basketball/GameDetails";

import type {
  FootballDrives,
  PlayObject,
} from "@/hooks/FootballHooks/useFootballGameDetails";

export const mockFootballPlay = {
  id: "40187327289",
  sequenceNumber: "8900",

  type: {
    id: "5",
    text: "Rush",
    abbreviation: "RUSH",
  },

  text: "J. Gibbs runs up the middle to DET 36 for 7 yards.",

  awayScore: 0,
  homeScore: 0,

  period: {
    number: 1,
  },

  clock: {
    displayValue: "14:21",
  },

  scoringPlay: false,
  priority: false,
  isPenalty: false,
  isTurnover: false,
  statYardage: 7,

  start: {
    down: 2,
    distance: 10,
    yardLine: 15,
    yardsToEndzone: 15,
    downDistanceText: "4th & 10 at DET 29",
    shortDownDistanceText: "4th & 10",
    possessionText: "DET 20",

    team: {
      id: 7,
      espnId: 8,
      name: "Detroit Lions",
      fullName: "Detroit Lions",
      displayName: "Detroit Lions",
      shortName: "Lions",
      shortDisplayName: "Lions",
      abbreviation: "DET",
      code: "DET",
      location: "Detroit, MI",
      city: "Detroit",
      color: "#0076B6",
      alternateColor: "#B0B7BC",
      primaryColor: "#0076B6",
      secondaryColor: "#B0B7BC",
    },
  },

  end: {
    down: 3,
    distance: 10,
    yardLine: 15,
    yardsToEndzone: 15,
    downDistanceText: "3rd & 3 at DET 36",
    shortDownDistanceText: "3rd & 3",
    possessionText: "DET 36",

    team: {
      id: 7,
      espnId: 8,
      name: "Detroit Lions",
      fullName: "Detroit Lions",
      displayName: "Detroit Lions",
      shortName: "Lions",
      shortDisplayName: "Lions",
      abbreviation: "DET",
      code: "DET",
      location: "Detroit, MI",
      city: "Detroit",
      color: "#0076B6",
      alternateColor: "#B0B7BC",
      primaryColor: "#0076B6",
      secondaryColor: "#B0B7BC",
    },
  },

  teamParticipants: [],
} as unknown as PlayObject;

export const mockFootballDrives = {
  current: [
    {
      id: "mock-drive-1",
      description: "6 plays, 48 yards, 3:24",
      team: mockFootballPlay.start?.team,
      start: {
        period: {
          type: "quarter",
          number: 1,
        },
        clock: {
          displayValue: "15:00",
        },
        yardLine: 80,
        text: "DET 20",
      },
      end: {
        period: {
          type: "quarter",
          number: 1,
        },
        clock: {
          displayValue: "14:21",
        },
        yardLine: 64,
        text: "DET 36",
      },
      timeElapsed: {
        displayValue: "0:39",
      },
      yards: 16,
      isScore: false,
      offensivePlays: 2,
      result: null,
      shortDisplayResult: null,
      displayResult: null,
      plays: [mockFootballPlay],
    },
  ],
  previous: [],
} as unknown as FootballDrives;

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type FootballGame = FootballGameCardProps["game"];

function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseGameParam(value?: string | string[]): FootballGame | undefined {
  const rawValue = getFirstParam(value);

  if (!rawValue || rawValue === "undefined" || rawValue === "null") {
    return undefined;
  }

  const decodedValue = safeDecode(rawValue).trim();

  // Dynamic route params are often just the game id.
  // Only JSON strings should be parsed into a full game object.
  if (!decodedValue.startsWith("{")) {
    return undefined;
  }

  try {
    return JSON.parse(decodedValue) as FootballGame;
  } catch {
    return undefined;
  }
}

export default function GameDetailsScreen(
  props: Partial<FootballGameCardProps> = {},
) {
  const styles = gameDetailsScreenStyles;
  const params = useLocalSearchParams<RouteParams>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const game = useMemo(() => {
    return (
      props.game ?? parseGameParam(params.data) ?? parseGameParam(params.game)
    );
  }, [params.data, params.game, props.game]);

  const currentSeason = getFootballSeason();
  const LEAGUE = game?.league?.code ?? "nfl";
  const isCFB = LEAGUE === "cfb";
  const isUFL = LEAGUE === "ufl";

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game?.date]);

  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const showGameChat = shouldShowGameChat(gameDateObj);
  const holidayLabel = getHolidayLabel(gameDate);
  const gameId = game?.id ?? 0;

  const home = game?.home;
  const away = game?.away;

  const homeId = home?.id ?? 0;
  const awayId = away?.id ?? 0;

  const homeTeam = isUFL
    ? getUFLTeam(homeId)
    : isCFB
      ? getCFBTeam(homeId)
      : getNFLTeam(homeId);

  const awayTeam = isUFL
    ? getUFLTeam(awayId)
    : isCFB
      ? getCFBTeam(awayId)
      : getNFLTeam(awayId);

  const homeLogo = isUFL
    ? getUFLTeamLogo(homeId, isDark)
    : isCFB
      ? getCFBTeamLogo(homeId, isDark)
      : getNFLTeamLogo(homeId, isDark);

  const awayLogo = isUFL
    ? getUFLTeamLogo(awayId, isDark)
    : isCFB
      ? getCFBTeamLogo(awayId, isDark)
      : getNFLTeamLogo(awayId, isDark);

  const homeHeaderLogo = isUFL
    ? getUFLTeamLogo(homeId, true)
    : isCFB
      ? getCFBTeamLogo(homeId, true)
      : getNFLTeamLogo(homeId, true);

  const awayHeaderLogo = isUFL
    ? getUFLTeamLogo(awayId, true)
    : isCFB
      ? getCFBTeamLogo(awayId, true)
      : getNFLTeamLogo(awayId, true);

  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const homeName = useMemo(() => homeTeam?.name ?? "", [homeTeam?.name]);
  const awayName = useMemo(() => awayTeam?.name ?? "", [awayTeam?.name]);

  const awayColor = useMemo(() => awayTeam?.color ?? "", [awayTeam?.color]);
  const homeColor = useMemo(() => homeTeam?.color ?? "", [homeTeam?.color]);

  const { teamDetails: homeTeamDetails } = useTeamDetails(LEAGUE, homeId);
  const { teamDetails: awayTeamDetails } = useTeamDetails(LEAGUE, awayId);
  const homeCoach = homeTeamDetails?.coach;
  const awayCoach = awayTeamDetails?.coach;

  const homeLastGames = useLastFiveGames(homeId, LEAGUE, currentSeason).games;
  const awayLastGames = useLastFiveGames(awayId, LEAGUE, currentSeason).games;
  const { score, details, loading } = useFootballGameDetails(LEAGUE, gameId);

  const isLoading = loading || !game || !home || !away || !score || !details;

  const state = score?.status.state ?? "pre";
  const gameStatusDescription = score?.status.gameStatusDescription ?? "";
  const gameStatusDetail = score?.status.shortDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isDelayed || isCanceled || isPostponed || isSuspended || isForfeited;
  const clock = score?.status.displayClock ?? "0:00";
  const period = formatPeriod({ period: score?.status.period });
  const redzone = game?.situation?.isRedZone ?? false;
  const headline = details?.headline ?? holidayLabel;
  const broadcast = getBroadcastDisplay(details?.broadcasts) ?? "";

  const scoringPlays = score?.scoringPlays;
  const lastPlay = score?.lastPlay ?? null;
  const drives = score?.drives;
  const currentDrives = drives?.current ?? [];
  const previousDrives = drives?.previous ?? [];
  const fieldPlay = useMemo(() => {
    const plays = score?.plays ?? [];
    const currentDrives = score?.drives?.current ?? [];
    const previousDrives = score?.drives?.previous ?? [];

    if (lastPlay) {
      return lastPlay;
    }

    if (plays.length > 0) {
      return plays[plays.length - 1];
    }

    for (let index = currentDrives.length - 1; index >= 0; index -= 1) {
      const drivePlays = currentDrives[index]?.plays ?? [];

      if (drivePlays.length > 0) {
        return drivePlays[drivePlays.length - 1];
      }
    }

    for (let index = previousDrives.length - 1; index >= 0; index -= 1) {
      const drivePlays = previousDrives[index]?.plays ?? [];

      if (drivePlays.length > 0) {
        return drivePlays[drivePlays.length - 1];
      }
    }

    return null;
  }, [lastPlay, score?.plays, score?.drives]);

  const downDistance = currentDrives[0]?.end?.downDistanceText;

  const homeHasPossession = score?.home?.possession ?? false;
  const awayHasPossession = score?.away?.possession ?? false;

  const homeTimeouts = score?.home?.timeouts;
  const awayTimeouts = score?.away?.timeouts;
  const homeRecord = score?.home.record;
  const awayRecord = score?.away.record;
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const homeScore = score?.home.score ?? 0;
  const awayScore = score?.away.score ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = homeScore === awayScore;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeRank = score?.home?.rank;
  const awayRank = score?.away?.rank;
  const officials = details?.officials ?? [];
  const highlights = details?.highlights;
  const injuries = details?.injuries ?? [];
  const leaders = score?.leaders;
  const teamStats = score?.boxScore?.teams ?? [];
  const neutralSite = details?.neutralSite;
  const venueId = Number(details?.venue?.id);
  const baseVenue = details?.venue;
  const { venue } = useVenue({ sport: "football", id: venueId });
  const { weather } = useWeather({
    lat: Number(venue?.latitude),
    lon: Number(venue?.longitude),
    location: venue?.city,
    date: gameDateObj,
  });

  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName ?? null;
  const venueAddress = venue?.address ?? baseVenueAddress;
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images?.[0]?.href ?? null;
  const venueAttendance = details?.attendance ?? null;
  const venueSurface = baseVenue?.grass;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  useLayoutEffect(() => {
    if (isLoading || !game || !home || !away) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Game"
          onBack={goBack}
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeColor={homeColor}
          awayColor={awayColor}
          isNeutralSite={neutralSite}
        />
      ),
    });
  }, [
    LEAGUE,
    away,
    awayId,
    awayCode,
    game,
    awayHeaderLogo,
    homeHeaderLogo,
    home,
    homeId,
    homeCode,
    awayColor,
    homeColor,
    isLoading,
    navigation,
    neutralSite,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (!game || !homeTeam || !awayTeam) return <View />;

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          // Game details
          headline={headline}
          league={LEAGUE}
          state={state}
          date={formattedDate}
          time={formattedTime}
          broadcast={broadcast}
          isDark={isDark}
          // Away team
          awayId={awayId}
          awayName={awayCode}
          awayLogo={awayLogo}
          awayRank={awayRank}
          awayScore={awayScore}
          awayWins={awayWins}
          awayRecord={awayRecord}
          awayTimeouts={awayTimeouts}
          awayPossession={awayHasPossession}
          // Home team
          homeId={homeId}
          homeName={homeCode}
          homeLogo={homeLogo}
          homeRank={homeRank}
          homeScore={homeScore}
          homeWins={homeWins}
          homeRecord={homeRecord}
          homeTimeouts={homeTimeouts}
          homePossession={homeHasPossession}
          // Live game state
          clock={clock}
          period={period}
          downDistance={downDistance}
          redzone={redzone}
          isTie={isTie}
          // Status
          gameStatusShortDetail={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <FanPredictionVote
              gameId={gameId}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayHeaderLogo}
              awayColor={awayColor}
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeHeaderLogo}
              homeColor={homeColor}
              state={state}
            />

            <PlayByPlay
              width={420}
              height={130}
              awayCode={awayCode}
              homeCode={homeCode}
              awayName={awayName}
              homeName={homeName}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayTeamId={awayId}
              homeTeamId={homeId}
              awayColor={awayColor}
              homeColor={homeColor}
              drives={drives}
              play={fieldPlay}
              showPlay={Boolean(fieldPlay)}
              isDark={isDark}
              state={state}
              league={LEAGUE}
              neutralSite={neutralSite}
            />

            <MatchupPredictor
              homeCode={homeCode}
              homeLogo={homeLogo}
              homeChance={homeChance}
              homeColor={homeColor}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayChance={awayChance}
              awayColor={awayColor}
              size={180}
              isDark={isDark}
              state={state}
            />

            <GameTeamStats
              stats={teamStats}
              awayName={awayCode}
              awayLogo={awayLogo}
              awayColor={awayColor}
              homeName={homeCode}
              homeLogo={homeLogo}
              homeColor={homeColor}
              league={LEAGUE}
              state={state}
              isDark={isDark}
            />

            <GameLeaders
              leaders={leaders}
              awayId={awayId}
              homeId={homeId}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayCode={awayCode}
              homeCode={homeCode}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <TeamDrives
              previousDrives={previousDrives}
              currentDrives={currentDrives}
              awayId={awayId}
              homeId={homeId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              league={LEAGUE}
              isDark={isDark}
              state={state}
            />

            <TeamScoringSummary
              scoringPlays={scoringPlays}
              homeId={homeId}
              awayId={awayId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <LastFiveGames
              homeId={homeId}
              awayId={awayId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeGames={homeLastGames}
              awayGames={awayLastGames}
              league={LEAGUE}
              state={state}
              isDark={isDark}
            />

            <Highlights highlights={highlights} isDark={isDark} />

            <TeamInjuries
              injuries={injuries}
              homeId={homeId}
              awayId={awayId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
              state={state}
              league={LEAGUE}
            />

            <HeadCoaches
              homeCode={homeCode}
              awayCode={awayCode}
              homeCoach={homeCoach}
              awayCoach={awayCoach}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
            />

            <Officials officials={officials} isDark={isDark} state={state} />

            <GameLocation
              venueImage={venueImage}
              venueName={venueName}
              location={venueLocation}
              address={venueAddress}
              venueCapacity={venueCapacity}
              venueAttendance={venueAttendance}
              weather={weather}
              grass={venueSurface}
              surface={"football"}
              isDark={isDark}
            />
          </View>
        )}
      </ScrollView>

      {!dontShowDetails && showGameChat && (
        <GameLiveChatOverlay
          gameId={String(gameId)}
          opacityAnim={opacityAnim}
          state={state}
        />
      )}
    </>
  );
}
