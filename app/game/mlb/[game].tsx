import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { LineScore, TeamLocationSection } from "components/GameDetails";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import Officials from "components/GameDetails/Officials";
import WinPredictionVote from "components/GameDetails/WinPredictionVote";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import GameHeader from "components/MLB/GameDetails/GameHeader";
import GameSummary from "components/MLB/GameDetails/GameSummary";
import MLBInjuries from "components/MLB/GameDetails/MLBInjuries";
import { Colors } from "constants/Colors";
import { teams } from "constants/teamsMLB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useGameDetails } from "hooks/MLBHooks/useGameDetails";
import { useTeamRecord } from "hooks/MLBHooks/useTeamRecords";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useLayoutEffect, useMemo, useRef } from "react";
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

  const homeTeamData = teams.find((t) => String(t.id) === String(homeId));
  const awayTeamData = teams.find((t) => String(t.id) === String(awayId));

  if (!homeTeamData || !awayTeamData) return null;

  // -----------------------------------------------------
  // 🎨 Theme Colors
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // 📊 Team Records
  // -----------------------------------------------------
  const { record: awayRecord } = useTeamRecord(awayTeamData?.espnID, "mlb");
  const { record: homeRecord } = useTeamRecord(homeTeamData?.espnID, "mlb");

  // -----------------------------------------------------
  // 🔍 Game Details (safe + stable)
  // -----------------------------------------------------
  const {
    headline,
    gameNote,
    seasonState,
    seriesSummary,
    isPostseason,
    officials,
    injuries,
    highlights,
    plays,
    lineScore,
    venue,
    attendance,
    neutralSite,
  } = useGameDetails(
    "mlb",
    awayTeamData?.espnID,
    homeTeamData?.espnID,
    gameDate
  );

  // -----------------------------------------------------
  // 📺 Broadcasts
  // -----------------------------------------------------
  const { broadcasts } = useGameBroadcasts(
    homeTeamData.name,
    awayTeamData.name,
    gameDate,
    "mlb"
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  useLayoutEffect(() => {
    const safeHomeCode =
      homeTeamData?.code && homeTeamData.code !== "UNK"
        ? homeTeamData.code
        : "HOM";
    const safeAwayCode =
      awayTeamData?.code && awayTeamData.code !== "UNK"
        ? awayTeamData.code
        : "AWY";

    // -----------------------------------------------------
    // 🔙 Header
    // -----------------------------------------------------
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          league="MLB"
          homeTeamCode={safeHomeCode}
          awayTeamCode={safeAwayCode}
          isTeamScreen={false}
          isNeutralSite={neutralSite} // ESPN true/false from summary > scoreboard
        />
      ),
    });
  }, [homeTeamData, awayTeamData, neutralSite, navigation]);

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

  // -----------------------------------------------------
  // 🧱 UI Render
  // -----------------------------------------------------
  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        style={{ backgroundColor: colors.background }}
        stickyHeaderIndices={[0]}
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
      >
        <GameHeader
          gameNote={gameNote ?? ""}
          headlineText={headline ?? ""}
          seriesSummary={seriesSummary ?? ""}
          seasonState={seasonState}
          homeTeamData={homeTeamData}
          awayTeamData={awayTeamData}
          home={{
            name: parsedGame.teams.home.name,
            record: homeRecord?.overall || "0-0",
          }}
          away={{
            name: parsedGame.teams.away.name,
            record: awayRecord?.overall || "0-0",
          }}
          homeScore={parsedGame.scores.home.total}
          awayScore={parsedGame.scores.away.total}
          status={parsedGame.status}
          colors={colors}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          homeRecord={homeRecord}
          awayRecord={awayRecord}
          league="mlb"
        />

        <View style={{ gap: 20, marginTop: 20 }}>
          {parsedGame.status.short !== "FT" && (
            <WinPredictionVote
              gameId={parsedGame.id}
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
          )}

          <LineScore
            linescore={lineScore}
            homeCode={homeTeamData.code}
            awayCode={awayTeamData.code}
            league="MLB"
          />

          <GameSummary plays={plays ?? []} />

          <HighlightVideoList highlights={highlights} />

          <MLBInjuries
            injuries={injuries}
            loading={false}
            error={null}
            awayTeamAbbr={awayTeamData.code}
            homeTeamAbbr={homeTeamData.code}
          />

          <Officials officials={officials ?? []} loading={false} error={null} />

          <TeamLocationSection
            loading={false}
            error={null}
            venueImage={venue?.images?.[0]?.href}
            venueName={venue?.fullName || homeTeamData.venue}
            location={homeTeamData.city}
            address={homeTeamData.address}
            venueCapacity={String(homeTeamData.venueCapacity)}
            venueAttendance={String(attendance)}
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
