/* ================================================== */
/* Imports                                            */
/* ================================================== */

/* --- Navigation & Routing --- */
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";

/* --- React & React Native --- */
import { useLayoutEffect, useMemo } from "react";
import { Animated, ScrollView, useColorScheme, View } from "react-native";

/* --- UI Components --- */
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";

/* --- Game Detail Components --- */
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGamesSwitcher from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";

import GameLeaders from "components/Sports/NFL/GameDetails/GameLeaders";
import GameTeamStats from "components/Sports/NFL/GameDetails/GameTeamStats";
import PlayByPlayField from "components/Sports/NFL/GameDetails/PlayByPlayField";
import TeamDrives from "components/Sports/NFL/GameDetails/TeamDrives";
import TeamScoringSummary from "components/Sports/NFL/GameDetails/TeamScoringSummary";
/* --- Hooks --- */
import { useGameDetails } from "hooks/NFLHooks/useGameDetails";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";

import { Game } from "types/football";
/* --- Utils & Stores --- */
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import FanPredictionVote from "components/Sports/NBA/GameDetails/FanPredictionVote";
import GameHeader from "components/Sports/NFL/GameDetails/GameHeader";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";

import { getNeutralStadium } from "constants/teamsNFL";
import { useFootballTeamStats } from "hooks/CFBHooks/useFootballTeamStats";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { getHolidayLabel } from "utils/dateUtils";

