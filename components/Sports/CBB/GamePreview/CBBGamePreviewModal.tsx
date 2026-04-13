import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BasketballGame } from "types/types";
import { formatCBBQuarter, resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  visible: boolean;
  game: BasketballGame;
  onClose: () => void;
  isWomen?: boolean;
};

export default function CBBGamePreviewModal({
  visible,
  game,
  onClose,
  isWomen = false,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) requestAnimationFrame(() => sheetRef.current?.present());
    else requestAnimationFrame(() => sheetRef.current?.dismiss());
  }, [visible]);

  if (!game) return null;

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
      ? new Date(game.date)
      : null;

  const week = game.week;
  const round =
    week === "NCAA - Final"
      ? "NCAA Men's Basketball Championship"
      : week === "NCAA - Semi-finals"
        ? "Final Four"
        : week === "NCAA - Quarter-finals"
          ? "Elite Eight"
          : (week ?? "");

  const isChampionship = week === "NCAA - Final";
  const isFinalFour = week === "NCAA - Semi-finals";
  const styles = gamePreviewModalStyle(isChampionship);

  const home = getCBBTeam(game.teams.home.id ?? "", isWomen);
  const away = getCBBTeam(game.teams.away.id ?? "", isWomen);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;
  const homeLogo = getCBBTeamLogo(home?.id, true, isWomen);
  const awayLogo = getCBBTeamLogo(away?.id, true, isWomen);
  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";
  const { data: gameStats } = useGameStatistics(game?.id ?? 0);

  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const formattedTime = gameDate
    ? gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const gameDateISO = gameDate ? gameDate.toISOString() : "";
  const gameDateStr = gameDateISO ? gameDateISO.split("T")[0] : "";

  // March Madness runs March 18 – April 7
  const isMarchMadness =
    (gameDate?.getMonth() === 2 && gameDate?.getDate() >= 18) ||
    (gameDate?.getMonth() === 3 && gameDate?.getDate() <= 7);

  const { score: liveScore, details } = useGameDetails(
    isWomen ? "wcbb" : "cbb",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDateStr,
  );

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const displayClock = liveScore?.displayClock;
  const teamStats = liveScore?.teamStats;
  const headline = details?.headline;
  const highlights = details?.highlights ?? [];
  const officials = details?.officials ?? [];
  const venue = details?.venue; // optional
  const leaders = liveScore?.leaders ?? [];
  const neutralSite = details?.neutralSite;
  const league = isWomen ? "WCBB" : "CBB";
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;
  const homeScore = liveScore?.home?.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away?.total ?? game.scores?.away?.total ?? 0;
  const playerStats = liveScore?.playerStats ?? [];
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
        homeTeam: home,
        isNeutralSite: neutralSite,
        league,
      }),
    [details?.venue, home, neutralSite, league],
  );

  const { weather } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

  const homeLastGames = useLastFiveGames(
    Number(game.teams.home?.id) || 0,
    isWomen,
  );
  const awayLastGames = useLastFiveGames(
    Number(game.teams.away?.id) || 0,
    isWomen,
  );

  const isLiveScoreReady = !!liveScore;

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enableContentPanningGesture
      enableHandlePanningGesture
      enableDynamicSizing={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundStyle={styles.backgroundStyle}
    >
      <View style={styles.container}>
        <Video
          source={require("assets/videos/background.mp4")}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted={true}
        />

        <LinearGradient
          colors={
            isChampionship
              ? [Colors.dark.gold, Colors.dark.gold]
              : [awayColor, awayColor, homeColor, homeColor]
          }
          locations={isChampionship ? undefined : [0, 0.4, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <BlurView
          intensity={100}
          tint={"systemUltraThinMaterialDark"}
          style={styles.blurViewContainer}
        >
          {!isLiveScoreReady ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator isDark />
            </View>
          ) : (
            <>
              {headline && (
                <>
                  {headline && (
                    <Text style={styles.headlineText}>{headline}</Text>
                  )}
                </>
              )}

              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  team={away}
                  name={away?.code}
                  logo={awayLogo}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                  side="away"
                  rank={awayRank}
                />

                <CenterInfo
                  isChampionship={isChampionship}
                  isFinalFour={isFinalFour}
                  isMarchMadness={isMarchMadness}
                  round={round ?? ""}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcastNetworks={broadcastText}
                  clock={displayClock}
                  period={formatCBBQuarter(Number(liveScore?.period), isWomen)}
                  formattedDate={formattedDate}
                  formattedTime={formattedTime}
                  isDark={isDark}
                />

                <TeamInfo
                  team={home}
                  name={home?.code}
                  logo={homeLogo}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                  side="home"
                  rank={homeRank}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  game={game}
                  home={home}
                  away={away}
                  lineScore={lineScore}
                  teamStats={teamStats}
                  playerStats={playerStats}
                  leaders={leaders}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  isDark={isDark}
                  resolvedVenueImage={resolvedVenue.image}
                  resolvedVenueName={resolvedVenue.name}
                  resolvedVenueCity={resolvedVenue.city}
                  resolvedVenueAddress={resolvedVenue.address}
                  resolvedVenueCapacity={resolvedVenue.capacity}
                  weather={weather}
                  highlights={highlights}
                  gameStatusDescription={gameStatusDescription}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
