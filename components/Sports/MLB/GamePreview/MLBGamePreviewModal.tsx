import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import usePlayersByTeam from "hooks/MLBHooks/usePlayersByTeam";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { MLBGame } from "types/baseball";
import { resolveVenue } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import { getGameDate } from "utils/nflGameCardUtils";
import { GameInfo } from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";
import { usePreferences } from "contexts/PreferencesContext";
type Props = {
  game: MLBGame;
  visible: boolean;
  onClose: () => void;
};

export default function MLBGamePreviewModal({ game, visible, onClose }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  /* ==================================================
     GAME DATA
  ================================================== */
  const { teams, timestamp, scores } = game;
  const { home, away } = teams;

  const {
    date,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);

  /* ==================================================
     INTERNAL TEAM MAPPING
     ================================================== */

  const homeId = home?.id ?? 0;
  const awayId = away?.id ?? 0;

  const homeTeam = getMLBTeam(homeId);
  const awayTeam = getMLBTeam(awayId);

  const homeName = homeTeam?.code ?? "";
  const awayName = awayTeam?.code ?? "";

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const homeLogo = getMLBTeamLogo(homeTeam?.id ?? 0, true);
  const awayLogo = getMLBTeamLogo(awayTeam?.id ?? 0, true);

  /* ==================================================
     LIVE GAME DETAILS
  ================================================== */
  const { score: liveScore, details } = useBaseballGameDetails(
    "mlb",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );

  const isLiveScoreReady = !!liveScore;

  /* ==================================================
     GAME STATUS
  ================================================== */
  const isChampionship = details?.playoffRound === "World Series";
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const neutralSite = details?.neutralSite;
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.statusText ?? "";
  const plays = liveScore?.plays;
  const lastPlay = liveScore?.lastPlay;
  const isPostseason = details?.isPostseason;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  const headlineText = details?.headline;
  const playerStats = liveScore?.playerStats ?? [];
  const homeScore = liveScore?.home.total ?? game.scores.home.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores.away.total ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const period = liveScore?.period;
  const venue = details?.venue;
  const attendance = details?.venue;
  const officials = details?.officials ?? [];
  const injuries = details?.injuries ?? [];
  const highlights = details?.highlights ?? [];
  const homeChance = Number(details?.predictor?.homeTeam?.gameProjection) || 0;
  const awayChance = Number(details?.predictor?.awayTeam?.gameProjection) || 0;

  const isTopInning = gameStatusDetail.includes("Top");
  const outs = liveScore?.outs;
  const bases: { first: boolean; second: boolean; third: boolean } =
    liveScore?.bases ?? {
      first: false,
      second: false,
      third: false,
    };

  const homeTeamPlayersData = usePlayersByTeam(String(homeId));
  const awayTeamPlayersData = usePlayersByTeam(String(awayId));

  const teamPlayersMap = {
    [String(homeEspnId)]: homeTeamPlayersData.players,
    [String(awayEspnId)]: awayTeamPlayersData.players,
  };

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
        homeTeam: homeTeam,
        isNeutralSite: neutralSite,
        league: "MLB",
      }),
    [venue, homeTeam, neutralSite],
  );

  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    resolvedVenue.latitude,
    resolvedVenue.longitude,
    gameDateStr,
  );

  useEffect(() => {
    visible ? sheetRef.current?.present() : sheetRef.current?.dismiss();
  }, [visible]);

  const styles = gamePreviewModalStyle(isChampionship);

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
        {/* ================= BACKGROUND GRADIENT ================= */}
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
          {!isLiveScoreReady ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator />
            </View>
          ) : (
            <>
              {/* ================= HEADLINE ================= */}
              {headlineText && (
                <Text style={styles.headlineText}>{headlineText}</Text>
              )}

              {/* ================= GAME HEADER ================= */}
              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  team={away}
                  logo={awayLogo}
                  name={awayName}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  gameStatusDescription={gameStatusDescription}
                />

                <GameInfo
                  broadcastNetworks={broadcastText}
                  inning={liveScore.statusText}
                  time={formattedTime}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  isTopInning={isTopInning}
                  date={formattedDate}
                  outs={outs ?? 0}
                  bases={bases}
                />

                <TeamInfo
                  side="home"
                  team={home}
                  logo={homeLogo}
                  name={homeName}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>

              {/* --- Scrollable Content --- */}
              {!dontShowDetails && (
                <GamePreviewContent
                  gameStatusDescription={gameStatusDescription}
                  game={game}
                  home={homeTeam}
                  away={awayTeam}
                  homeChance={homeChance}
                  awayChance={awayChance}
                  lineScore={lineScore}
                  injuries={injuries}
                  officials={officials}
                  teamPlayersMap={teamPlayersMap}
                  resolvedVenueImage={resolvedVenue.image}
                  resolvedVenueName={resolvedVenue.name}
                  resolvedVenueCity={resolvedVenue.city}
                  resolvedVenueAddress={resolvedVenue.address}
                  resolvedVenueCapacity={resolvedVenue.capacity}
                  weather={weather}
                  weatherLoading={weatherLoading}
                  weatherError={weatherError}
                  isDark={isDark}
                />
              )}
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
