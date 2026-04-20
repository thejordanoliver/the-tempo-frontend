import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import GameHeader from "components/Sports/MMA/GameDetails/GameHeader";
import { GameLocation } from "components/Sports/NBA/GameDetails";
import MemoizedFloatingChatButton from "components/Sports/NBA/GameDetails/GameChat/MemoizedFloatingChatButton";
import { getNeutralVenue } from "constants/neutralVenues";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useMMADetails } from "hooks/MMAHooks/useMMADetails";
import { useScrollFade } from "hooks/useScrollFade";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useLayoutEffect } from "react";
import { Animated, ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { emptyFighter, MMAFight } from "types/mma";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import getDecisionType, { resultTypeMap } from "utils/MMAUtils/resultsUtils";

export default function GameDetailsScreen() {
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const { game } = useLocalSearchParams();
  const styles = gameDetailsScreenStyles;
  const parsedGame: MMAFight | null = game
    ? (JSON.parse(game as string) as MMAFight)
    : null;
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
          firstFighterId={firstFighterId}
          secondFighterId={secondFighterId}
          isNeutralSite
          league={"MMA"}
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
  const baseVenue = details?.venue;
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, true);
  const venueName = baseVenue?.fullName;
  const venueAddress = neutralVenue?.address;
  const venueCapacity = neutralVenue?.venueCapacity;
  const venueImage = neutralVenue?.venueImage ? neutralVenue?.venueImage : null;
  const venueLocation = neutralVenue?.city;
  const venueLat = neutralVenue?.latitude ?? 0;
  const venueLon = neutralVenue?.longitude ?? 0;
  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    venueLat,
    venueLon,
    gameDateStr,
  );

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
          <View style={styles.innerContainer}>
            <GameLocation
              venueImage={venueImage}
              venueName={venueName}
              location={venueLocation}
              address={venueAddress}
              venueCapacity={venueCapacity}
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
              isDark={isDark}
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
