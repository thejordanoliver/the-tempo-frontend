// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { getNeutralVenue } from "@/constants/neutralVenues";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { useFootballGameDetails } from "@/hooks/FootballHooks/useFootballGameDetails";
import { useLastFiveGames } from "@/hooks/FootballHooks/useLastFiveGames";
import { useWeatherForecast } from "@/hooks/useWeather";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import {
  formatQuarter,
  formatVenueAddress,
  getBroadcastDisplay,
} from "@/utils/games";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { CenterInfo } from "components/Sports/Football/GamePreview/CenterInfo";
import { Colors } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FootballGame } from "types/football";
import { getFootballSeason, getHolidayLabel } from "utils/dateUtils";
import { snapPoints } from "utils/modalUtils";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";

type Props = {
  game: FootballGame;
  isNFL: boolean;
  isCFB: boolean;
  visible: boolean;
  onClose: () => void;
};

export default function FootballGamePreviewModal({
  game,
  isNFL,
  isCFB,
  visible,
  onClose,
}: Props) {
  const currentSeason = getFootballSeason();
  const sheetRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) {
      requestAnimationFrame(() => sheetRef.current?.present());
    } else {
      requestAnimationFrame(() => sheetRef.current?.dismiss());
    }
  }, [visible]);

  const gameDateObj = new Date(game.date);
  const formattedDate = gameDateObj.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const gameId = game.id;
  const LEAGUE = game?.league?.code ?? "nfl";

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;

  const home = isNFL
    ? getNFLTeam(homeId)
    : isCFB
      ? getCFBTeam(homeId)
      : getUFLTeam(homeId);
  const away = isNFL
    ? getNFLTeam(awayId)
    : isCFB
      ? getCFBTeam(awayId)
      : getUFLTeam(awayId);

  const homeCode = home?.code ?? "";
  const awayCode = away?.code ?? "";

  const homeLogo = isNFL
    ? getNFLTeamLogo(homeId, true)
    : isCFB
      ? getCFBTeamLogo(homeId, true)
      : getUFLTeamLogo(homeId, true);
  const awayLogo = isNFL
    ? getNFLTeamLogo(awayId, true)
    : isCFB
      ? getCFBTeamLogo(awayId, true)
      : getUFLTeamLogo(awayId, true);

  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

  const { score, details } = useFootballGameDetails(LEAGUE, gameId);
  const homeLastGames = useLastFiveGames(homeId, LEAGUE, currentSeason);
  const awayLastGames = useLastFiveGames(awayId, LEAGUE, currentSeason);
  const neutralSite = game.isNeutralSite;
  const gameStatusDescription = game?.status.description ?? "";
  const gameStatusDetail = game?.status.shortDetail ?? "";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const dontShowDetails = isDelayed || isCanceled || isPostponed || isForfeited;
  const clock = game.status?.displayClock;
  const period = formatQuarter(game.status?.period);
  const isRedzone = game?.situation.isRedZone;
  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const downDistanceText = game.situation.downDistanceText;
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = game.headline ?? holidayLabel;
  const possessionTeamId = game.situation.possession;
  const homeRecord = game.home.record;
  const awayRecord = game.away.record;
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const officials = details?.officials ?? [];
  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;
  const homeRank = game.home.rank ?? null;
  const awayRank = game.away.rank ?? null;
  const isChampionship =
    game?.headline?.includes("Super Bowl") ??
    game?.headline?.includes("Championship");
  const styles = gamePreviewModalStyle(isChampionship);
  const homeHasPossession = inProgress && possessionTeamId === home?.espnId;
  const awayHasPossession = inProgress && possessionTeamId === away?.espnId;
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = awayScore === homeScore;
  const lineScore = score?.periodScores?.length
    ? {
        home: score.periodScores.map((p) => p.home.toString()),
        away: score.periodScores.map((p) => p.away.toString()),
      }
    : undefined;
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
  const venueAttendance = baseVenue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, formattedDate);
  const isLoading = !!details;

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
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
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* HEADER */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  logo={awayLogo}
                  name={awayCode}
                  rank={awayRank}
                  score={awayScore}
                  isWinner={awayWins}
                  isTie={isTie}
                  record={awayRecord}
                  hasPossession={awayHasPossession}
                  gameStatusDescription={gameStatusDescription}
                  timeouts={0}
                />

                <CenterInfo
                  broadcast={broadcast}
                  period={period}
                  clock={clock}
                  date={formattedDate}
                  time={formattedTime}
                  downAndDistance={downDistanceText}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  redzone={isRedzone}
                />

                <TeamInfo
                  side="home"
                  logo={homeLogo}
                  name={homeCode}
                  rank={homeRank}
                  score={homeScore}
                  isWinner={homeWins}
                  isTie={isTie}
                  record={homeRecord}
                  hasPossession={homeHasPossession}
                  gameStatusDescription={gameStatusDescription}
                  timeouts={0}
                />
              </View>

              {!dontShowDetails && (
                <GamePreviewContent
                  homeLogo={homeLogo}
                  homeCode={homeCode}
                  homeColor={homeColor}
                  homeLastGames={homeLastGames}
                  awayLogo={awayLogo}
                  awayCode={awayCode}
                  awayColor={awayColor}
                  awayLastGames={awayLastGames}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  lineScore={lineScore}
                  weather={weather}
                  venueImage={venueImage}
                  venueCapacity={venueCapacity}
                  venueName={venueName}
                  venueLocation={venueLocation}
                  venueAddress={venueAddress}
                  venueAttendance={venueAttendance}
                  gameStatusDescription={gameStatusDescription}
                  officials={officials}
                  isChampionship={isChampionship}
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
