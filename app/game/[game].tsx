import TeamInjuries from "@/components/Sports/Baseball/GameDetails/InjuryReport/TeamInjuries";
import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useBasketballGameDetails } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import { useVenue } from "@/hooks/useVenue";
import { BasketballGameCardProps } from "@/types/basketball/basketball";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  BoxScore,
  FanPredictionVote,
  GameHeader,
  GameLocation,
  HighlightVideoList,
  LastFiveGames,
  LastPlay,
  LineScore,
  MatchupPredictor,
  Officials,
  PlayersInFoulTrouble,
  PlayersOnCourt,
  ShotChart,
} from "components/Sports/NBA/GameDetails";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamBySummerId, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeather } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "utils/dateUtils";
import {
  formatPeriod,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games";
import GameTeamStats from "../../components/Sports/NBA/GameDetails/GameTeamStats";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type BasketballGame = BasketballGameCardProps["game"];

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

function parseGameParam(value?: string | string[]): BasketballGame | undefined {
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
    return JSON.parse(decodedValue) as BasketballGame;
  } catch {
    return undefined;
  }
}

export default function GameDetailsScreen(
  props: Partial<BasketballGameCardProps> = {},
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

  const LEAGUE = game?.league?.code ?? "NBA";
  const isSummerLeague =
    LEAGUE === "summercalifornia" ||
    LEAGUE === "summervegas" ||
    LEAGUE === "summerutah";

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game?.date]);

  const gameId = game?.id ?? "";

  const home = game?.home;
  const away = game?.away;

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;
  const homeTeam = isSummerLeague
    ? getTeamBySummerId(homeId)
    : getNBATeam(homeId);
  const awayTeam = isSummerLeague
    ? getTeamBySummerId(awayId)
    : getNBATeam(awayId);

  const homeCode = homeTeam?.code ?? "";
  const awayCode = awayTeam?.code ?? "";
  const homeEspnId = homeTeam?.espnId ?? 0;
  const awayEspnId = awayTeam?.espnId ?? 0;
  const awayName = awayTeam?.fullName ?? "";
  const homeName = homeTeam?.fullName ?? "";
  const awayColor = awayTeam?.color ?? Colors.midTone;
  const homeColor = homeTeam?.color ?? Colors.midTone;

  const homeLogo = getTeamLogo(homeId, isDark);
  const awayLogo = getTeamLogo(awayId, isDark);
  const homeHeaderLogo = getTeamLogo(homeId, true);
  const awayHeaderLogo = getTeamLogo(awayId, true);

  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);

  const homeLastGames = useLastFiveGames(homeId, "basketball", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "basketball", LEAGUE);

  const { details, score } = useBasketballGameDetails(LEAGUE, gameId);
  const isLoading = !score || !details;
  const homeScore = score?.home.score ?? 0;
  const awayScore = score?.away.score ?? 0;
  const homeWins = score?.home.winner ?? false;
  const awayWins = score?.away.winner ?? false;
  const homeRecord = score?.home?.record ?? "0-0";
  const awayRecord = score?.away?.record ?? "0-0";
  const homeRank = details?.homeRank ?? null;
  const awayRank = details?.awayRank ?? null;
  const homeTimeouts = score?.home?.timeouts ?? 0;
  const awayTimeouts = score?.away?.timeouts ?? 0;
  const gameStatusDescription = score?.status.gameStatusDescription ?? "";
  const state = score?.status.state ?? null;
  const gameStatusDetail = score?.status.gameStatusDetail ?? "";
  const period = formatPeriod({ period: game?.status.period });
  const clock = score?.status.displayClock ?? "0:00";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isDelayed || isCanceled || isPostponed || isSuspended || isForfeited;
  const homeBonus = score?.home?.fouls?.bonusState ?? null;
  const awayBonus = score?.away?.fouls?.bonusState ?? null;

  const plays = score?.plays ?? [];
  const foulTrouble = score?.foulTrouble ?? [];
  const highlights = details?.highlights ?? [];
  const injuries = details?.injuries ?? [];
  const officials = details?.officials ?? [];
  const leaders = score?.leaders ?? [];
  const playerStats = score?.playerStats ?? [];
  const teamStats = score?.teamStats ?? [];
  const lastPlay = score?.plays[0];
  const headlineText = details?.headline;
  const headline = headlineText ?? holidayLabel ?? "";
  const broadcast = getBroadcastDisplay(details?.broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const neutralSite = details?.neutralSite;
  const venueId = Number(details?.venue?.id);
  const { venue } = useVenue({ sport: "basketball", id: venueId });
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
  const venueImage = venue?.image ?? baseVenue?.images?.[0]?.href;
  const venueAttendance = game?.attendance || null;
  const venueCity = venue?.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.state ?? baseVenue?.address?.state ?? baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  useLayoutEffect(() => {
    if (isLoading) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeLogo={homeHeaderLogo}
          awayLogo={awayHeaderLogo}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeColor={homeColor}
          awayColor={awayColor}
          isNeutralSite={!!neutralSite}
          league={LEAGUE}
        />
      ),
    });
  }, [
    LEAGUE,
    awayCode,
    awayColor,
    awayHeaderLogo,
    away,
    awayId,
    homeCode,
    homeColor,
    homeHeaderLogo,
    home,
    homeId,
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

  if (!game) return <View />;
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          headline={headline}
          homeId={homeId}
          awayId={awayId}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeName={homeCode}
          awayName={awayCode}
          homeScore={homeScore}
          awayScore={awayScore}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeRank={homeRank}
          awayRank={awayRank}
          homeBonusState={homeBonus}
          awayBonusState={awayBonus}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          homeWins={homeWins}
          awayWins={awayWins}
          clock={clock}
          period={period}
          date={formattedDate}
          time={formattedTime}
          broadcast={broadcast}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
          isDark={isDark}
          league={LEAGUE}
        />

        <View style={styles.innerContainer}>
          {!dontShowDetails && (
            <>
              <LastPlay
                lastPlay={lastPlay}
                homeId={homeId}
                awayId={awayId}
                state={state}
                league={LEAGUE}
              />

              <LineScore
                linescore={lineScore}
                awayCode={awayCode}
                homeCode={homeCode}
                league={LEAGUE}
                isDark={isDark}
                state={state}
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

              <GameLeaders
                leaders={leaders}
                homeId={homeId}
                homeLogo={homeLogo}
                awayId={awayId}
                awayLogo={awayLogo}
                state={state}
                isDark={isDark}
              />

              <PlayersInFoulTrouble
                foulTrouble={foulTrouble}
                homeId={homeId}
                homeCode={homeCode}
                homeLogo={homeLogo}
                awayId={awayId}
                awayCode={awayCode}
                awayLogo={awayLogo}
                league={LEAGUE}
                isDark={isDark}
                state={state}
              />

              <BoxScore
                playerStats={playerStats}
                homeId={homeId}
                homeName={homeName}
                homeLogo={homeLogo}
                awayId={awayId}
                awayName={awayName}
                awayLogo={awayLogo}
                isDark={isDark}
                league={LEAGUE}
                state={state}
              />

              <ShotChart
                plays={plays}
                homeEspnId={homeEspnId}
                awayEspnId={awayEspnId}
                homeId={homeId}
                awayId={awayId}
                homeColor={homeColor}
                awayColor={awayColor}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                league={LEAGUE}
                state={state}
              />

              <PlayersOnCourt
                playerStats={playerStats}
                homeTeamId={Number(homeEspnId)}
                awayTeamId={Number(awayEspnId)}
                homeCode={homeCode}
                awayCode={awayCode}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                league={LEAGUE}
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
                state={state}
                isDark={isDark}
              />

              <LastFiveGames
                home={{
                  teamId: homeId,
                  teamCode: homeCode,
                  games: homeLastGames.games,
                }}
                away={{
                  teamId: awayId,
                  teamCode: awayCode,
                  games: awayLastGames.games,
                }}
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
                league={LEAGUE}
                state={state}
              />

              <HighlightVideoList highlights={highlights} isDark={isDark} />

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
            </>
          )}
        </View>
      </ScrollView>

      {!dontShowDetails && (
        <GameLiveChatOverlay
          gameId={String(gameId)}
          opacityAnim={opacityAnim}
          state={state}
        />
      )}
    </>
  );
}
