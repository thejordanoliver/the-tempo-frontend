//./CFB/GamePreview/CFBGamePreviewModal.tsx
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { getNeutralVenue } from "@/constants/neutralVenues";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useHockeyGameDetails } from "@/hooks/HockeyHooks/useHockeyGameDetails";
import { useWeatherForecast } from "@/hooks/useWeather";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { HockeyGame } from "types/hockey";
import { formatQuarter, getBroadcastDisplay } from "utils/games";
import { snapPoints } from "utils/modalUtils";
import CenterInfo from "../../NBA/GamePreview/CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  game: HockeyGame;
  isNHL: boolean;
  isMCH: boolean;
  visible: boolean;
  onClose: () => void;
};

export default function HockeyGamePreviewModal({
  game,
  isNHL = false,
  isMCH = false,
  visible,
  onClose,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameDateObj = new Date(game.date);
  const formattedDate = gameDateObj.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const LEAGUE = game?.league?.code ?? "nhl";
  const gameId = game?.id;

  const home = game.home;
  const away = game.away;
  const awayId = away.id;
  const homeId = home.id;
  const homeTeam = getNHLTeam(homeId);
  const awayTeam = getNHLTeam(awayId);
  const homeLogo = getNHLTeamLogo(homeId, true);
  const awayLogo = getNHLTeamLogo(awayId, true);

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const homeCode = homeTeam?.code ?? "";
  const awayCode = awayTeam?.code ?? "";
  const homeName = homeTeam?.fullName ?? "";
  const awayName = awayTeam?.fullName ?? "";
  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const homeLastGames = useLastFiveGames(homeId, "hockey", LEAGUE);
  const awayLastGames = useLastFiveGames(awayId, "hockey", LEAGUE);
  const { details, score } = useHockeyGameDetails(LEAGUE, gameId);

  const isLoading = !!details;
  const headlineText = game?.headline;
  const isChampionship = headlineText.includes("Stanley Cup Final");
  const styles = gamePreviewModalStyle(isChampionship);
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const gameStatusDescription = game.status.description ?? "";
  const gameStatusDetail = game.status.shortDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const dontShowDetails = isDelayed || isCanceled || isPostponed || isForfeited;
  const period = formatQuarter(game.status.period, false, true);
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const homeRecord = game?.home?.record ?? "0-0";
  const awayRecord = game?.away?.record ?? "0-0";
  const clock = game.status?.clock;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  /* ---------------- Neutral site / venue ---------------- */
  const baseVenue = details?.venue;
  const neutralSite = details?.neutralSite;
  const neutralVenue = getNeutralVenue(baseVenue?.fullName, neutralSite);
  const baseVenueAddress = baseVenue?.address;
  const baseVenueAddressDisplay = [
    baseVenueAddress?.city,
    baseVenueAddress?.state,
    baseVenueAddress?.zipCode,
    baseVenueAddress?.country,
  ]
    .filter(Boolean)
    .join(" ");
  const venueName = neutralSite
    ? neutralVenue?.name || baseVenue?.fullName
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address || baseVenueAddressDisplay;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? null)
    : (homeTeam?.latitude ?? null);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? null)
    : (homeTeam?.longitude ?? null);
  const venueAttendance = details?.venue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, formattedDate);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
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
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0 }}
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
          {!isLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {headlineText && (
                <>
                  {headlineText && (
                    <Text style={styles.headlineText}>{headlineText}</Text>
                  )}
                </>
              )}

              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  logo={awayLogo}
                  name={awayCode}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                />

                <CenterInfo
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcast={broadcast}
                  period={period}
                  clock={clock}
                  time={formattedTime}
                  date={formattedDate}
                />
                <TeamInfo
                  side="home"
                  logo={homeLogo}
                  name={homeCode}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  homeColor={homeColor}
                  gameStatusDescription={gameStatusDescription}
                  awayCode={awayCode}
                  homeCode={homeCode}
                  awayColor={awayColor}
                  awayLogo={awayLogo}
                  awayName={awayName}
                  homeName={homeName}
                  homeTeamId={homeId}
                  awayTeamId={awayId}
                  homeLogo={homeLogo}
                  lineScore={lineScore}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  venueImage={venueImage}
                  venueName={venueName}
                  venueLocation={venueLocation}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  weather={weather}
                  league={LEAGUE}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