export default function CFBGameDetailsScreen() {
  const styles = gameDetailsScreenStyles;
  const { game: gameParam } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const { opacityAnim, handleScrollStart, handleScrollEnd, showDetails } =
    useScrollFade();

  if (typeof gameParam !== "string") return null;

  let parsedGame: Game;

  try {
    parsedGame = JSON.parse(gameParam) as Game;
  } catch (e) {
    console.warn("Failed to parse game:", gameParam);
    return null;
  }
  const { teams, game } = parsedGame;

  const gameId = String(game.id);
  const homeTeamId = teams?.home?.id ?? 0;
  const awayTeamId = teams?.away?.id ?? 0;
  const homeTeam = getCFBTeam(homeTeamId);
  const awayTeam = getCFBTeam(awayTeamId);
  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;
  const homeLogo = getCFBTeamLogo(homeTeamId, isDark);
  const awayLogo = getCFBTeamLogo(awayTeamId, isDark);
  const headerHomeLogo = getCFBTeamLogo(homeTeamId, true);
  const headerAwayLogo = getCFBTeamLogo(awayTeamId, true);
  const homeCode = homeTeam?.code;
  const awayCode = awayTeam?.code;

  /* -------------------------------------------------- */
  /* Date Handling                                     */
  /* -------------------------------------------------- */

  const gameDateObj = useMemo(() => {
    if (!game?.date) return null;

    const raw =
      typeof game.date === "object" ? game.date.timestamp * 1000 : game.date;

    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [game?.date]);

  const gameDateStr = gameDateObj?.toISOString() ?? "";

  const formattedDate = gameDateObj?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime =
    gameDateObj?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  /* -------------------------------------------------- */
  /* Data Fetching                                     */
  /* -------------------------------------------------- */

  const { details, score } = useGameDetails(
    "cfb",
    homeEspnId,
    awayEspnId,
    gameDateStr,
  );

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);
  const { stats } = useFootballTeamStats(parsedGame.game.id);
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const displayClock = score?.displayClock;
  const period = score?.period;
  const redzone = score?.possession?.isRedZone;
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const isGameLoading = !details || !score;
  const headlineText = details?.headline;
  const broadcast = details?.broadcast ?? "";
  const officials = details?.officials ?? [];
  const highlights = details?.highlights ?? [];
  const currentDrives = score?.drives.current;
  const previousDrives = score?.drives.previous;
  const scoringPlays = score?.scoringPlays;
  const lastPlay = score?.lastPlay;
  const downDistanceText = score?.possession.downDistanceText;
  const venue = details?.venue;
  const neutralSite = details?.neutralSite;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = headlineText ?? holidayLabel ?? "";
  const possessionTeamId = score?.possession.teamId;
  const homeTimeouts = score?.possession.homeTimeouts;
  const awayTimeouts = score?.possession.awayTimeouts;
  const homeRecord = details?.records.home.total.summary;
  const awayRecord = details?.records.away.total.summary;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
  const baseVenue = details?.venue;
  const neutralVenue = getNeutralStadium(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name
    : homeTeam?.venue || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address ||
      `${baseVenue?.address.city} ${baseVenue?.address.state}, ${baseVenue?.address.zipCode} ${baseVenue?.address.country}`;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueAttendance = details?.attendance;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage
    : homeTeam?.venueImage || baseVenue?.images[1].href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const { weather } = useWeatherForecast(venueLat, venueLon, gameDateStr);

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isGameLoading || !details || !homeTeam || !awayTeam) {
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
          league="CFB"
        />
      ),
    });
  }, [
    navigation,
    isGameLoading,
    details,
    homeCode,
    awayCode,
    headerHomeLogo,
    headerAwayLogo,
  ]);

  if (!parsedGame || !homeTeam || !awayTeam) return <View />;

  if (isGameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator isDark={isDark} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        {/* Teams & Score Section */}
        <GameHeader
          headlineText={headline}
          home={homeTeam}
          away={awayTeam}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          awayScore={awayScore}
          homeScore={homeScore}
          possessionTeamId={possessionTeamId}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          period={period}
          displayClock={displayClock}
          possessionText={downDistanceText}
          isDark={isDark}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          broadcast={broadcast}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          gameStatusShortDetail={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
          redzone={redzone}
          league="cfb"
        />

        {!dontShowDetails && (
          <View style={styles.innerContainer}>
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

            {!isScheduled && (
              <LineScore
                linescore={lineScore}
                homeCode={homeCode}
                awayCode={awayCode}
                isDark={isDark}
                league="CFB"
              />
            )}

            {/* Last Play Field - only show when game is live */}
            {(inProgress || isHalftime) && (
              <PlayByPlayField
                lastPlay={lastPlay}
                firstDownYardLine={undefined}
                possessionTeamId={possessionTeamId}
                homeTeamId={Number(homeTeam.id)} // ensure number
                awayTeamId={Number(awayTeam.id)} // ensure number
                league="CFB"
              />
            )}

            {/* Game Leaders - only when game is live */}
            {(inProgress || isHalftime || isFinal) && (
              <>
                <GameLeaders
                  gameId={String(parsedGame.game.id)}
                  homeTeamId={String(homeTeam.id)}
                  awayTeamId={String(awayTeam.id)}
                  isDark={isDark}
                  league="CFB"
                />

                <TeamDrives
                  previousDrives={previousDrives ?? []}
                  currentDrives={currentDrives ?? []}
                  homeTeamId={Number(homeTeam?.espnID)}
                  awayTeamId={Number(awayTeam?.espnID)}
                  isDark={isDark}
                  league="CFB"
                />
              </>
            )}
            <TeamScoringSummary
              scoringPlays={scoringPlays ?? []}
              homeTeamId={Number(homeTeam?.espnID)}
              awayTeamId={Number(awayTeam?.espnID)}
              isDark={isDark}
              league="CFB"
            />

            {stats && (
              <GameTeamStats stats={stats} isDark={isDark} league="CFB" />
            )}

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
              league="CFB"
            />

            {highlights.length > 0 && (
              <HighlightVideoList highlights={highlights} isDark={isDark} />
            )}

            {!isFinal && (
              <Officials
                officials={officials}
                loading={false}
                error={null}
                isDark
              />
            )}

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
              grass={venue?.grass ?? undefined}
              surface="football"
              isDark={isDark}
            />
          </View>
        )}
      </ScrollView>
      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(parsedGame.game.id)} />
      </Animated.View>
    </>
  );
}
