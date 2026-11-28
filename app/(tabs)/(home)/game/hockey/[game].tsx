import { CustomHeader } from "@/components/CustomHeader";
import FanPrediction from "@/components/FanPrediction/FanPrediction";
import {
  GameLiveChatOverlay,
  GameTeamStats,
  HeadCoaches,
  Highlights,
  LastFiveGames,
  LineScore,
  MatchupPredictor,
  TeamInjuries,
  Venue,
} from "@/components/Sports/Basketball/GameDetails";
import Officials from "@/components/Sports/Basketball/GameDetails/Officials";
import GameHeader from "@/components/Sports/Hockey/GameDetails/GameHeader";
import GameSummary from "@/components/Sports/Hockey/GameDetails/GameSummary";
import HockeyPlayByPlay from "@/components/Sports/Hockey/GameDetails/PlayByPlay/HockeyPlayByPlay";
import ShotChart from "@/components/Sports/Hockey/GameDetails/ShotChart";
import { Colors, globalStyles } from "@/constants/styles";
import { useLiveVotes } from "@/hooks/FanPredictionHooks/useLiveVotes";
import { useHockeyGameDetails } from "@/hooks/HockeyHooks/useHockeyGameDetails";
import { useLastFiveGames } from "@/hooks/useLastFiveGames";
import useTeams from "@/hooks/useTeams";
import { HockeyGameCardProps } from "@/types/hockey/hockey";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/common/dateUtils";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { GameHeaderPlaceholder } from "components/CustomHeader/GameHeaderPlaceholder";
import Odds from "components/Sports/Basketball/GameDetails/Odds";
import { getNHLTeam } from "constants/teamsNHL";
import { useNotifications } from "contexts/NotificationContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeather } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/team";
import { resolveImage } from "utils/customheader/utils";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games/games";
import { isGameFinalStatus } from "utils/games/gameStatus";
import {
  getFirstParam,
  parseGameParam,
} from "utils/navigation/gameRouteParams";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type HockeyGame = HockeyGameCardProps["game"];

