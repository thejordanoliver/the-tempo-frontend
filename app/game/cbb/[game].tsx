import BoxScore from "components/CBB/GameDetails/BoxScore";
import GameLeaders from "components/CBB/GameDetails/GameLeaders";
import GameOddsSection from "components/CBB/GameDetails/GameOddsSection";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import {
  LastFiveGamesSwitcher,
  LineScore,
  TeamLocationSection,
} from "components/GameDetails";
import GameHeader from "components/GameDetails/GameHeader";
import GameSummary from "components/GameDetails/GameSummary";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastPlay from "components/GameDetails/LastPlay";
import Officials from "components/GameDetails/Officials";
import ShotChart from "components/GameDetails/ShotChart";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import { Colors } from "constants/Colors";
import { neutralVenues, teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useGameDetails } from "hooks/CBBHooks/useGameDetails";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameScores } from "hooks/useGameScores";
import { useTeamRecord } from "hooks/useTeamRecords";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";

function parseGameDateForOdds(raw: any): { iso: string; ymd: string } {
  if (!raw) {
    const now = new Date();
    return {
      iso: now.toISOString(),
      ymd: now.toISOString().split("T")[0],
    };
  }

  let d: Date;

  if (typeof raw === "number") {
    d = new Date(raw * 1000);
  } else {
    d = new Date(raw);
  }

  return {
    iso: d.toISOString(), // full timestamp for upcoming odds
    ymd: d.toISOString().split("T")[0], // YYYY-MM-DD for historical odds
  };
}

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();

  // -----------------------------
  // Parse Full Game Object
  // -----------------------------
  const gameObj: CBBGame | null = useMemo(() => {
    try {
      return typeof game === "string" ? JSON.parse(game) : null;
    } catch (e) {
      console.warn("Failed to parse game param", e);
      return null;
    }
  }, [game]);

  if (!gameObj) {
    console.warn("❌ No valid game object passed to GameDetailsScreen");
    return null;
  }

  // -----------------------------
  // Extract Team IDs + Team Data
  // -----------------------------
  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);

  const homeTeamData = teams.find((t) => Number(t.id) === homeTeamId);
  const awayTeamData = teams.find((t) => Number(t.id) === awayTeamId);

  if (!homeTeamData || !awayTeamData) {
    console.warn("Missing team data for IDs:", { homeTeamId, awayTeamId });
    return null;
  }

  // -----------------------------
  // Date Handling
  // -----------------------------
  const gameDateObj = useMemo(() => {
    if (gameObj.timestamp) return new Date(gameObj.timestamp * 1000);
    if (gameObj.date) return new Date(gameObj.date);
    return new Date();
  }, [gameObj]);

  const formattedDate = gameDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const gameDate = gameDateObj.toISOString().split("T")[0];
  const gameDateStr = gameDateObj.toISOString();

  // -----------------------------
  // Navigation + UI Controls
  // -----------------------------
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const { openChat, isOpen: isChatOpen } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  const opacityAnim = useRef(new Animated.Value(isChatOpen ? 0 : 1)).current;
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // -----------------------------
  // ESPN IDs
  // -----------------------------
  const homeEspnId = homeTeamData.espnID;
  const awayEspnId = awayTeamData.espnID;

  // -----------------------------
  // Rankings (AP Top 25)
  // -----------------------------
  const { rankings } = useCBBRankings();

  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const poll = rankings.find((p) => p.shortName === "AP Poll");
    if (!poll) return [];
    return poll.ranks.slice(0, 25).map((r) => ({
      id: r.team?.id,
      rank: r.current,
    }));
  }, [rankings]);

  const getTeamRank = (teamId: number | string) => {
    const match = apTop25.find((t) => t.id === String(teamId));
    return match?.rank;
  };

  // -----------------------------
  // Colors
  // -----------------------------
  const colors = useMemo(
    () => ({
      background: isDark ? Colors.black : Colors.white,
      text: isDark ? Colors.dark.white : Colors.light.black,
      secondaryText: isDark ? Colors.lightGray : Colors.darkGray,
      record: isDark ? Colors.dark.white : Colors.light.black,
      score: Colors.midTone,
      winnerScore: isDark ? Colors.dark.white : Colors.light.black,
      border: isDark ? Colors.darkGray : Colors.lightGray,
      finalText: isDark ? Colors.dark.lightRed : Colors.light.red,
    }),
    [isDark]
  );

  // -----------------------------
  // Hooks: Records, L5, Broadcasts, Headline, Live Score, Details
  // -----------------------------
  const { record: homeRecord } = useTeamRecord(homeEspnId, "cbb");
  const { record: awayRecord } = useTeamRecord(awayEspnId, "cbb");

  const homeLastGames = useLastFiveGames(homeTeamId);
  const awayLastGames = useLastFiveGames(awayTeamId);

  const { broadcasts } = useGameBroadcasts(
    homeTeamData.name,
    awayTeamData.name,
    gameDateStr,
    "mens-college-basketball"
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  const { headlineText } = useCBBHeadline(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const { score: liveScore } = useGameScores(
    "mens-college-basketball",
    String(homeEspnId),
    String(awayEspnId),
    gameDate
  );

  const {
    officials,
    highlights,
    plays,
    playerStats,
    leaders,
    neutralSite,
    venue,
  } = useGameDetails("cbb", homeEspnId, awayEspnId, gameDate);

  // ------------------------------------
  // Neutral Site Detection
  // ------------------------------------
  const venueNameRaw = (venue?.name ?? homeTeamData.venueName ?? "")
    .trim()
    .toLowerCase();

  // try to find a neutral venue match by key
  const neutralMatch = Object.entries(neutralVenues).find(
    ([key]) => key.trim().toLowerCase() === venueNameRaw
  );

  let resolvedVenue = {
    image: venue?.image ?? homeTeamData.venueImage ?? "",
    name: venue?.name ?? homeTeamData.venueName ?? "",
    city: venue?.city ?? homeTeamData.location ?? homeTeamData.city ?? "",
    address: venue?.address ?? homeTeamData.address ?? "",
    capacity: venue?.capacity ?? homeTeamData.venueCapacity ?? "",
    latitude: venue?.latitude ?? null,
    longitude: venue?.longitude ?? null,
  };

  // ------------------------------------
  // If neutral site match exists → override values
  // ------------------------------------
  if (neutralMatch) {
    const [venueKey, arena] = neutralMatch;

    resolvedVenue = {
      image: arena.venueImage ?? resolvedVenue.image,
      name: arena.name ?? venueKey,
      city: arena.city ?? resolvedVenue.city ?? "",
      address: arena.address ?? resolvedVenue.address ?? "",
      capacity: arena.venueCapacity ?? resolvedVenue.capacity ?? "",
      latitude: arena.latitude ?? resolvedVenue.latitude,
      longitude: arena.longitude ?? resolvedVenue.longitude,
    };
  }

  // -----------------------------
  // Status + Period / Score Logic
  // -----------------------------
  const formatQuarter = (period?: number | string) => {
    if (!period) return "Live";

    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) {
        const match = val.match(/(\d+)?ot/i);
        const num = match?.[1];
        return !num || num === "1" ? "OT" : `${num}OT`;
      }
      if (val.includes("halftime")) return "Halftime";
      return period;
    }

    const p = Number(period);
    if (p === 1) return "1st";
    if (p === 2) return "2nd";

    const ot = p - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  };

  const displayClockRaw = liveScore?.displayClock ?? "";
  const displayClock =
    typeof displayClockRaw === "string" ? displayClockRaw : "";

  const periodNum = Number(liveScore?.period ?? 0);
  const rawStatusText = (
    liveScore?.statusText ??
    gameObj.status.long ??
    ""
  ).toLowerCase();

  const hasActiveClock =
    displayClock !== "" && displayClock !== "0:00" && displayClock !== "0:00.0";

  // ------------------------------
  // Robust Status Resolution
  // ------------------------------
  let statusDisplay: "Scheduled" | "In Progress" | "Halftime" | "Final" =
    "Scheduled";

  if (rawStatusText.includes("final")) {
    statusDisplay = "Final";
  } else if (rawStatusText.includes("halftime")) {
    statusDisplay = "Halftime";
  } else if (
    rawStatusText.includes("in progress") ||
    rawStatusText.includes("in play") ||
    rawStatusText.includes("1st half") ||
    rawStatusText.includes("2nd half") ||
    rawStatusText.includes("overtime") ||
    (hasActiveClock && periodNum > 0)
  ) {
    statusDisplay = "In Progress";
  } else {
    statusDisplay = "Scheduled";
  }

  const isScheduled = statusDisplay === "Scheduled";
  const isFinal = statusDisplay === "Final";
  const isHalftime = statusDisplay === "Halftime";

  // Scores: hide anything meaningful when game is scheduled
  const displayHomeScore = isScheduled
    ? 0
    : liveScore?.home?.total ?? gameObj.scores?.home?.total ?? 0;

  const displayAwayScore = isScheduled
    ? 0
    : liveScore?.away?.total ?? gameObj.scores?.away?.total ?? 0;

  // Quarter label (only for live / halftime)
  let quarterLabel = "";
  if (!isScheduled && !isFinal) {
    if (periodNum === 1) quarterLabel = "1st";
    else if (periodNum === 2) quarterLabel = "2nd";
    else if (periodNum > 2) quarterLabel = `${periodNum - 2}OT`;
  }

  const displayQuarter =
    statusDisplay === "In Progress" || statusDisplay === "Halftime"
      ? formatQuarter(quarterLabel)
      : "";

  // Line score (only useful when not scheduled)
  const lineScore =
    !isScheduled && liveScore?.periodScores?.length
      ? {
          home: liveScore.periodScores.map((p) => p.home.toString()),
          away: liveScore.periodScores.map((p) => p.away.toString()),
        }
      : undefined;

  // Only show deep game details once the game has started or finished
  const shouldShowGameDetails = !isScheduled;

  // -----------------------------
  // Header Setup
  // -----------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamCode={homeTeamData.code}
          awayTeamCode={awayTeamData.code}
          isNeutralSite={!!neutralSite}
          league="CBB"
        />
      ),
    });
  }, [navigation, neutralSite, homeTeamData.code, awayTeamData.code]);

  // -----------------------------
  // Loading Delay for UI Smoothness
  // -----------------------------
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          headlineText={headlineText}
          homeTeamData={homeTeamData}
          awayTeamData={awayTeamData}
          home={{ name: homeTeamData.name }}
          away={{ name: awayTeamData.name }}
          rankHome={`${getTeamRank(String(homeEspnId)) ?? ""}`}
          rankAway={`${getTeamRank(String(awayEspnId)) ?? ""}`}
          homeScore={displayHomeScore}
          awayScore={displayAwayScore}
          status={statusDisplay}
          period={displayQuarter}
          halftime={isHalftime}
          awayTimeouts={9}
          homeTimeouts={9}
          // Hide clock when scheduled or final, show only for live/halftime
          displayClock={
            statusDisplay === "In Progress" || statusDisplay === "Halftime"
              ? displayClock
              : undefined
          }
          colors={colors}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          refreshTick={0}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          league="cbb"
        />

        <View style={{ gap: 24, marginTop: 20 }}>
          {/* Live-only details */}
          {shouldShowGameDetails && <LastPlay lastPlay={liveScore?.lastPlay} />}

          {shouldShowGameDetails && lineScore && (
            <LineScore
              linescore={lineScore}
              homeCode={homeTeamData.code}
              awayCode={awayTeamData.code}
              league="CBB"
            />
          )}

          {/* Odds + Fan Vote (always shown) */}
          <GameOddsSection
            date={gameDateStr}
            gameDate={gameDateStr}
            awayCode={awayTeamData.code ?? ""}
            homeCode={homeTeamData.code ?? ""}
            gameId={`${homeTeamId}-${awayTeamId}`}
          />

          <WinPredictionVote
            gameId={`${homeTeamId}-${awayTeamId}`}
            awayTeam={{
              id: awayTeamData.id,
              name: awayTeamData.name,
              code: awayTeamData.code,
              logo: awayTeamData.logo,
              logoLight: awayTeamData.logoLight,
              color: awayTeamData.color,
            }}
            homeTeam={{
              id: homeTeamData.id,
              name: homeTeamData.name,
              code: homeTeamData.code,
              logo: homeTeamData.logo,
              logoLight: homeTeamData.logoLight,
              color: homeTeamData.color,
            }}
          />

          {/* Leaders / Box / Shot Chart / Summary – only when game started/finished */}
          {shouldShowGameDetails && (
            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(awayTeamData.espnID)}
              homeTeamId={Number(homeTeamData.espnID)}
            />
          )}

          {shouldShowGameDetails && (
            <ShotChart
              plays={plays}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              neutralSite={neutralSite}
              isCBB={true}
            />
          )}

          {shouldShowGameDetails && (
            <GameSummary
              plays={plays ?? []}
              homeTeamId={String(homeEspnId)}
              awayTeamId={String(awayEspnId)}
              league="CBB"
            />
          )}

          {shouldShowGameDetails && (
            <BoxScore
              playerStats={playerStats}
              homeTeamId={Number(homeEspnId)}
              awayTeamId={Number(awayEspnId)}
            />
          )}

          {/* Last 5 games – always useful */}
          <LastFiveGamesSwitcher
            isDark={isDark}
            home={{
              teamCode: homeTeamData.code!,
              teamLogo: homeTeamData.logo,
              teamLogoLight: homeTeamData.logoLight,
              games: homeLastGames.games,
            }}
            away={{
              teamCode: awayTeamData.code!,
              teamLogo: awayTeamData.logo,
              teamLogoLight: awayTeamData.logoLight,
              games: awayLastGames.games,
            }}
            league="CBB"
          />

          {/* Highlights (if any) */}
          {highlights?.length > 0 && (
            <HighlightVideoList highlights={highlights} />
          )}

          {/* Officials */}
          <Officials officials={officials ?? []} loading={false} error={null} />

          {/* Venue Location */}
          <TeamLocationSection
            venueImage={resolvedVenue.image}
            venueName={resolvedVenue.name}
            location={resolvedVenue.city}
            address={resolvedVenue.address}
            venueCapacity={String(resolvedVenue.capacity ?? "")}
            loading={false}
            error={null}
          />
        </View>
      </ScrollView>

      {/* Floating Chat Button */}
      <Animated.View
        style={{
          opacity: opacityAnim,
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
        }}
        pointerEvents={isChatOpen ? "none" : "auto"}
      >
        <FloatingChatButton
          gameId={`${homeTeamId}-${awayTeamId}`}
          openChat={openChat}
        />
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
