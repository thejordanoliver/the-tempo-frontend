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
import { getNBATeam, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useGameLeaders } from "hooks/NBAHooks/useGameLeaders";
import { useLastFiveGames } from "hooks/NBAHooks/useLastFiveGames";
import usePlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { Game } from "types/nba";
import { getHolidayLabel } from "utils/dateUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";

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

  const { gameLeaders, gameLeadersLoading, gameLeadersError } = useGameLeaders(
    parsedGame?.id ?? 0,
    homeTeamId,
    awayTeamId,
  );

  const { score: liveScore, details } = useGameDetails(
    "nba",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDate,
  );

  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);

  const homeLogo = getTeamLogo(home?.id, isDark);
  const awayLogo = getTeamLogo(away?.id, isDark);

  const headerHomeLogo = getTeamLogo(home?.id, true);
  const headerAwayLogo = getTeamLogo(away?.id, true);

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  // --- Live details and status ---
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock;
  const dontShowDetails = isDelayed || isCanceled || isPostponed;

  // --- Header and summary data ---
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
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
  const neutralSite = details?.neutralSite;
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const isGameLoading = !liveScore;
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

  const homeTeamPlayersData = usePlayersByTeam(String(homeTeamId));
  const awayTeamPlayersData = usePlayersByTeam(String(awayTeamId));

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

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isGameLoading || !homeTeam || !awayTeam) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    // Show header once everything is ready
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          homeLogo={headerHomeLogo}
          awayLogo={headerAwayLogo}
          isNeutralSite={neutralSite}
          league={LEAGUE}
        />
      ),
    });
  }, [
    navigation,
    isGameLoading,
    homeTeam,
    awayTeam,
    homeTeamId,
    awayTeamId,
    homeCode,
    awayCode,
    headerHomeLogo,
    headerAwayLogo,
    neutralSite,
  ]);

  if (!parsedGame?.id) return null;

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
          headlineText={headline}
          homeScore={homeScore}
          awayScore={awayScore}
          home={homeTeam}
          away={awayTeam}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeBonusState={homeBonus}
          awayBonusState={awayBonus}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          displayClock={displayClock}
          period={period}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        <View style={styles.innerContainer}>
          {!dontShowDetails && (
            <>
              <LastPlay
                lastPlay={lastPlay}
                homeTeamId={String(homeTeamId)}
                awayTeamId={String(awayTeamId)}
                gameStatusDescription={gameStatusDescription}
              />

              <FanPredictionVote
                gameId={gameId}
                awayTeam={{
                  id: awayTeamId,
                  code: awayCode,
                  logo: headerAwayLogo,
                  color: awayTeam?.color,
                }}
                homeTeam={{
                  id: homeTeamId,
                  code: homeCode,
                  logo: headerHomeLogo,
                  color: homeTeam?.color,
                }}
                gameStatusDescription={gameStatusDescription}
              />

              <MatchupPredictor
                home={{
                  name: homeCode,
                  logo: homeLogo,
                  chance: homeChance,
                  color: isDark ? homeTeam?.secondaryColor : homeTeam?.color,
                }}
                away={{
                  name: awayCode,
                  logo: awayLogo,
                  chance: awayChance,
                }}
                size={180}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

              <GameOddsSection
                date={date ?? ""}
                homeId={homeTeamId}
                awayId={awayTeamId}
                gameDate={formattedDate}
                homeCode={homeCode}
                awayCode={awayCode}
                homeLogo={homeLogo}
                awayLogo={awayLogo}
                league={"nba"}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />
              <LineScore
                linescore={lineScore}
                homeCode={homeCode}
                awayCode={awayCode}
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
                homeLogo={homeLogo}
                awayCode={awayCode}
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
                league={LEAGUE}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

              <GameTeamStats
                stats={teamStats}
                isDark={isDark}
                gameStatusDescription={gameStatusDescription}
              />

              <HeadToHeadGames
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
                homeTeamColor={homeTeam?.color}
                awayTeamColor={awayTeam?.color}
                isDark={isDark}
              />

              <LastFiveGames
                isDark={isDark}
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
              />

              <TeamInjuries
                injuries={injuries}
                teamPlayersMap={teamPlayersMap}
                isDark={isDark}
              />

              <HighlightVideoList highlights={highlights} isDark={isDark} />

              <Officials
                officials={officials ?? []}
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
      {!dontShowDetails && !isFinal && (
        <GameLiveChatOverlay
          gameId={String(parsedGame.id)}
          opacityAnim={opacityAnim}
        />
      )}
    </>
  );
}