export default function GameDetailsScreen(
  props: Partial<HockeyGameCardProps> = {},
) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = gameDetailsScreenStyles;
  const params = useLocalSearchParams<RouteParams>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { isGameNotified, openGameNotificationSettings } = useNotifications();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const routeGame = useMemo(() => {
    return (
      props.game ??
      parseGameParam<HockeyGame>(params.data) ??
      parseGameParam<HockeyGame>(params.game)
    );
  }, [params.data, params.game, props.game]);

  const routeLeague =
    getFirstParam(params.league) ?? getFirstParam(params.leagueId);
  const LEAGUE =
    routeGame?.league?.code ??
    (routeLeague === "91" || routeLeague === "mch"
      ? "mch"
      : routeLeague === "92" || routeLeague === "wch"
        ? "wch"
        : "nhl");
  const parsedGameId = Number(routeGame?.id ?? getFirstParam(params.game));
  const gameId =
    Number.isSafeInteger(parsedGameId) && parsedGameId > 0 ? parsedGameId : 0;
  const { details, score, warning, refresh } = useHockeyGameDetails(
    LEAGUE,
    gameId,
  );
  const game = useMemo(() => {
    if (routeGame) return routeGame;
    if (!score) return undefined;
    return {
      id: Number(score.gameId),
      odds: score.odds,
      league: { code: LEAGUE },
      date: score.date ?? "",
      home: { ...score.home, id: Number(score.home.id) },
      away: { ...score.away, id: Number(score.away.id) },
    };
  }, [LEAGUE, routeGame, score]);

  const chatDate = score?.date || game?.date;
  const gameDateObj = chatDate ? new Date(chatDate) : null;
  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);

  const home = game?.home;
  const away = game?.away;

  const homeId = home?.id ?? 0;
  const awayId = away?.id ?? 0;
  const homeTeam = score?.home ?? home;
  const awayTeam = score?.away ?? away;
  const { teamDetails: homeTeamDetails } = useTeams(LEAGUE, homeId);
  const { teamDetails: awayTeamDetails } = useTeams(LEAGUE, awayId);
  const localHome = LEAGUE === "nhl" ? getNHLTeam(homeId) : undefined;
  const localAway = LEAGUE === "nhl" ? getNHLTeam(awayId) : undefined;
  const homeLogoSource =
    homeTeam?.logo || home?.logo || homeTeamDetails?.logo || localHome?.logo;
  const awayLogoSource =
    awayTeam?.logo || away?.logo || awayTeamDetails?.logo || localAway?.logo;
  const homeHeaderSource =
    homeTeam?.logoDark ||
    home?.logoDark ||
    homeTeamDetails?.logoDark ||
    localHome?.logoLight ||
    homeLogoSource;
  const awayHeaderSource =
    awayTeam?.logoDark ||
    away?.logoDark ||
    awayTeamDetails?.logoDark ||
    localAway?.logoLight ||
    awayLogoSource;
  const homeHeaderLogo = useMemo(
    () => resolveImage(homeHeaderSource) ?? emptyHomeTeam.logo,
    [homeHeaderSource],
  );
  const awayHeaderLogo = useMemo(
    () => resolveImage(awayHeaderSource) ?? emptyAwayTeam.logo,
    [awayHeaderSource],
  );
  const homeLogo = isDark
    ? homeHeaderLogo
    : (resolveImage(homeLogoSource) ?? emptyHomeTeam.logo);
  const awayLogo = isDark
    ? awayHeaderLogo
    : (resolveImage(awayLogoSource) ?? emptyAwayTeam.logo);
  const awayCode = awayTeam?.code ?? "";
  const homeCode = homeTeam?.code ?? "";
  const awayColor = awayTeam?.primaryColor ?? Colors.midTone;
  const homeColor = homeTeam?.primaryColor ?? Colors.midTone;

  const homeLastGames = useLastFiveGames(homeId, "hockey", LEAGUE).games;
  const awayLastGames = useLastFiveGames(awayId, "hockey", LEAGUE).games;

  const homeCoach = homeTeamDetails?.coach;
  const awayCoach = awayTeamDetails?.coach;

  const isLoading = !score || !details || !game || !home || !away;
  const status = score?.status;
  const gameStatusDescription = status?.gameStatusDescription ?? "";
  const gameStatusDetail = status?.gameStatusDetail ?? "";
  const state = status?.state ?? null;
  const isFinal = isGameFinalStatus(status);
  const gameNotificationsEnabled = isGameNotified(
    "hockey",
    LEAGUE,
    gameId,
    homeId,
    awayId,
  );
  const plays = score?.plays;
  const lastPlay = score?.lastPlay;
  // const playerStats = score?.playerStats ?? [];
  const teamStats = score?.teamStats ?? [];
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isCanceled || isPostponed || isSuspended || isForfeited;
  const headline = details?.headline ?? holidayLabel;
  const broadcast = getBroadcastDisplay(details?.broadcasts);
  const period = formatPeriod({ period: score?.status.period, isNHL: true });
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const clock = score?.status.displayClock ?? "0:00";
  const homeScore = score?.home?.score ?? 0;
  const awayScore = score?.away?.score ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = score?.home?.records[0]?.summary ?? "0-0";
  const awayRecord = score?.away?.records[0]?.summary ?? "0-0";
  const homeTimeouts = score?.home?.timeouts;
  const awayTimeouts = score?.away.timeouts;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const {
    votes: liveVotes,
    castVote: castLiveVote,
    scoring,
    scoringError,
    retryScoring,
  } = useLiveVotes(gameId, {
    sport: "hockey",
    league: LEAGUE,
    state: state ?? undefined,
    date: game?.date ?? undefined,
  });

  const neutralSite = details?.neutralSite;
  const venue = details?.venueInfo;
  const { weather } = useWeather({
    lat: venue?.latitude,
    lon: venue?.longitude,
    location: venue?.address.city,
    date: gameDateObj,
  });
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName;
  const venueAddress =
    venue?.address.formatted ??
    (formatVenueAddress(venue?.address) || baseVenueAddress);
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images?.[0]?.href;
  const venueAttendance = details?.attendance ?? null;
  const venueCity = venue?.address.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.address.state ??
    venue?.address.country ??
    baseVenue?.address?.state ??
    baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  useLayoutEffect(() => {
    if (isLoading) {
      navigation.setOptions({ header: () => <GameHeaderPlaceholder /> });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Game"
          onBack={navigation.goBack}
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
                    "hockey",
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
    gameId,
    gameNotificationsEnabled,
    isFinal,
    isLoading,
    navigation,
    neutralSite,
    openGameNotificationSettings,
  ]);

  if (isLoading && (!gameId || warning)) {
    const global = globalStyles(isDark);
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Couldn’t load game details</Text>
        {gameId > 0 && (
          <Text
            accessibilityRole="button"
            style={global.text}
            onPress={refresh}
          >
            Try again
          </Text>
        )}
      </View>
    );
  }

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
        contentContainerStyle={navigationContentStyle(styles.container)}
        stickyHeaderIndices={[0]}
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
      >
        <GameHeader
          isHomeActive={homeTeamDetails?.isActive ?? false}
          isAwayActive={awayTeamDetails?.isActive ?? false}
          // Game details
          headline={headline}
          league={LEAGUE}
          date={formattedDate}
          time={formattedTime}
          broadcast={broadcast}
          isDark={isDark}
          // Away team
          awayId={awayId}
          awayName={awayCode}
          awayRank={score.away.rank ?? undefined}
          awayLogo={awayLogo}
          awayScore={awayScore}
          awayRecord={awayRecord}
          awayWins={awayWins}
          awayTimeouts={awayTimeouts}
          // Home team
          homeId={homeId}
          homeName={homeCode}
          homeRank={score.home.rank ?? undefined}
          homeLogo={homeLogo}
          homeScore={homeScore}
          homeRecord={homeRecord}
          homeWins={homeWins}
          homeTimeouts={homeTimeouts}
          // Live game state
          clock={clock}
          period={period}
          // Status
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
            <HockeyPlayByPlay
              plays={plays}
              lastPlay={lastPlay}
              homeId={homeId}
              awayId={awayId}
              state={state}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              homeColor={homeColor}
              awayColor={awayColor}
              gameStatus={score?.status}
              isDark={isDark}
            />

            <LineScore
              linescore={lineScore}
              homeCode={homeCode}
              awayCode={awayCode}
              league={LEAGUE}
              isDark={isDark}
              state={state}
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

            <Odds
              homeId={homeId}
              homeCode={homeCode}
              homeLogo={homeLogo}
              awayId={awayId}
              awayCode={awayCode}
              awayLogo={awayLogo}
              odds={
                details?.odds === undefined
                  ? (score?.odds ?? game?.odds)
                  : Array.isArray(details.odds)
                    ? null
                    : details.odds
              }
              isDark={isDark}
              state={state}
            />

            <ShotChart
              plays={plays}
              homeId={homeId}
              awayId={awayId}
              homeColor={homeColor}
              awayColor={awayColor}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              league={LEAGUE}
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

            <GameSummary
              league={LEAGUE}
              plays={plays}
              isDark={isDark}
              homeId={homeId}
              awayId={awayId}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
            />

            <LastFiveGames
              homeId={homeId}
              awayId={awayId}
              homeCode={homeCode}
              awayCode={awayCode}
              homeLogo={homeLogo}
              awayLogo={awayLogo}
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
              state={state}
            />

            <Officials officials={officials} isDark={isDark} state={state} />

            <Venue
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

      {!dontShowDetails && gameDateObj && (
        <GameLiveChatOverlay
          context={{
            sport: "hockey",
            league: LEAGUE,
            date: gameDateObj.toJSON() ?? undefined,
          }}
          gameId={String(gameId)}
          opacityAnim={opacityAnim}
          isLive={state === "in"}
        />
      )}
    </>
  );
}
