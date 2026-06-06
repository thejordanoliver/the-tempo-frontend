import { getWNBATeam, getWNBATeamLogo } from "@/constants/teamsWNBA";
import { useLastFiveGames } from "@/hooks/BasketballHooks/useLastFiveGames";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import CenterInfo from "components/Sports/NBA/GamePreview/CenterInfo";
import TeamInfo from "components/Sports/NBA/GamePreview/TeamInfo";
import { getNeutralVenue } from "constants/neutralVenues";
import { Colors } from "constants/styles";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BasketballGame } from "types/basketball";
import { formatQuarter, getBroadcastDisplay } from "utils/games";
import { snapPoints } from "utils/modalUtils";
import GamePreviewContent from "./GamePreviewContent";

type Props = {
  visible: boolean;
  game: BasketballGame | null;
  onClose: () => void;
  isCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
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

export default function BasketballGamePreviewModal({
  visible,
  game,
  onClose,
  isCBB = false,
  isWCBB = false,
  isWNBA = false,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) requestAnimationFrame(() => sheetRef.current?.present());
    else requestAnimationFrame(() => sheetRef.current?.dismiss());
  }, [visible]);

  const gameDate = useMemo(() => {
    if (game?.timestamp) {
      return new Date(game.timestamp * 1000);
    }

    if (game?.date) {
      return new Date(game.date);
    }

    return null;
  }, [game?.timestamp, game?.date]);

  const detailsLeague = isWNBA ? "wnba" : isWCBB ? "wcbb" : "cbb";

  const homeId = game?.teams?.home?.id ?? 0;
  const awayId = game?.teams?.away?.id ?? 0;

  const home = isWNBA ? getWNBATeam(homeId) : getCBBTeam(homeId ?? "", isWCBB);
  const away = isWNBA ? getWNBATeam(awayId) : getCBBTeam(awayId ?? "", isWCBB);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;

  const homeName = home?.fullName || "";
  const awayName = away?.fullName || "";
  const homeCode = home?.code || "";
  const awayCode = away?.code || "";

  const homeLogo = isWNBA
    ? getWNBATeamLogo(homeId, true)
    : getCBBTeamLogo(homeId, true, isWCBB);
  const awayLogo = isWNBA
    ? getWNBATeamLogo(awayId, true)
    : getCBBTeamLogo(awayId, true, isWCBB);

  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
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
    detailsLeague,
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
  );

  const headline = details?.headline;

  const isChampionship = isWCBB
    ? headline === "Women's Basketball Championship - National Championship"
    : headline === "Men's Basketball Championship - National Championship";

  const styles = gamePreviewModalStyle(isChampionship);

  const LEAGUE = isWNBA ? "WNBA" : isWCBB ? "WCBB" : "CBB";

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);

  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";

  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;

  const period = formatQuarter(liveScore?.period);
  const displayClock = liveScore?.displayClock;

  const teamStats = liveScore?.teamStats ?? [];

  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;

  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const leaders = liveScore?.leaders ?? [];
  const officials = details?.officials ?? [];

  const homeRecord = details?.records?.home?.overall ?? "0-0";
  const awayRecord = details?.records?.away?.overall ?? "0-0";

  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;

  const homeScore = liveScore?.home?.total ?? game?.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away?.total ?? game?.scores?.away?.total ?? 0;

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

  const { weather } = useWeatherForecast(venueLat, venueLon, game?.date ?? "");

  const homeLastGames = useLastFiveGames(Number(homeId) || 0, isWCBB);
  const awayLastGames = useLastFiveGames(Number(awayId) || 0, isWCBB);

  const isLoading = !!liveScore;

  if (!game) return null;

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
          {!isLoading ? (
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
                  side={"away"}
                  name={awayCode}
                  logo={awayLogo}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                  rank={awayRank}
                  timeouts={null}
                  bonusState={null}
                />

                <CenterInfo
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcast={broadcastText}
                  clock={displayClock}
                  period={formatQuarter(period, isCBB)}
                  date={formattedDate}
                  time={formattedTime}
                />

                <TeamInfo
                  side={"home"}
                  name={homeCode}
                  logo={homeLogo}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                  rank={homeRank}
                  timeouts={null}
                  bonusState={null}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  gameStatusDescription={gameStatusDescription}
                  homeTeamId={homeId}
                  awayTeamId={awayId}
                  homeColor={homeColor}
                  homeEspnId={homeEspnId}
                  homeName={homeName}
                  homeLogo={homeLogo}
                  awayLogo={awayLogo}
                  awayCode={awayCode}
                  awayColor={awayColor}
                  awayEspnId={awayEspnId}
                  awayName={awayName}
                  homeCode={homeCode}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  lineScore={lineScore}
                  teamStats={teamStats}
                  playerStats={playerStats}
                  homeLastGames={homeLastGames}
                  awayLastGames={awayLastGames}
                  officials={officials}
                  venueImage={venueImage}
                  venueLocation={venueLocation}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  venueCapacity={venueCapacity}
                  venueAttendance={venueAttendance}
                  leaders={leaders}
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
