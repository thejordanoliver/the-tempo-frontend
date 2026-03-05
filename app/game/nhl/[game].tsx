import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { StandingsList } from "components/League/Standings/StandingsList";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import LastPlay from "components/Sports/MLB/GameDetails/LastPlay";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import GameHeader from "components/Sports/NHL/GameDetails/GameHeader";
import GameSummary from "components/Sports/NHL/GameDetails/GameSummary";
import NHLInjuries from "components/Sports/NHL/GameDetails/NHLInjuries";
import { getNHLTeam } from "constants/teamsNHL";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useHockeyDetails } from "hooks/NHLHooks/useHockeyGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { getNHLSeason } from "utils/dateUtils";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const { isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [standingsYear, setStandingsYear] = useState(getNHLSeason());
  // -----------------------------------------------------
  // 🟦 Stabilize parsedGame (critical fix)
  // -----------------------------------------------------
  const parsedGame = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch {
      return null;
    }
  }, [game]);

  if (!parsedGame?.id) return null;

  // -----------------------------------------------------
  // 🟩 Extract via parsed object
  // -----------------------------------------------------
  const { home, away } = parsedGame;

  // -----------------------------------------------------
  // 🟧 Stable rawDate (no identity changes)
  // -----------------------------------------------------

  const date = useMemo(() => {
    const d = parsedGame?.date;

    if (!d) return null;

    // Best source → timestamp (API-Sports is always correct)
    if (typeof d.timestamp === "number") {
      return new Date(d.timestamp * 1000);
    }

    // Next best → utc string
    if (typeof d.utc === "string") {
      return new Date(d.utc);
    }

    // Fallback → date.time + date.timezone (rarely needed)
    if (typeof d.time === "string") {
      return new Date(`${d.time} ${d.timezone}`);
    }

    return null;
  }, [parsedGame]);

  // -----------------------------------------------------
  // 🟧 Stable gameDate object
  // -----------------------------------------------------

  const timestamp = parsedGame?.timestamp;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);
  const gameDateObj = useMemo(() => {
    return date ?? new Date();
  }, [date]);

  // -----------------------------------------------------
  // 🟥 Team Mapping
  // -----------------------------------------------------
  const homeId = home?.id ?? parsedGame?.teams?.home?.id;
  const awayId = away?.id ?? parsedGame?.teams?.away?.id;

  if (!homeId || !awayId) return null;
  const homeTeam = getNHLTeam(homeId);
  const awayTeam = getNHLTeam(awayId);
  const homeTeamId = homeTeam?.id;
  const awayTeamId = awayTeam?.id;
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  if (!homeTeam || !awayTeam) return null;

  const {
    score: liveScore,
    details,
    loading,
  } = useHockeyDetails(
    "nhl",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const plays = liveScore?.plays;
  const lastPlay = liveScore?.lastPlay;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const isPostSeason = details?.isPostseason ?? false;
  const seriesSummary = details?.seriesSummary?.summary;

  const homeScore = liveScore?.home.total ?? parsedGame.scores.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? parsedGame.scores.away.total ?? 0;
  const homeRecord = details?.records?.home.overall ?? "0-0";
  const awayRecord = details?.records?.away.overall ?? "0-0";
  const homeTimeouts = liveScore?.timeouts.home ?? 0;
  const awayTimeouts = liveScore?.timeouts.away ?? 0;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const venue = details?.venue;

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const resolvedVenue = useMemo(
    () =>
      resolveVenue({
        espnVenue: venue,
        homeTeam: homeTeam,
        isNeutralSite: neutralSite,
        league: "NHL",
      }),
    [venue, homeTeam, neutralSite],
  );

  const { weather } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (loading || !liveScore || !homeTeam || !awayTeam) {
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
          isNeutralSite={neutralSite}
          league="NHL"
        />
      ),
    });
  }, [navigation, loading, liveScore, homeCode, awayCode, neutralSite]);

  // -----------------------------------------------------
  // 🎬 Scroll Fade Animations
  // -----------------------------------------------------
  const handleScrollStart = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleScrollEnd = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: isChatOpen ? 0 : 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);
  };
  if (loading || !liveScore) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // -----------------------------------------------------
  // 🧱 UI Render
  // -----------------------------------------------------
  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        stickyHeaderIndices={[0]}
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
      >
        <GameHeader
          headlineText={headlineText}
          isPostSeason={isPostSeason}
          seriesSummary={seriesSummary}
          home={homeTeam}
          away={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          homeTimeouts={homeTimeouts}
          awayTimeouts={awayTimeouts}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        <View style={{ gap: 20, marginTop: 20 }}>
          {!dontShowDetails && (
            <>
              {!isFinal && !isScheduled && <LastPlay lastPlay={lastPlay} />}

              {!isFinal && (
                <WinPredictionVote
                  gameId={parsedGame.id}
                  awayTeam={{
                    id: awayTeam.id,
                    name: awayTeam.name,
                    code: awayTeam.code,
                    logo: awayTeam.logo,
                    logoLight: awayTeam.logoLight,
                    color: awayTeam.color,
                  }}
                  homeTeam={{
                    id: homeTeam.id,
                    name: homeTeam.name,
                    code: homeTeam.code,
                    logo: homeTeam.logo,
                    logoLight: homeTeam.logoLight,
                    color: homeTeam.color,
                  }}
                />
              )}

              <LineScore
                linescore={lineScore}
                homeCode={homeTeam.code}
                awayCode={awayTeam.code}
                league="NHL"
              />

              <GameSummary plays={plays ?? []} />

              <HighlightVideoList highlights={highlights} />

              <NHLInjuries
                injuries={injuries}
                loading={loading}
                error={null}
                awayTeamAbbr={awayTeam.code}
                homeTeamAbbr={homeTeam.code}
              />

              <Officials
                officials={officials ?? []}
                loading={loading}
                error={null}
              />
              <GameLocation
                venueImage={resolvedVenue.image}
                venueName={resolvedVenue.name}
                location={
                  resolvedVenue.city
                    ? `${resolvedVenue.city}`
                    : resolvedVenue.name
                }
                address={resolvedVenue.address}
                venueCapacity={String(resolvedVenue.capacity ?? "")}
                venueAttendance={undefined}
                weather={weather}
                loading={false}
                error={null}
              />

              <StandingsList
                year={standingsYear}
                onYearChange={setStandingsYear}
                league="NHL"
              />
            </>
          )}
        </View>
      </ScrollView>

      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={parsedGame.id} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
});
