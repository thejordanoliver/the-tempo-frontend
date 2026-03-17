import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MemoizedFloatingChatButton from "components/MemoizedFloatingChatButton";
import GameHeader from "components/Sports/MMA/GameDetails/GameHeader";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useMMADetails } from "hooks/MMAHooks/useMMADetails";
import { useScrollFade } from "hooks/useScrollFade";
import React, { useLayoutEffect } from "react";
import { Animated, ScrollView, useColorScheme, View } from "react-native";

import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { emptyFighter, MMAFight } from "types/mma";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import getDecisionType, { resultTypeMap } from "utils/MMAUtils/resultsUtils";

export default function GameDetailsScreen() {
  const { game } = useLocalSearchParams();
  const styles = gameDetailsScreenStyles;
  const parsedGame: MMAFight | null = game
    ? (JSON.parse(game as string) as MMAFight)
    : null;
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const { opacityAnim, handleScrollStart, handleScrollEnd, showDetails } =
    useScrollFade();
  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(parsedGame?.date);
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

  const firstFighter = parsedGame?.fighters?.first.info ?? emptyFighter;
  const secondFighter = parsedGame?.fighters?.second.info ?? emptyFighter;

  const firstFighterId = parsedGame?.fighters?.first.id;
  const secondFighterId = parsedGame?.fighters?.second.id;

  const firstFighterName =
    parsedGame?.fighters?.first?.info?.short_name ??
    parsedGame?.fighters?.first.name ??
    "";
  const secondFighterName =
    parsedGame?.fighters?.second?.info?.short_name ??
    parsedGame?.fighters?.second.name ??
    "";
  const firstFighterLastName =
    parsedGame?.fighters?.first?.info?.last_name ?? "";
  const secondFighterLastName =
    parsedGame?.fighters?.second?.info?.last_name ?? "";
  parsedGame?.fighters?.first?.logo ?? placeholderImage;

  const homeLogo = parsedGame?.fighters.first.info.flag_url;
  const awayLogo = parsedGame?.fighters.second.info.flag_url;

  const firstFighterEspnId = parsedGame?.fighters?.first?.info?.espn_id;
  const secondFighterEspnId = parsedGame?.fighters?.second?.info?.espn_id;

  const { details, loading: isLoading } = useMMADetails(
    "ufc",
    firstFighterEspnId,
    secondFighterEspnId,
    gameDateStr,
  );
  // console.log(details?.fight?.fightDetails[0].type.text)
  useLayoutEffect(() => {
    if (isLoading || !details) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Game"
          onBack={goBack}
          homeTeamId={firstFighterId}
          awayTeamId={secondFighterId}
          homeTeamCode={firstFighterLastName}
          awayTeamCode={secondFighterLastName}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          league="MMA"
        />
      ),
    });
  }, [navigation, isLoading, details, firstFighterName, secondFighterName]);

  const rawWonType = parsedGame?.result?.wonType;
  const firstFighterWinner = parsedGame?.fighters?.first?.winner === true;
  const secondFighterWinner = parsedGame?.fighters?.second?.winner === true;
  const wonType = getDecisionType(
    rawWonType ?? "",
    parsedGame?.result?.score,
    firstFighterWinner,
    secondFighterWinner,
  );
  const resultText = wonType ? (resultTypeMap[wonType] ?? wonType) : "Result";
  const firstFighterRecord = parsedGame?.fighters?.first?.info?.record;
  const secondFighterRecord = parsedGame?.fighters?.second?.info?.record;
  const gameStatusDescription = details?.fight?.status.description;
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const broadcasts = details?.fight?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const period = details?.fight?.status.period ?? 0;
  const displayClock = details?.fight?.status.displayClock ?? "";
  const headline = details?.event?.shortName ?? "";
  const address = details?.fight?.venue.address.address1;
  const venueName = details?.fight?.venue.fullName;
  const dontShowDetails = isDelayed || isCanceled || isPostponed;

  if (isLoading || !details) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /* ---------------- Render ---------------- */

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
          firstFighter={firstFighter}
          secondFighter={secondFighter}
          firstFighterRecord={firstFighterRecord}
          secondFighterRecord={secondFighterRecord}
          displayClock={displayClock}
          period={period}
          isDark={isDark}
          formattedDate={formattedDate}
          time={formattedTime}
          networkString={broadcastText}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={resultText}
          firstFighterIsWinner={firstFighterWinner}
          secondFighterIsWinner={secondFighterWinner}
        />
        {!dontShowDetails && (
          <View style={{ gap: 20, marginTop: 20 }}>
            <GameLocation
              venueImage={null}
              venueName={venueName}
              location={undefined}
              address={address}
              venueCapacity={""}
              venueAttendance={undefined}
              weather={null}
              loading={false}
              error={null}
            />
          </View>
        )}
      </ScrollView>
      <Animated.View style={{ opacity: opacityAnim }}>
        <MemoizedFloatingChatButton gameId={String(parsedGame?.id)} />
      </Animated.View>
    </>
  );
}
