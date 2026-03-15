import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CompetitorInfo from "components/CompetitorInfo";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/Styles";
import { getCBBTeamLogo, neutralVenues, teams } from "constants/teamsCBB";
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
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";

type Props = {
  visible: boolean;
  game: CBBGame;
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
  if (!game) return null;

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
      ? new Date(game.date)
      : null;

  // Championship: April 7
  const isChampionship =
    gameDate?.getMonth() === 3 && gameDate?.getDate() === 7;

  const styles = gamePreviewModalStyle(isChampionship);

  const teamIdKey = isWomen ? "wid" : "id";

  const home = teams.find(
    (t) => String((t as any)[teamIdKey]) === String(game.teams.home?.id),
  );

  const away = teams.find(
    (t) => String((t as any)[teamIdKey]) === String(game.teams.away?.id),
  );

  const { data: gameStats } = useGameStatistics(game?.id ?? 0);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;
  const homeLogo = getCBBTeamLogo(home?.id, true, isWomen);
  const awayLogo = getCBBTeamLogo(away?.id, true, isWomen);
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) requestAnimationFrame(() => sheetRef.current?.present());
    else requestAnimationFrame(() => sheetRef.current?.dismiss());
  }, [visible]);

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
    (gameDate?.getMonth() === 2 && gameDate?.getDate() >= 18) || // March (2)
    (gameDate?.getMonth() === 3 && gameDate?.getDate() <= 7); // April (3)

  // Final Four: April 5–7
  const isFinalFour =
    gameDate?.getMonth() === 3 &&
    gameDate?.getDate() >= 5 &&
    gameDate?.getDate() <= 7;

  const {
    score: liveScore,
    details,
    loading: liveScoreLoading,
  } = useGameDetails(
    isWomen ? "wcbb" : "cbb",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDateStr,
  );

  // --- Broadcasts ---
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Period scores / line score ---
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

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

  const venueNameRaw = (venue?.name ?? (home as any)?.venueName ?? "")
    .trim()
    .toLowerCase();

  const neutralMatch = Object.entries(neutralVenues).find(
    ([key]) => key.trim().toLowerCase() === venueNameRaw,
  );

  const neutralVenueData = neutralMatch ? (neutralMatch[1] as any) : null;

  const lat = neutralVenueData?.latitude ?? home?.latitude ?? null;
  const lon = neutralVenueData?.longitude ?? home?.longitude ?? null;

  // --- Team Rankings ---
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;

  // Team records
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  const homeScore = liveScore?.home?.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away?.total ?? game.scores?.away?.total ?? 0;
  const { weather } = useWeatherForecast(lat, lon, gameDateStr);

  const {
    homeColor,
    awayColor,
    resolvedVenueImage,
    resolvedVenueName,
    resolvedVenueCity,
    resolvedVenueAddress,
    resolvedVenueCapacity,
  } = useMemo(() => {
    // Base venue = HOME TEAM (default for home games)
    let resolvedVenue: {
      image?: string;
      name?: string;
      city?: string;
      address?: string;
      capacity?: number | string;
    } = {
      image: home?.venueImage,
      name: home?.venueName,
      city: home?.location,
      address: home?.address,
      capacity: home?.venueCapacity,
    };

    // Use ESPN venue object if available
    if (venue) {
      resolvedVenue = {
        ...resolvedVenue,
        image: venue.images?.[0]?.href ?? resolvedVenue.image,
        name: venue.fullName ?? venue.name ?? resolvedVenue.name,
        city: venue.address?.city ?? resolvedVenue.city,
        address: venue.address?.street ?? resolvedVenue.address,
        capacity: venue.capacity ?? resolvedVenue.capacity,
      };
    }

    // Neutral site override (Final Four, Championship, etc.)
    if (neutralVenueData) {
      resolvedVenue = {
        image: neutralVenueData.venueImage ?? resolvedVenue.image,
        name: neutralVenueData.name ?? resolvedVenue.name,
        city: neutralVenueData.city ?? resolvedVenue.city,
        address: neutralVenueData.address ?? resolvedVenue.address,
        capacity: neutralVenueData.venueCapacity ?? resolvedVenue.capacity,
      };
    }

    // Normalize capacity → number
    const normalizedCapacity = (() => {
      const raw = resolvedVenue.capacity;
      if (raw == null) return undefined;
      const num = typeof raw === "string" ? Number(raw.replace(/,/g, "")) : raw;
      return Number.isFinite(num) ? num : undefined;
    })();

    const getTeamColor = (team?: (typeof teams)[number]) =>
      team?.color ?? Colors.darkGray;

    return {
      homeColor: getTeamColor(home),
      awayColor: getTeamColor(away),
      resolvedVenueImage: resolvedVenue.image,
      resolvedVenueName: resolvedVenue.name,
      resolvedVenueCity: resolvedVenue.city,
      resolvedVenueAddress: resolvedVenue.address,
      resolvedVenueCapacity: normalizedCapacity,
    };
  }, [home, away, venue, neutralVenueData]);

  const homeColorTransparent = homeColor + "80"; // CC ≈ 80% opacity
  const awayColorTransparent = awayColor + "80"; // CC ≈ 80% opacity

  function formatCBBPeriod(period: number, isWomen: boolean): string {
    if (!period || period <= 0) return "";

    // ---------------- WOMEN (4 quarters) ----------------
    if (isWomen) {
      if (period === 1) return "1st";
      if (period === 2) return "2nd";
      if (period === 3) return "3rd";
      if (period === 4) return "4th";

      const ot = period - 4;
      return ot === 1 ? "OT" : `${ot}OT`;
    }

    // ---------------- MEN (2 halves) ----------------
    if (period === 1) return "1st";
    if (period === 2) return "2nd";

    const ot = period - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  }

  const homeLastGames = useLastFiveGames(
    Number(game.teams.home?.id) || 0,
    isWomen,
  );
  const awayLastGames = useLastFiveGames(
    Number(game.teams.away?.id) || 0,
    isWomen,
  );
  const week = game.week;
  const round =
    week === "NCAA - Final"
      ? "NCAA Men's Basketball Championship"
      : week === "NCAA - Semi-finals"
        ? "Final Four"
        : week === "NCAA - Quarter-finals"
          ? "Elite Eight"
          : (week ?? "");

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
              ? ["#DFBD69", "#CDA765"]
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
              <CustomActivityIndicator lighter />
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
                <CompetitorInfo
                  team={away}
                  name={away?.code ?? away?.shortName ?? away?.name ?? "Away"}
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
                  period={formatCBBPeriod(Number(liveScore?.period), isWomen)}
                  formattedDate={formattedDate}
                  formattedTime={formattedTime}
                  isDark={isDark}
                />

                <CompetitorInfo
                  team={home}
                  name={home?.code ?? home?.shortName ?? home?.name ?? "Home"}
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
                  gameStats={gameStats}
                  teamStats={teamStats}
                  leaders={leaders}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  isDark={isDark}
                  gameDateISO={gameDateISO} // 👈 NEW
                  gameDateStr={gameDateStr} // 👈 stays
                  resolvedVenueImage={resolvedVenueImage}
                  resolvedVenueName={resolvedVenueName}
                  resolvedVenueCity={resolvedVenueCity}
                  resolvedVenueAddress={resolvedVenueAddress}
                  resolvedVenueCapacity={resolvedVenueCapacity}
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
