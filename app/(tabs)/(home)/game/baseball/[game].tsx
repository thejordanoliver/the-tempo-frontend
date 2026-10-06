import BoxScore from "@/components/Sports/Baseball/GameDetails/BoxScore";
import GameLeaders from "@/components/Sports/Baseball/GameDetails/GameLeaders";
import PlayByPlay from "@/components/Sports/Baseball/GameDetails/PlayByPlay/PlayByPlay";
import { useLiveVotes } from "@/hooks/useLiveVotes";
import useTeamDetails from "@/hooks/useTeams";
import { useVenue } from "@/hooks/useVenue";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/dateUtils";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeader } from "components/CustomHeader";
import GameHeader from "components/Sports/Baseball/GameDetails/GameHeader";
import {
  FanPrediction,
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
} from "components/Sports/Basketball/GameDetails";
import { Colors } from "constants/styles";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { useNotifications } from "contexts/NotificationContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import {
  type BaseballPlay,
  useBaseballGameDetails,
} from "hooks/BaseballHooks/useBaseballGameDetails";
import { useGameChatAvailability } from "hooks/useGameChatAvailability";
import { useLastFiveGames } from "hooks/useLastFiveGames";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeather } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { BaseballGameCardProps } from "types/baseball/baseball";
import { formatVenueAddress, getBroadcastDisplay } from "utils/games";
import { isGameFinalStatus } from "utils/gameStatus";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type BaseballGame = BaseballGameCardProps["game"];

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

function parseGameParam(value?: string | string[]): BaseballGame | undefined {
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
    return JSON.parse(decodedValue) as BaseballGame;
  } catch {
    return undefined;
  }
}

