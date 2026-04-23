import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/styles";
import { getCBTeamLogo } from "constants/teamsCB";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { CollegeBaseballGame } from "types/baseball";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { snapPoints } from "utils/modalUtils";
import { GameInfo } from "./CenterInfo";
import TeamInfo from "./TeamInfo";
type Props = {
  game: CollegeBaseballGame;
  visible: boolean;
  onClose: () => void;
};

export default function CBGamePreviewModal({ game, visible, onClose }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  /* ==================================================
     GAME DATA
  ================================================== */
  const { homeTeam, awayTeam } = game;

  const gameDateObj = new Date(game.date);
  const formattedDate = gameDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const homeId = homeTeam?.id;
  const awayId = awayTeam?.id;

  const homeName = homeTeam?.code ?? "";
  const awayName = awayTeam?.code ?? "";

  const homeColor = homeTeam?.color ?? "";
  const awayColor = awayTeam?.color ?? "";

  const homeLogo = getCBTeamLogo(homeTeam?.id ?? 0, true);
  const awayLogo = getCBTeamLogo(awayTeam?.id ?? 0, true);

  /* ==================================================
     LIVE GAME DETAILS
  ================================================== */
  const { score: liveScore, details } = useBaseballGameDetails(
    "cb",
    String(awayId),
    String(homeId),
    game.startDate,
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
  const homeScore = game.homeTeam.score ?? 0;
  const awayScore = game.awayTeam.score ?? 0;
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

  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

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
                  logo={homeLogo}
                  name={homeName}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
