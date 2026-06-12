import GameLeaders from "@/components/Sports/Basketball/GameDetails/GameLeaders";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useBasketballGameDetails } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { BasketballGameCardProps } from "@/types/basketball";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  BoxScore,
  FanPredictionVote,
  GameHeader,
  GameLocation,
  GameOddsSection,
  GameTeamStats,
  HighlightVideoList,
  LastFiveGames,
  LastPlay,
  LineScore,
  MatchupPredictor,
  Officials,
  PlayersInFoulTrouble,
  PlayersOnCourt,
  ShotChart,
  TeamInjuries,
} from "components/Sports/NBA/GameDetails";
import GameLiveChatOverlay from "components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { getHolidayLabel } from "utils/dateUtils";
import {
  formatQuarter,
  formatVenueAddress,
  getBroadcastDisplay,
} from "utils/games";
import { getVenue } from "../../constants/venues";

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

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
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

  const gameDateObj = game?.date ? new Date(game.date) : null;
  const gameDateStr = String(gameDateObj);
  const gameId = game?.id ?? "";

  const home = game?.home;
  const away = game?.away;

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;
  const homeTeam = getNBATeam(homeId);
  const awayTeam = getNBATeam(awayId);

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

  const formattedDate =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
      : "TBD";

  const formattedTime =
    gameDateObj && isValidDate(gameDateObj)
      ? gameDateObj.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "TBD";

  const homeLastGames = useLastFiveGames(homeId, "basketball", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "basketball", LEAGUE);
  const homeTeamPlayersData = useRoster(homeId, LEAGUE);
  const awayTeamPlayersData = useRoster(awayId, LEAGUE);
  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

  const { details, score } = useBasketballGameDetails(LEAGUE, gameId);

  const isLoading = !score || !details;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const period = formatQuarter(score?.period ?? 0);
  const clock = score?.displayClock ?? "0:00";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const homeBonus = score?.fouls?.home?.bonusState ?? null;
  const awayBonus = score?.fouls?.away?.bonusState ?? null;
  const homeTimeouts = score?.timeouts.home ?? 0;
  const awayTimeouts = score?.timeouts.away ?? 0;
  const plays = score?.plays ?? [];
  const highlights = details?.highlights ?? [];
  const injuries = details?.injuries ?? [];
  const officials = details?.officials ?? [];
  const leaders = score?.leaders ?? [];
  const playerStats = score?.playerStats ?? [];
  const teamStats = score?.teamStats ?? [];
  const lastPlay = score?.lastPlay ?? "";
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const broadcast = getBroadcastDisplay(details?.broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const homeFoulPlayers =
    score?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(homeEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(homeEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];

  const awayFoulPlayers =
    score?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(awayEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(awayEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];

  const neutralSite = details?.neutralSite;
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venue = getVenue(baseVenue?.fullName);
  const venueName = venue?.name || baseVenue?.fullName;
  const venueAddress = venue?.address || homeTeam?.address || baseVenueAddress;
  const venueCapacity = venue?.venueCapacity || homeTeam?.venueCapacity || null;
  const venueImage =
    venue?.venueImage || homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = venue?.city || homeTeam?.city;
  const venueLat = venue?.latitude || homeTeam?.latitude || null;
  const venueLon = venue?.longitude || homeTeam?.longitude || null;
  const venueAttendance = baseVenue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, formattedDate);

  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  useLayoutEffect(() => {
    if (isLoading || !home || !away) {
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

  if (!game || !homeTeam || !awayTeam) return <View />;
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
                homeTeamId={homeId}
                awayTeamId={awayId}
                gameStatusDescription={gameStatusDescription}
                league={LEAGUE}
              />

              <LineScore
                linescore={lineScore}
                awayCode={awayCode}
                homeCode={homeCode}
                league={LEAGUE}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
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
                gameStatusDescription={gameStatusDescription}
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
                gameStatusDescription={gameStatusDescription}
              />

              <GameOddsSection
                date={gameDateStr}
                gameDate={formattedDate}
                homeCode={homeCode}
                awayCode={awayCode}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                league={LEAGUE}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

              <GameLeaders
                leaders={leaders}
                homeCode={homeCode}
                homeLogo={homeLogo}
                awayCode={awayCode}
                awayLogo={awayLogo}
                homeTeamId={Number(homeEspnId)}
                awayTeamId={Number(awayEspnId)}
                league={LEAGUE}
                gameStatusDescription={gameStatusDescription}
                isDark={isDark}
              />

              <PlayersInFoulTrouble
                homeId={String(homeEspnId)}
                awayId={String(awayEspnId)}
                homeCode={homeCode}
                awayCode={awayCode}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                homePlayers={homeFoulPlayers}
                awayPlayers={awayFoulPlayers}
                league={LEAGUE}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

              <BoxScore
                playerStats={playerStats}
                awayTeamId={Number(awayEspnId)}
                homeTeamId={Number(homeEspnId)}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                homeName={homeName}
                awayName={awayName}
                isDark={isDark}
                league={LEAGUE}
                gameStatusDescription={gameStatusDescription}
              />

              <ShotChart
                plays={plays}
                homeEspnId={String(homeEspnId)}
                awayEspnId={String(awayEspnId)}
                homeId={homeId}
                awayId={awayId}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                league={LEAGUE}
                gameStatusDescription={gameStatusDescription}
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
                gameStatusDescription={gameStatusDescription}
              />

              <GameTeamStats
                stats={teamStats}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                homeCode={homeCode}
                awayCode={awayCode}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
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
                league={LEAGUE.toUpperCase()}
                gameStatusDescription={gameStatusDescription}
                isDark={isDark}
              />

              <TeamInjuries
                injuries={injuries}
                teamPlayersMap={teamPlayersMap}
                isDark={isDark}
                league={LEAGUE}
              />

              <HighlightVideoList highlights={highlights} isDark={isDark} />

              <Officials
                officials={officials}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

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

      <GameLiveChatOverlay
        gameId={String(gameId)}
        opacityAnim={opacityAnim}
        gameStatusDescription={gameStatusDescription}
      />
    </>
  );
}