export default function GameDetailsScreen(
  props: Partial<BaseballGameCardProps> = {},
) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = gameDetailsScreenStyles;
  const params = useLocalSearchParams<RouteParams>();
  const { resolvedColorScheme } = usePreferences();
  const { isGameNotified, openGameNotificationSettings } = useNotifications();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const game = useMemo(() => {
    return (
      props.game ?? parseGameParam(params.data) ?? parseGameParam(params.game)
    );
  }, [params.data, params.game, props.game]);

  const LEAGUE = game?.league?.code ?? "mlb";
  const isCB = LEAGUE === "cb";
  const isSB = LEAGUE === "sb";
  const gameId = Number(game?.id) ?? 0;

  const { details, score } = useBaseballGameDetails(LEAGUE, gameId);

  const gameDateObj = score?.date ? new Date(score.date) : null;
  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = game?.headline ?? holidayLabel;
  const showGameChat = useGameChatAvailability(gameDateObj);

  const home = game?.home;
  const away = game?.away;

  const homeId = Number(home?.id ?? 0);
  const awayId = Number(away?.id ?? 0);

  const homeTeam = isSB
    ? getSBTeam(homeId)
    : isCB
      ? getCBTeam(homeId)
      : getMLBTeam(homeId);

  const awayTeam = isSB
    ? getSBTeam(awayId)
    : isCB
      ? getCBTeam(awayId)
      : getMLBTeam(awayId);

  const homeCode = useMemo(
    () => homeTeam?.code ?? home?.code ?? "",
    [homeTeam?.code, home?.code],
  );
  const awayCode = useMemo(
    () => awayTeam?.code ?? away?.code ?? "",
    [awayTeam?.code, away?.code],
  );
  const homeName = useMemo(
    () => homeTeam?.fullName ?? home?.name ?? "",
    [homeTeam?.fullName, home?.name],
  );
  const awayName = useMemo(
    () => awayTeam?.fullName ?? away?.name ?? "",
    [awayTeam?.fullName, away?.name],
  );

  const homeLogo = isSB
    ? getSBTeamLogo(homeId, isDark)
    : isCB
      ? getCBTeamLogo(homeId, isDark)
      : getMLBTeamLogo(homeId, isDark);

  const awayLogo = isSB
    ? getSBTeamLogo(awayId, isDark)
    : isCB
      ? getCBTeamLogo(awayId, isDark)
      : getMLBTeamLogo(awayId, isDark);

  const homeHeaderLogo = isSB
    ? getSBTeamLogo(homeId, true)
    : isCB
      ? getCBTeamLogo(homeId, true)
      : getMLBTeamLogo(homeId, true);

  const awayHeaderLogo = isSB
    ? getSBTeamLogo(awayId, isDark)
    : isCB
      ? getCBTeamLogo(awayId, true)
      : getMLBTeamLogo(awayId, true);

  const awayColor =
    awayTeam?.color ??
    away?.primaryColor ??
    away?.secondaryColor ??
    Colors.midTone;

  const homeColor =
    homeTeam?.color ??
    home?.primaryColor ??
    home?.secondaryColor ??
    Colors.midTone;

  const { teamDetails: homeTeamDetails } = useTeamDetails(LEAGUE, homeId);
  const { teamDetails: awayTeamDetails } = useTeamDetails(LEAGUE, awayId);
  const {
    votes: liveVotes,
    castVote: castLiveVote,
    scoring,
    scoringError,
    retryScoring,
  } = useLiveVotes(gameId, {
    sport: "baseball",
    league: LEAGUE,
    state: score?.status?.state ?? undefined,
    date: game?.date ?? undefined,
  });
  const homeLastGames = useLastFiveGames(homeId, "baseball", LEAGUE).games;
  const awayLastGames = useLastFiveGames(awayId, "baseball", LEAGUE).games;

  const homeCoach = homeTeamDetails?.coach;
  const awayCoach = awayTeamDetails?.coach;

  const broadcast = getBroadcastDisplay(details?.broadcasts);

  const state = score?.status.state ?? null;
  const isFinal = isGameFinalStatus(score?.status);
  const gameNotificationsEnabled = isGameNotified(
    "baseball",
    LEAGUE,
    gameId,
    homeId,
    awayId,
  );
  const gameStatusDescription = score?.status.gameStatusDescription ?? "";
  const gameStatusDetail = score?.status.shortDetail ?? "";
  const isTopInning = gameStatusDetail.includes("Top");
  const isBottomInning = gameStatusDetail.includes("Bot");

  const homeScore = score?.home.score ?? 0;
  const awayScore = score?.away.score ?? 0;
  const homeWins = score?.home?.winner ?? false;
  const awayWins = score?.away?.winner ?? false;

  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isCanceled || isPostponed || isSuspended || isForfeited;

  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const outs = score?.situation.outs ?? 0;

  const bases = {
    onFirst: score?.situation.bases.onFirst ?? false,
    onSecond: score?.situation.bases.onSecond ?? false,
    onThird: score?.situation.bases?.onThird ?? false,
  };

  const homeHits = score?.home.hits;
  const homeErrors = score?.home.errors;
  const awayHits = score?.away.hits;
  const awayErrors = score?.away.errors;
  const homeRuns = score?.home.score;
  const awayRuns = score?.away.score;
  const homeRecord = home?.record ?? "0—0";
  const awayRecord = away?.record ?? "0—0";
  const homeRank = home?.homeRank;
  const awayRank = away?.awayRank;
  const plays = score?.plays ?? [];
  const situation = score?.situation ?? null;
  const fieldPlay = useMemo<BaseballPlay | null>(() => {
    const plays = score?.plays ?? [];

    return (
      score?.lastPlay ?? (plays.length > 0 ? plays[plays.length - 1] : null)
    );
  }, [score?.lastPlay, score?.plays]);

  const teamStats = score?.teamStats ?? [];
  const leaders = score?.leaders ?? [];
  const playerStats = score?.playerStats ?? [];
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const injuries = details?.injuries ?? [];

  const neutralSite = details?.neutralSite;
  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "baseball", id: venueId });
  const { weather } = useWeather({
    lat: Number(venue?.latitude),
    lon: Number(venue?.longitude),
    location: venue?.city,
    date: gameDateObj,
  });

  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName;
  const venueAddress = venue?.address ?? baseVenueAddress;
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images[0]?.href;
  const venueAttendance = game?.attendance || null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  const isLoading = !score || !details || !homeLastGames || !awayLastGames;

  useLayoutEffect(() => {
    if (isLoading) {
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
          league={LEAGUE}
          isNotified={gameNotificationsEnabled}
          onToggleNotifications={
            isFinal
              ? undefined
              : () =>
                  openGameNotificationSettings(
                    "baseball",
                    LEAGUE,
                    gameId,
                    homeId,
                    awayId,
                  )
          }
        />
      ),
    });
  }, [
    LEAGUE,
    awayCode,
    awayId,
    game,
    awayHeaderLogo,
    homeHeaderLogo,
    homeCode,
    homeId,
    awayColor,
    homeColor,
    gameId,
    gameNotificationsEnabled,
    isFinal,
    isLoading,
    navigation,
    neutralSite,
    openGameNotificationSettings,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (!game) return <View />;

  return (
    <>
      <ScrollView
        contentContainerStyle={navigationContentStyle(styles.container)}
        stickyHeaderIndices={[0]}
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
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
          awayRecord={awayRecord}
          awayWins={awayWins}
          // Home team
          homeId={homeId}
          homeName={homeCode}
          homeLogo={homeLogo}
          homeRank={homeRank}
          homeScore={homeScore}
          homeRecord={homeRecord}
          homeWins={homeWins}
          // Live game state
          isTopInning={isTopInning}
          isBottomInning={isBottomInning}
          outs={outs}
          bases={bases}
          // Status
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <PlayByPlay
              width={420}
              awayCode={awayCode}
              homeCode={homeCode}
              venueId={venueId}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              awayTeamId={awayId}
              homeTeamId={homeId}
              play={fieldPlay}
              plays={plays}
              situation={situation}
              state={state}
              isDark={isDark}
            />

            <FanPrediction
              scoring={scoring}
              scoringError={scoringError}
              retryScoring={retryScoring}
              votes={liveVotes}
              castVote={castLiveVote}
              gameId={gameId}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayColor={awayColor}
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeLogo}
              homeColor={homeColor}
              state={state}
            />

            <MatchupPredictor
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeLogo}
              homeHeaderLogo={homeHeaderLogo}
              homeChance={homeChance}
              homeColor={homeColor}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayLogo}
              awayHeaderLogo={awayHeaderLogo}
              awayChance={awayChance}
              awayColor={awayColor}
              size={180}
              isDark={isDark}
              state={state}
            />

            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              homeHits={homeHits}
              awayHits={awayHits}
              homeRuns={homeRuns}
              awayRuns={awayRuns}
              awayErrors={awayErrors}
              homeErrors={homeErrors}
              isDark={isDark}
              state={state}
              league={LEAGUE}
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
              homeId={homeId}
              homeLogo={homeLogo}
              awayId={awayId}
              awayLogo={awayLogo}
              state={state}
              isDark={isDark}
            />

            <BoxScore
              awayTeamId={awayId}
              homeTeamId={homeId}
              awayName={awayName}
              homeName={homeName}
              awayLogo={awayLogo}
              homeLogo={homeLogo}
              playerStats={playerStats}
              state={state}
              isDark={isDark}
            />

            <Highlights highlights={highlights} isDark={isDark} />

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
              awayCode={awayName}
              homeCoach={homeCoach}
              awayCoach={awayCoach}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              isDark={isDark}
              state={state}
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
