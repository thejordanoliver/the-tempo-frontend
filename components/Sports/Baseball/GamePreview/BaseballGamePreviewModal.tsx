import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { getNeutralVenue } from "@/constants/neutralVenues";
import { useLastFiveGames } from "@/hooks/BaseballHooks/useLastFiveGames";
import { useWeatherForecast } from "@/hooks/useWeather";
import { formatVenueAddress } from "@/utils/CBBUtils/cbbGameUtils";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import TeamInfo from "components/Sports/Baseball/GamePreview/TeamInfo";
import { Colors } from "constants/styles";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useBaseballGameDetails } from "hooks/BaseballHooks/useBaseballGameDetails";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { BaseballGame } from "types/baseball";
import { getBroadcastDisplay } from "utils/games";
import { snapPoints } from "utils/modalUtils";
import { CenterInfo } from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";

type BaseballGameCardProps = {
  game: BaseballGame;
  visible: boolean;
  onClose: () => void;
  isMLB: boolean;
  isCB: boolean;
  isSB: boolean;
};

export default function BaseballGamePreviewModal({
  game,
  visible,
  onClose,
  isMLB = false,
  isCB = false,
  isSB = false,
}: BaseballGameCardProps) {
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

  const LEAGUE = isMLB ? "MLB" : isCB ? "CB" : "SB";
  const gameId = game?.id;
  const home = game?.home;
  const away = game?.away;
  const homeId = home?.id;
  const awayId = away?.id;

  const homeLastGames = useLastFiveGames(homeId ?? 0, LEAGUE);
  const awayLastGames = useLastFiveGames(awayId ?? 0, LEAGUE);

  const { details, score } = useBaseballGameDetails(
    LEAGUE.toLowerCase(),
    gameId,
  );

  const homeTeam = isSB
    ? getSBTeam(home?.id)
    : isCB
      ? getCBTeam(home?.id)
      : getMLBTeam(home?.id);

  const awayTeam = isSB
    ? getSBTeam(away?.id)
    : isCB
      ? getCBTeam(away?.id)
      : getMLBTeam(away?.id);

  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;
  const homeCode = homeTeam?.code ?? homeTeam?.shortName ?? "";
  const awayCode = awayTeam?.code ?? awayTeam?.shortName ?? "";

  const homeLogo = isSB
    ? getSBTeamLogo(homeId, true)
    : isCB
      ? getCBTeamLogo(homeId, true)
      : getMLBTeamLogo(homeTeamId, true);

  const awayLogo = isSB
    ? getSBTeamLogo(awayId, true)
    : isCB
      ? getCBTeamLogo(awayId, true)
      : getMLBTeamLogo(awayTeamId, true);

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const isChampionship = game?.season.slug === "championship-series";
  const styles = gamePreviewModalStyle(isChampionship);
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const dontShowDetails = isDelayed || isCanceled || isPostponed || isForfeited;
  const homeScore = score?.home.total ?? game?.home?.score ?? 0;
  const awayScore = score?.away.total ?? game?.away?.score ?? 0;
  const homeRecord = game.home.record ?? "0-0";
  const awayRecord = game.away.record ?? "0-0";
  const homeRank = game.home.homeRank;
  const awayRank = game.away.awayRank;
  const isTopInning = gameStatusDetail.includes("Top");
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;
  const neutralSite = game?.isNeutralSite ?? false;
  const headline = game.headline;
  const officials = details?.officials ?? [];
  const outs = game?.situation.outs;

  const bases = {
    onFirst: score?.bases.onFirst ?? false,
    onSecond: score?.bases.onSecond ?? false,
    onThird: score?.bases?.onThird ?? false,
  };

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
    : homeTeam?.venueName || baseVenue?.fullName;
  const venueAddress = neutralSite
    ? neutralVenue?.address
    : homeTeam?.address || baseVenueAddress;
  const venueCapacity = neutralSite
    ? neutralVenue?.venueCapacity
    : homeTeam?.venueCapacity || null;
  const venueImage = neutralSite
    ? neutralVenue?.venueImage || baseVenue?.images?.[0]?.href
    : homeTeam?.venueImage || baseVenue?.images?.[0]?.href;
  const venueLocation = neutralSite ? neutralVenue?.city : homeTeam?.city;
  const venueLat = neutralSite
    ? (neutralVenue?.latitude ?? 0)
    : (homeTeam?.latitude ?? 0);
  const venueLon = neutralSite
    ? (neutralVenue?.longitude ?? 0)
    : (homeTeam?.longitude ?? 0);
  const venueAttendance = baseVenue?.attendance || null;
  const { weather } = useWeatherForecast(venueLat, venueLon, formattedDate);

  const isLoading = !!details;

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
          tint="systemUltraThinMaterialDark"
          style={styles.blurViewContainer}
        >
          {!isLoading ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {/* ================= HEADLINE ================= */}
              {headline && <Text style={styles.headlineText}>{headline}</Text>}

              {/* ================= GAME HEADER ================= */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  logo={awayLogo}
                  name={awayCode}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  rank={awayRank}
                  gameStatusDescription={gameStatusDescription}
                />

                <CenterInfo
                  broadcast={broadcast}
                  time={formattedTime}
                  isTopInning={isTopInning}
                  date={formattedDate}
                  outs={outs}
                  bases={bases}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                />

                <TeamInfo
                  side="home"
                  logo={homeLogo}
                  name={homeCode}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  rank={homeRank}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>
              {/* --- Scrollable Content --- */}
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
