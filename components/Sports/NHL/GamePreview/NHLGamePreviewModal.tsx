//./CFB/GamePreview/CFBGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { getNHLTeam } from "constants/teamsNHL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

import CustomActivityIndicator from "components/CustomActivityIndicator";
import { useHockeyDetails } from "hooks/NHLHooks/useHockeyGameDetails";
import { emptyAwayTeam, emptyHomeTeam } from "types/cfb";
import { NHLGame } from "types/nhl";
import CenterInfo from "./CenterInfo";
import TeamInfo from "./TeamInfo";
type Props = {
  game: NHLGame; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};

export default function NHLGamePreviewModal({ game, visible, onClose }: Props) {
  const isDark = useColorScheme() === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameInfo = game;
  const home = game.teams.home;
  const away = game.teams.away;

  /* ===============================
     DATE / TIME
  =============================== */
  const timestamp = game?.timestamp;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);
  const rawStatus = (
    gameInfo.status.short ||
    gameInfo.status.long ||
    ""
  ).toUpperCase();

  // Snap points
  const snapPoints = useMemo(() => ["80%", "94%"], []);

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  // Colors for CFBGameCenterInfo
  const colorsRecord = useMemo(
    () => ({
      text: "",
      record: "",
      score: "",
      winnerScore: "",
    }),
    [],
  );

  // Find matching internal teams using ESPN ID
  const homeTeam = getNHLTeam(home?.id);
  const awayTeam = getNHLTeam(away?.id);

  const homeName = homeTeam?.code ?? emptyHomeTeam.code ?? "";
  const awayName = awayTeam?.code ?? emptyAwayTeam.code ?? "";

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const homeColor = homeTeam?.color ?? emptyHomeTeam.color ?? "";
  const awayColor = awayTeam?.color ?? emptyAwayTeam.color ?? "";

  const { score: liveScore, details } = useHockeyDetails(
    "nhl",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );
  
  const isChampionship = game.week === "Final";
  const styles = gamePreviewModalStyle(isChampionship);
  const homeTimeouts = liveScore?.timeouts.home ?? 0;
  const awayTimeouts = liveScore?.timeouts.away ?? 0;
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.gameStatusDetail ?? "";
  const period = liveScore?.period ?? 0;
  const headlineText = details?.headline;
  const homeScore = liveScore?.home.total ?? game?.scores?.home ?? 0;
  const awayScore = liveScore?.away.total ?? game?.scores?.away ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const seriesSummary = details?.seriesSummary?.summary;
  const isPostseason = details?.isPostseason;
  const isLiveScoreReady = !!liveScore;

  const renderHeadline = () => (
    <>
      {isPostseason ? (
        <View>
          {seriesSummary ? (
            <View style={styles.headlineContainer}>
              <Text style={styles.headlineText}>{headlineText}</Text>
              <Text style={styles.headlineDivider} />
              <Text style={styles.headlineText}>{seriesSummary}</Text>
            </View>
          ) : null}
        </View>
      ) : headlineText ? (
        <Text style={styles.headlineText}>{headlineText}</Text>
      ) : null}
    </>
  );
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
              ? ["#DFBD69", "#CDA765"]
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
          {!isLiveScoreReady ? (
            <View style={styles.loadingContainer}>
              <CustomActivityIndicator lighter />
            </View>
          ) : (
            <>
              {renderHeadline()}

              <View style={styles.gameHeaderContainer}>
                <TeamInfo
                  side="away"
                  team={away}
                  teamName={awayName}
                  score={awayScore}
                  opponentScore={homeScore}
                  record={awayRecord}
                  timeouts={awayTimeouts}
                  bonusState={null}
                  gameStatusDescription={gameStatusDescription}
                />

                <CenterInfo
                  isChampionship={isChampionship}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={gameStatusDetail}
                  broadcastNetworks={broadcastText}
                  inning={period}
                  time={formattedTime}
                  formattedDate={formattedDate}
                  isDark={isDark}
                  lighter
                />
                <TeamInfo
                  side="home"
                  team={home}
                  teamName={homeName}
                  score={homeScore}
                  opponentScore={awayScore}
                  record={homeRecord}
                  timeouts={homeTimeouts}
                  bonusState={null}
                  gameStatusDescription={gameStatusDescription}
                />
              </View>

              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bottomSheetScrollViewContainer}
                style={{ flex: 1 }}
              >
                <View style={{ gap: 20 }}></View>
              </BottomSheetScrollView>
            </>
          )}
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
