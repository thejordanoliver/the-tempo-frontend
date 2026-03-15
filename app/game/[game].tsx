import MemoizedFloatingChatButton from "components//MemoizedFloatingChatButton";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import {
  BoxScore,
  GameLeaders,
  GameLocation,
  GameTeamStats,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import GameHeader from "components/Sports/NBA/GameDetails/GameHeader";
import GameOddsSection from "components/Sports/NBA/GameDetails/GameOddsSection";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastPlay from "components/Sports/NBA/GameDetails/LastPlay";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import TeamInjuries from "components/Sports/NBA/GameDetails/TeamInjuries";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import { getTeamById, getTeamLogo, teams } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import usePlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useLastFiveGames } from "hooks/useLastFiveGames";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Animated, ScrollView, useColorScheme, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { Game } from "types/types";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function GameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { opacityAnim, handleScrollStart, handleScrollEnd, showDetails } =
    useScrollFade();

  if (typeof game !== "string") return null;

  let parsedGame: Game;

  try {
    parsedGame = JSON.parse(game) as Game;
  } catch (e) {
    console.warn("Failed to parse game:", game);
    return null;
  }

  if (!parsedGame?.id) return null;
  const { home, away, date, venue, id } = parsedGame;

  const gameId = String(id);

  const gameDateObj = useMemo(() => {
    if (!date) return new Date(); // fallback to now
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

  const homeTeamData = teams.find(
    (t) =>
      t.name === home.name || t.code === home.name || t.fullName === home.name,
  );
  const awayTeamData = teams.find(
    (t) =>
      t.name === away.name || t.code === away.name || t.fullName === away.name,
  );
  if (!homeTeamData || !awayTeamData) return null;

  const homeTeam = getTeamById(home.id);
  const awayTeam = getTeamById(away.id);

  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { score: liveScore, details } = useGameDetails(
    "nba",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDate,
  );

  const awayCode = useMemo(() => awayTeamData.code, [awayTeamData.code]);
  const homeCode = useMemo(() => homeTeamData.code, [homeTeamData.code]);

  const homeLogo = getTeamLogo(home.id, isDark);
  const awayLogo = getTeamLogo(away.id, isDark);

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
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
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const displayClock = liveScore?.displayClock;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const teamStats = liveScore?.teamStats ?? [];
  const homeScore = liveScore?.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? 0;
  const period = liveScore?.period;
  const neutralSite = details?.neutralSite;
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) ?? 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) ?? 0;
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

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: details?.venue,
        homeTeam: homeTeam,
        isNeutralSite: neutralSite,
      }),
    [details?.venue, homeTeam, neutralSite],
  );

  const { weather, weatherError, weatherLoading } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    date,
  );

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isLoading || !liveScore || !homeTeamData || !awayTeamData) {
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
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          isNeutralSite={neutralSite}
          league="NBA"
        />
      ),
    });
  }, [navigation, isLoading, liveScore, homeCode, awayCode]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  const isChristmasDay =
    gameDateObj.getMonth() === 11 && gameDateObj.getDate() === 25;
  const isNewYearsDay =
    gameDateObj.getMonth() === 0 && gameDateObj.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
      ? "New Year's Day"
      : null;

  const headline = headlineText ?? holidayLabel ?? "";

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  if (isLoading || !liveScore) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

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
          home={home}
          away={away}
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
              {!isFinal && !isScheduled && (
                <LastPlay
                  lastPlay={lastPlay}
                  homeTeamId={String(homeTeamId)}
                  awayTeamId={String(awayTeamId)}
                />
              )}

              {!isFinal && (
                <WinPredictionVote
                  gameId={gameId}
                  awayTeam={{
                    id: awayTeamData.id,
                    name: awayTeamData.name || awayTeamData.code,
                    code: awayTeamData.code || awayTeamData.code,
                    logo: awayTeamData.logo,
                    logoLight: awayTeamData.logoLight,
                    color: awayTeamData.color,
                  }}
                  homeTeam={{
                    id: homeTeamData.id,
                    name: homeTeamData.name || homeTeamData.code,
                    code: homeTeamData.code || homeTeamData.code,
                    logo: homeTeamData.logo,
                    logoLight: homeTeamData.logoLight,
                    color: homeTeamData.color,
                  }}
                />
              )}

              {isScheduled && (
                <MatchupPredictor
                  home={{
                    name: homeTeamData.code,
                    logo: homeLogo,
                    color: isDark
                      ? homeTeamData.secondaryColor
                      : homeTeamData.color,
                    chance: homeChance,
                  }}
                  away={{
                    name: awayTeamData.code,
                    logo: awayLogo,
                    chance: awayChance,
                  }}
                  size={180}
                />
              )}

              <GameOddsSection
                date={date}
                homeId={homeTeamId}
                awayId={awayTeamId}
                gameDate={gameDate}
                homeCode={homeCode}
                awayCode={awayCode}
              />

              {lineScore && (
                <LineScore
                  linescore={lineScore}
                  homeCode={homeTeamData.code}
                  awayCode={awayTeamData.code}
                />
              )}

              <GameLeaders
                gameId={gameId.toString()}
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
              />

              {isHalftime && inProgress && (
                <PlayersInFoulTrouble
                  homeId={String(homeEspnId)}
                  homeCode={homeTeamData.code ?? ""}
                  homeLogo={homeLogo}
                  awayId={String(awayEspnId)}
                  awayCode={awayTeamData.code ?? ""}
                  awayLogo={awayLogo}
                  homePlayers={homeFoulPlayers}
                  awayPlayers={awayFoulPlayers}
                  league={"NBA"}
                />
              )}

              {!isScheduled && (
                <BoxScore
                  gameId={gameId.toString()}
                  homeTeamId={homeTeamId}
                  awayTeamId={awayTeamId}
                />
              )}
              {!isScheduled && (
                <ShotChart
                  plays={plays}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                  league="NBA"
                />
              )}
              {inProgress && (
                <PlayersOnCourt
                  playerStats={playerStats}
                  homeTeamId={Number(homeEspnId)}
                  awayTeamId={Number(awayEspnId)}
                  league={"NBA"}
                />
              )}
              {!isScheduled && (
                <GameSummary
                  plays={plays ?? []}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                  league="NBA"
                />
              )}
              <GameTeamStats
                stats={teamStats}
                gameStatusDescription={gameStatusDescription}
              />
              <LastFiveGamesSwitcher
                isDark={isDark}
                home={{
                  teamId: homeTeamId,
                  teamCode: homeTeamData.code,
                  games: homeLastGames.games,
                }}
                away={{
                  teamId: awayTeamId,
                  teamCode: awayTeamData.code,
                  games: awayLastGames.games,
                }}
                league="NBA"
              />

              <TeamInjuries
                injuries={injuries}
                lighter={false}
                teamPlayersMap={teamPlayersMap}
              />

              {highlights.length > 0 && (
                <HighlightVideoList highlights={highlights} />
              )}

              <Officials
                officials={officials ?? []}
                loading={false}
                error={null}
              />

              <GameLocation
                venueImage={resolvedVenue.image}
                venueName={resolvedVenue.name}
                location={resolvedVenue.city}
                address={resolvedVenue.address}
                venueCapacity={resolvedVenue.capacity}
                weather={weather}
                loading={weatherLoading}
                error={weatherError}
              />
            </>
          )}
        </View>
      </ScrollView>
      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(parsedGame.id)} />
      </Animated.View>
    </>
  );
}
