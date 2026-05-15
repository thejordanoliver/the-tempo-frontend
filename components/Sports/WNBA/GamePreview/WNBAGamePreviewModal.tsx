import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import CenterInfo from "components/Sports/CBB/GamePreview/CenterInfo";
import { Colors } from "constants/styles";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BasketballGame } from "types/basketball";
import { formatQuarter, resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";
import { getNeutralVenue } from "constants/neutralVenues";
type Props = {
  visible: boolean;
  game: BasketballGame;
  onClose: () => void;
};

const formatVenueAddress = (address?: {
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}) => {
  if (!address) return undefined;

  return [address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(" ");
};

export default function WNBAGamePreviewModal({
  visible,
  game,
  onClose,
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

  const isChampionship = false;

  const styles = gamePreviewModalStyle(isChampionship);

  const home = getWNBATeam(game.teams.home.id);
  const away = getWNBATeam(game.teams.away.id);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;
  const homeLogo = getWNBATeamLogo(home?.id, true);
  const awayLogo = getWNBATeamLogo(away?.id, true);
  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

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

  const { score: liveScore, details } = useGameDetails(
    "wnba",
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
  const leaders = liveScore?.leaders ?? [];
  const officials = details?.officials;
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
  const neutralSite = details?.neutralSite;
  const baseVenue = details?.venue;
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : home?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : home?.address || baseVenueAddress;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : home?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : home?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : home?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (home?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (home?.longitude ?? 0);
  const venueAttendance = details?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, game.date);

  const homeLastGames = useLastFiveGames(Number(game.teams.home?.id) || 0);
  const awayLastGames = useLastFiveGames(Number(game.teams.away?.id) || 0);

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
              <CustomActivityIndicator />
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
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcastNetworks={broadcastText}
                  clock={displayClock}
                  period={formatQuarter(Number(liveScore?.period))}
                  formattedDate={formattedDate}
                  formattedTime={formattedTime}
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
                  leaders={leaders}
                  teamStats={teamStats}
                  playerStats={playerStats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  venueImage={venueImage}
                  highlights={highlights}
                  venueLocation={venueLocation}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  weather={weather}
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
