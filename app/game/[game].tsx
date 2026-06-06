import useRoster from "@/hooks/LeagueHooks/useRoster";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import {
  BoxScore,
  FanPredictionVote,
  GameHeader,
  GameLeaders,
  GameLocation,
  GameOddsSection,
  GameTeamStats,
  HeadToHeadGames,
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
import { getNeutralVenue } from "constants/neutralVenues";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useGameLeaders } from "hooks/NBAHooks/useGameLeaders";
import { useLastFiveGames } from "hooks/NBAHooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { Game } from "types/nba";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter, getBroadcastDisplay } from "utils/games";

const LEAGUE = "NBA";

const formatVenueAddress = (address?: {
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}) => {
  if (!address) return undefined;

  return [address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(" ");
};

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const parsedGame = useMemo(() => {
    if (typeof game !== "string") return null;

    try {
      return JSON.parse(game) as Game;
    } catch {
      console.warn("Failed to parse game:", game);
      return null;
    }
  }, [game]);

  const { home, away, date, id } = parsedGame ?? {};

  const gameId = id ? String(id) : "";

  const gameDateObj = useMemo(() => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [date]);

  const gameDate = useMemo(
    () => gameDateObj.toISOString().split("T")[0],
    [gameDateObj],
  );

  const formattedDate = gameDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime =
    gameDateObj?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const homeTeam = getNBATeam(home?.id ?? 0);
  const awayTeam = getNBATeam(away?.id ?? 0);
  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;
  const awayCode = useMemo(() => awayTeam?.code ?? "", [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code ?? "", [homeTeam?.code]);
  const awayName = useMemo(
    () => awayTeam?.fullName ?? "",
    [awayTeam?.fullName],
  );
  const homeName = useMemo(
    () => homeTeam?.fullName ?? "",
    [homeTeam?.fullName],
  );
  const awayColor = useMemo(
    () => awayTeam?.color ?? Colors.midTone,
    [awayTeam?.color],
  );
  const homeColor = useMemo(
    () => homeTeam?.color ?? Colors.midTone,
    [homeTeam?.color],
  );
  const homeLogo = getTeamLogo(home?.id, isDark);
  const awayLogo = getTeamLogo(away?.id, isDark);
  const homeHeaderLogo = getTeamLogo(home?.id, true);
  const awayHeaderLogo = getTeamLogo(away?.id, true);

  const { gameLeaders, gameLeadersLoading, gameLeadersError } = useGameLeaders(
    Number(gameId),
    homeTeamId,
    awayTeamId,
  );

  const { score: liveScore, details } = useGameDetails(
    "nba",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDate,
  );

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  const isLoadingGame =
    !liveScore ||
    !details ||
    liveScore.home?.total == null ||
    liveScore.away?.total == null;

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isCanceled || isDelayed || isPostponed || isForfeited;
  const period = formatQuarter(liveScore?.period ?? 0);
  const clock = liveScore?.displayClock ?? "0:00";
  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const homeRecord = details?.records?.home?.overall ?? "0-0";
  const awayRecord = details?.records?.away?.overall ?? "0-0";
  const fouls = liveScore?.fouls;
  const awayBonus = fouls?.away?.bonusState;
  const homeBonus = fouls?.home?.bonusState;
  const homeTimeouts = liveScore?.timeouts?.home ?? 0;
  const awayTimeouts = liveScore?.timeouts?.away ?? 0;
  const plays = liveScore?.plays ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const lastPlay = liveScore?.lastPlay;
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats;
  const neutralSite = details?.neutralSite;
  const broadcasts = details?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const homeFoulPlayers =
    liveScore?.foulTrouble
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
    liveScore?.foulTrouble
      ?.find((t) => String(t.team?.id) === String(awayEspnId))
      ?.players?.map((p) => ({
        id: p.id,
        teamId: String(awayEspnId),
        name: p.shortName,
        jersey: p.jersey,
        fouls: p.fouls,
        avatarUrl: p.avatar ?? "",
      })) ?? [];

  const homeTeamPlayersData = useRoster(homeTeamId, LEAGUE);
  const awayTeamPlayersData = useRoster(awayTeamId, LEAGUE);

  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address || baseVenueAddress;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const venueAttendance = details?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, gameDate);
  const isGameLoading = !gameLeaders || !liveScore;

  useLayoutEffect(() => {
    // While loading or missing data → NO HEADER
    if (isLoadingGame || !homeTeam || !awayTeam) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    // Once loaded → show custom header
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
    navigation,
    isLoadingGame,
    homeTeam,
    awayTeam,
    neutralSite,
    homeHeaderLogo,
    awayHeaderLogo,
    homeCode,
    awayCode,
    homeColor,
    awayColor,
  ]);

  if (!gameId) return null;

  if (isGameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }
  if (!parsedGame || !homeTeam || !awayTeam) return <View />;
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
          homeId={homeTeamId}
          awayId={awayTeamId}
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
                homeTeamId={homeTeamId}
                awayTeamId={awayTeamId}
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
                awayId={awayTeamId}
                awayCode={awayCode}
                awayLogo={awayHeaderLogo}
                awayColor={awayColor}
                homeId={homeTeamId}
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
                date={date}
                gameDate={formattedDate}
                homeCode={homeCode}
                awayCode={awayCode}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                league={"nba"}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

              <GameLeaders
                gameLeaders={gameLeaders}
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
                loading={gameLeadersLoading}
                error={gameLeadersError}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
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
                homeTeamId={String(homeEspnId)}
                awayTeamId={String(awayEspnId)}
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

              <HeadToHeadGames
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
                homeTeamColor={homeColor}
                awayTeamColor={awayColor}
                isDark={isDark}
              />

              <LastFiveGames
                home={{
                  teamId: homeTeamId,
                  teamCode: homeCode,
                  games: homeLastGames.games,
                }}
                away={{
                  teamId: awayTeamId,
                  teamCode: awayCode,
                  games: awayLastGames.games,
                }}
                league={LEAGUE}
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
        gameId={String(parsedGame.id)}
        opacityAnim={opacityAnim}
        gameStatusDescription={gameStatusDescription}
      />
    </>
  );
}
