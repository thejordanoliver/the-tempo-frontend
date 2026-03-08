import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import FloatingChatButton from "components/FloatingButton";
import { useNavigation } from "expo-router";
import { useMMADetails } from "hooks/MMAHooks/useMMADetails";
import React, { useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useChatStore } from "store/chatStore";
import { MMAFight } from "types/mma";
import { getBroadcastDisplay } from "utils/matchBroadcast";
/* ------------------------------------------------------------------ */
/* Screen                                                             */
/* ------------------------------------------------------------------ */

export default function GameDetailsScreen({ game }: { game: MMAFight }) {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  const { openChat, isOpen: isChatOpen } = useChatStore();
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
  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);
  const gameDateStr = gameDate.toISOString();

  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime =
    gameDate?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const firstFighterId = game.fighters.first.id;
  const secondFighterId = game.fighters.second.id;

  const firstFighterName =
    game.fighters?.first?.info?.short_name ?? game.fighters.first.name;
  const secondFighterName =
    game.fighters?.second?.info?.short_name ?? game.fighters.second.name;

  const firstFighterPhoto =
    game.fighters?.first?.info?.images[2]?.href ??
    game.fighters.first.logo ??
    placeholderImage;
  const secondFighterPhoto =
    game.fighters?.second?.info?.images[2]?.href ??
    game.fighters.second.logo ??
    placeholderImage;

  const firstFighterEspnId = game.fighters?.first?.info?.espn_id;
  const secondFighterEspnId = game.fighters?.second?.info?.espn_id;

  const { details, loading: isLoadingGame } = useMMADetails(
    "ufc",
    firstFighterEspnId,
    secondFighterEspnId,
    gameDateStr,
  );

  const firstFighterRecord = details?.fight?.fighters.first.record;
  const secondFighterRecord = details?.fight?.fighters.second.record;

  const gameStatusDescription = details?.fight?.status.description;
  const gameStatusDetail = details?.fight?.status.shortDetail;
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isFinal = gameStatusDescription === "Final";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isEndOfRound = gameStatusDescription === "End of Round";
  const inProgress = gameStatusDescription === "In Progress";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  
  // --- Broadcasts ---
  const broadcasts = details?.fight?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const isIntros = game.status.long === "Intros";
  const isPreFight = game.status.long === "Pre-fight";
  const isWalkingOut = game.status.long === "Walkouts";
  const period = details?.fight?.rounds;
  const displayClock = details?.fight?.rounds;
  const headline = details?.event?.shortName;

  const isMainEvent = game.is_main === true;

  const firstFighterWinner = game.fighters.first.winner === true;
  const secondFighterWinner = game.fighters.second.winner === true;
  const isTie =
    game.fighters.first.winner === false &&
    game.fighters.second.winner === false;
  if (isLoadingGame) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        {!dontShowDetails && <View style={{ gap: 20, marginTop: 20 }}></View>}
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
          gameId={`${firstFighterId}-${secondFighterId}`}
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
