import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import PlayersOnCourt from "components/Sports/CBB/GameDetails/PlayersOnCourt";
import {
  GameLeaders,
  GameLocation,
  GameTeamStats,
  LastFiveGamesSwitcher,
  LineScore,
} from "components/Sports/NBA/GameDetails";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import MemoizedFloatingChatButton from "components/Sports/NBA/GameDetails/GameChat/MemoizedFloatingChatButton";
import GameHeader from "components/Sports/NBA/GameDetails/GameHeader";
import GameOddsSection from "components/Sports/NBA/GameDetails/GameOddsSection";
import GameSummary from "components/Sports/NBA/GameDetails/GameSummary";
import HeadToHeadGames from "components/Sports/NBA/GameDetails/HeadToHead/HeadToHeadGames";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import TeamInjuries from "components/Sports/NBA/GameDetails/InjuryReport/TeamInjuries";
import LastPlay from "components/Sports/NBA/GameDetails/LastPlay";
import MatchupPredictor from "components/Sports/NBA/GameDetails/MatchupPredictor";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import PlayersInFoulTrouble from "components/Sports/NBA/GameDetails/PlayersInFoulTrouble";
import ShotChart from "components/Sports/NBA/GameDetails/ShotChart";
import { getNeutralVenue } from "constants/neutralVenues";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useLastFiveGames } from "hooks/NBAHooks/useLastFiveGames";
import usePlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo } from "react";
import { Animated, ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { Game } from "types/types";
import { getHolidayLabel } from "utils/dateUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function GameDetailsScreen() {
  const league = "NBA";
  const styles = gameDetailsScreenStyles;
  const { game } = useLocalSearchParams();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
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
  const { home, away, date, venue, id,  } = parsedGame;

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

  const homeTeam = getNBATeam(home?.id);
  const awayTeam = getNBATeam(away?.id);

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

  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);

  const homeLogo = getTeamLogo(home?.id, isDark);
  const awayLogo = getTeamLogo(away?.id, isDark);

  const headerHomeLogo = getTeamLogo(home?.id, true);
  const headerAwayLogo = getTeamLogo(away?.id, true);

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const period = liveScore?.period;
  const displayClock = liveScore?.displayClock;
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
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
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
  const isGameLoading = !details || !liveScore;
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
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address ||
      `${baseVenue?.address.city} ${baseVenue?.address.state}, ${baseVenue?.address.zipCode} ${baseVenue?.address.country}`;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images[0]?.href
    : homeTeam?.venueImage || baseVenue?.images[0]?.href;
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
          league={league}
        />
      ),
    });
  }, [navigation, isGameLoading, homeCode, awayCode]);

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
              {!isFinal && !isScheduled && (
                <LastPlay
                  lastPlay={lastPlay}
                  homeTeamId={String(homeTeamId)}
                  awayTeamId={String(awayTeamId)}
                />
              )}

              {!isFinal && (
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
                />
              )}

              {isScheduled && (
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
                  homeCode={homeCode}
                  awayCode={awayCode}
                  isDark={isDark}
                />
              )}

              <GameLeaders
                gameId={gameId.toString()}
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
                isDark={isDark}
              />

              {isHalftime && inProgress && (
                <PlayersInFoulTrouble
                  homeId={String(homeEspnId)}
                  homeCode={homeCode}
                  homeLogo={homeLogo}
                  awayId={String(awayEspnId)}
                  awayCode={awayCode}
                  awayLogo={awayLogo}
                  homePlayers={homeFoulPlayers}
                  awayPlayers={awayFoulPlayers}
                  league={league}
                  isDark={isDark}
                />
              )}

              {(isHalftime || inProgress || isFinal) && (
                <BoxScore
                  playerStats={playerStats}
                  awayTeamId={Number(awayEspnId)}
                  homeTeamId={Number(homeEspnId)}
                  isDark={isDark}
                  league={league}
                />
              )}

              {!isScheduled && (
                <ShotChart
                  plays={plays}
                  homeTeamId={String(homeEspnId)}
                  awayTeamId={String(awayEspnId)}
                  league={league}
                />
              )}
              {inProgress && (
                <PlayersOnCourt
                  playerStats={playerStats}
                  homeTeamId={Number(homeEspnId)}
                  awayTeamId={Number(awayEspnId)}
                  league={league}
                  isDark={isDark}
                />
              )}
              {!isScheduled && (
                <GameSummary
                  plays={plays ?? []}
                  league={league}
                  isDark={isDark}
                />
              )}
              <GameTeamStats
                stats={teamStats}
                gameStatusDescription={gameStatusDescription}
                isDark={isDark}
              />

              <HeadToHeadGames
                awayTeamId={awayTeamId}
                homeTeamId={homeTeamId}
                homeTeamColor={homeTeam?.color}
                awayTeamColor={awayTeam?.color}
                isDark={isDark}
              />

              <LastFiveGamesSwitcher
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
                league={league}
              />

              <TeamInjuries
                injuries={injuries}
                teamPlayersMap={teamPlayersMap}
                isDark={isDark}
              />

              {highlights.length > 0 && (
                <HighlightVideoList highlights={highlights} isDark={isDark} />
              )}

              <Officials
                officials={officials ?? []}
                loading={false}
                error={null}
                isDark={isDark}
              />

              <GameLocation
                venueImage={venueImage}
                venueName={venueName}
                location={venueLocation}
                address={venueAddress}
                venueCapacity={venueCapacity}
                venueAttendance={venueAttendance}
                loading={false}
                error={null}
                weather={weather}
                isDark={isDark}
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
