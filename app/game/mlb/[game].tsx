import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import GameHeader from "components/Sports/MLB/GameDetails/GameHeader";
import GameSummary from "components/Sports/MLB/GameDetails/GameSummary";
import LastPlay from "components/Sports/MLB/GameDetails/LastPlay";
import MLBInjuries from "components/Sports/MLB/GameDetails/MLBInjuries";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import WinPredictionVote from "components/Sports/NBA/GameDetails/WinPredictionVote";
import { getMLBTeam } from "constants/teamsMLB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { getBroadcastDisplay } from "utils/matchBroadcast";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen: isChatOpen } = useChatStore();
  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const gameDateObj = useMemo(() => {
    return date ?? new Date();
  }, [date]);

  const gameDate = gameDateObj.toISOString().split("T")[0];

  const formattedDate = useMemo(
    () =>
      gameDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    [gameDateObj]
  );

  const formattedTime = useMemo(
    () =>
      gameDateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    [gameDateObj]
  );

  // -----------------------------------------------------
  // 🟥 Team Mapping
  // -----------------------------------------------------
  const homeId =
    home?.id ?? parsedGame.homeTeamID ?? parsedGame?.teams?.home?.id;

  const awayId =
    away?.id ?? parsedGame.awayTeamID ?? parsedGame?.teams?.away?.id;

  if (!homeId || !awayId) return null;

  const homeTeam = getMLBTeam(homeId);
  const awayTeam = getMLBTeam(awayId);
  const homeCode = useMemo(() => homeTeam?.code, [homeTeam?.code]);
  const awayCode = useMemo(() => awayTeam?.code, [awayTeam?.code]);

  if (!homeTeam || !awayTeam) return null;

  const {
    score: liveScore,
    details,
    loading,
  } = useGameDetails("mlb", awayTeam?.espnID, homeTeam?.espnID, gameDate);

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const plays = liveScore?.plays;
  const lastPlay = liveScore?.lastPlay;
  const isPostseason = details?.isPostseason;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const homeScore = liveScore?.home.total ?? parsedGame.scores.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? parsedGame.scores.away.total ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const period = liveScore?.period;
  const venue = details?.venue;
  const attendance = details?.venue;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  useLayoutEffect(() => {
    // Hide header while loading or missing live data
    if (isLoading || !liveScore || !homeTeam || !awayTeam) {
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
          homeTeamId={homeId}
          awayTeamId={awayId}
          homeTeamCode={homeCode}
          awayTeamCode={awayCode}
          isNeutralSite={neutralSite}
          league="MLB"
        />
      ),
    });
  }, [
    navigation,
    isLoading,
    liveScore,
    homeCode,
    awayCode,
    neutralSite,
  ]);
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

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
  if (isLoading || !liveScore) {
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
          seriesSummary={seriesSummary}
          headlineText={headline}
          seasonState={seasonState}
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
          league="mlb"
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        <LastPlay lastPlay={lastPlay}/>

        <View style={{ gap: 20, marginTop: 20 }}>
          {parsedGame.status.short !== "FT" && (
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
            league="MLB"
          />

          <GameSummary plays={plays ?? []} />

          <HighlightVideoList highlights={highlights} />

          <MLBInjuries
            injuries={injuries}
            loading={false}
            error={null}
            awayTeamAbbr={awayTeam.code}
            homeTeamAbbr={homeTeam.code}
          />

          <Officials officials={officials ?? []} loading={false} error={null} />

          <GameLocation
            loading={false}
            error={null}
            venueImage={venue?.image}
            venueName={venue?.name || homeTeam.venue}
            location={homeTeam.city}
            address={homeTeam.address}
            venueCapacity={String(homeTeam.venueCapacity)}
            venueAttendance={String(attendance)}
            weather={null}
          />
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
