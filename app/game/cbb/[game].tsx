import BoxScore from "components/CBB/GameDetails/BoxScore";
import GameLeaders from "components/CBB/GameDetails/GameLeaders";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FloatingChatButton from "components/FloatingButton";
import { LastFiveGamesSwitcher, LineScore } from "components/GameDetails";
import GameHeader from "components/GameDetails/GameHeader";
import GameOddsSection from "components/GameDetails/GameOddsSection";
import GameSummary from "components/GameDetails/GameSummary";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastPlay from "components/GameDetails/LastPlay";
import Officials from "components/GameDetails/Officials";
import ShotChart from "components/GameDetails/ShotChart";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import { Colors } from "constants/Colors";
import { teams } from "constants/teamsCBB";
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

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();

  /** -----------------------------
   *  Parse Full Game Object
   *  ----------------------------- */
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

  /** -----------------------------
   *  Extract Team IDs
   *  ----------------------------- */
  const homeTeamId = Number(gameObj?.teams?.home?.id);
  const awayTeamId = Number(gameObj?.teams?.away?.id);

  const homeTeamData = teams.find((t) => Number(t.id) === homeTeamId);
  const awayTeamData = teams.find((t) => Number(t.id) === awayTeamId);

  if (!homeTeamData || !awayTeamData) {
    console.warn("Missing team data for IDs:", { homeTeamId, awayTeamId });
    return null;
  }

  /** -----------------------------
   *  Date Handling
   *  ----------------------------- */
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

  /** -----------------------------
   *  Navigation + UI Controls
   *  ----------------------------- */
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

  /** -----------------------------
   *  ESPN IDs
   *  ----------------------------- */
  const homeEspnId = homeTeamData.espnID;
  const awayEspnId = awayTeamData.espnID;

  /** -----------------------------
   *  Rankings
   *  ----------------------------- */
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

  /** -----------------------------
   *  Colors
   *  ----------------------------- */
  const colors = useMemo(
    () => ({
      background: isDark ? Colors.black : Colors.white,
      text: isDark ? Colors.dark.white : Colors.light.black,
      secondaryText: isDark ? Colors.lightGray : Colors.darkGray,
      record: isDark ? Colors.dark.white : Colors.light.black,
      score: isDark ? Colors.lightGray : Colors.darkGray,
      winnerScore: isDark ? Colors.dark.white : Colors.light.black,
      border: isDark ? Colors.darkGray : Colors.lightGray,
      finalText: isDark ? Colors.dark.lightRed : Colors.light.red,
    }),
    [isDark]
  );

  /** -----------------------------
   *  Hooks (Scores, Records, Weather, Headlines, Broadcasts)
   *  ----------------------------- */
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

  const { officials, highlights, plays, playerStats, leaders, neutralSite } =
    useGameDetails("cbb", homeEspnId, awayEspnId, gameDate);

  /** -----------------------------
   *  Status + Quarter Formatting
   *  ----------------------------- */
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

  const displayHomeScore = liveScore?.home?.total ?? 0;
  const displayAwayScore = liveScore?.away?.total ?? 0;
  const displayClock = liveScore?.displayClock ?? "";
  const statusDisplay = liveScore?.status ?? "Scheduled";

  const isHalftime =
    liveScore?.statusText?.toLowerCase().includes("halftime") ?? false;

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  const periodNum = Number(liveScore?.period ?? 0);
  let quarterLabel = "";
  if (periodNum === 1) quarterLabel = "1st";
  else if (periodNum === 2) quarterLabel = "2nd";
  else if (periodNum > 2) quarterLabel = `${periodNum - 2}OT`;

  const displayQuarter = formatQuarter(quarterLabel);

  const shouldShowLeaders =
    gameObj.status.long !== "Not Started" &&
    leaders?.some((g) =>
      g.leaders.some((c) => Array.isArray(c.leaders) && c.leaders.length > 0)
    );

  const shouldShowGameDetails = gameObj.status.long !== "Not Started";

  /** -----------------------------
   *  Header
   *  ----------------------------- */
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

  /** -----------------------------
   *  Loading Delay for UI Smoothness
   *  ----------------------------- */
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  /** -----------------------------
   *  RENDER
   *  ----------------------------- */
  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        style={{ backgroundColor: colors.background }}
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
          displayClock={displayClock}
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
          <GameOddsSection
            date={gameDate}
            gameDate={gameDate}
            homeCode={homeTeamData.code!}
            awayCode={awayTeamData.code!}
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

          
          {shouldShowGameDetails && <LastPlay lastPlay={liveScore?.lastPlay} />}

          {shouldShowGameDetails && (
            <LineScore
              linescore={lineScore}
              homeCode={homeTeamData.code}
              awayCode={awayTeamData.code}
              league="CBB"
            />
          )}

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

          {highlights?.length > 0 && (
            <HighlightVideoList highlights={highlights} />
          )}

          <Officials officials={officials ?? []} loading={false} error={null} />
        </View>
      </ScrollView>

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
