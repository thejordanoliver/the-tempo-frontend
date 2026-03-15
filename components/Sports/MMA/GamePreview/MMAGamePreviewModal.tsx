//./CFB/GamePreview/CFBGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors } from "constants/Styles";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useMMADetails } from "hooks/MMAHooks/useMMADetails";
import useMMAFighter from "hooks/MMAHooks/useMMAFighter";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { gamePreviewModalStyle } from "styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { MMAFight } from "types/mma";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import getDecisionType, { resultTypeMap } from "utils/MMAUtils/resultsUtils";
import { snapPoints } from "utils/modalUtils";
import { getGameDate } from "utils/nflGameCardUtils";
import CenterInfo from "./CenterInfo";
import FighterInfo from "./FighterInfo";
type Props = {
  game: MMAFight; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};

export default function MMAGamePreviewModal({ game, visible, onClose }: Props) {
  const isDark = useColorScheme() === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameInfo = game;
  const firstFighterId = game.fighters.first.id;
  const secondFighterId = game.fighters.second.id;

  const { fighter: firstFighter } = useMMAFighter(firstFighterId);
  const { fighter: secondFighter } = useMMAFighter(secondFighterId);

  const firstFighterName = game.fighters.first.info.short_name ?? "";
  const secondFighterName = game.fighters.second.info.short_name ?? "";

  const firstFighterPhoto = game.fighters.first.info.images[0]?.href ?? "";
  const secondFighterPhoto = game.fighters.second.info.images[0]?.href ?? "";

  const firstFighterEspnId = game.fighters.first.info.espn_id;
  const secondFighterEspnId = game.fighters.second.info.espn_id;
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

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const { details, loading } = useMMADetails(
    "ufc",
    firstFighterEspnId,
    secondFighterEspnId,
    gameDateStr,
  );

  const rawWonType = game.result?.wonType ?? "";
  const firstFighterWinner = game.fighters.first.winner === true;
  const secondFighterWinner = game.fighters.second.winner === true;
  const wonType = getDecisionType(
    rawWonType,
    game.result?.score,
    firstFighterWinner,
    secondFighterWinner,
  );
  const resultText = wonType ? (resultTypeMap[wonType] ?? wonType) : "Result";
  const firstFighterRecord = game.fighters?.first?.info?.record;
  const secondFighterRecord = game.fighters?.second?.info?.record;
  const gameStatusDescription = details?.fight?.status.description ?? "";
  const venue = details?.venue;

  const broadcasts = details?.fight?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const period = details?.fight?.status.period ?? 0;
  const displayClock = details?.fight?.status.displayClock ?? "";
  const headline = details?.event?.shortName;
  const isMainEvent = game.is_main === true;
  const isLiveScoreReady = !!details;
  const styles = gamePreviewModalStyle(isMainEvent);
  const isTie =
    game.fighters.first.winner === false &&
    game.fighters.second.winner === false;

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
            isMainEvent
              ? ["#DFBD69", "#CDA765"]
              : [
                  Colors.darkGray,
                  Colors.darkGray,
                  Colors.darkGray,
                  Colors.darkGray,
                ]
          }
          locations={isMainEvent ? undefined : [0, 0.4, 0.6, 1]}
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
              {headline && (
                <>
                  {headline && (
                    <Text style={styles.headlineText}>{headline}</Text>
                  )}
                </>
              )}
              <View style={styles.gameHeaderContainer}>
                <FighterInfo
                  side="away"
                  logo={secondFighterPhoto}
                  name={secondFighterName}
                  record={secondFighterRecord}
                  gameStatusDescription={gameStatusDescription}
                  headshot={secondFighterPhoto}
                  isWinner={secondFighterWinner}
                  fighter={secondFighter || undefined}
                />
                <CenterInfo
                  isMainEvent={game.is_main}
                  time={formattedTime}
                  date={formattedDate}
                  gameStatusDescription={gameStatusDescription}
                  gameStatusDetail={resultText}
                  period={period}
                  displayClock={displayClock}
                  broadcastNetworks={broadcastText}
                  isDark={true}
                />
                <FighterInfo
                  side="home"
                  logo={firstFighterPhoto}
                  name={firstFighterName}
                  record={firstFighterRecord}
                  gameStatusDescription={gameStatusDescription}
                  headshot={firstFighterPhoto}
                  isWinner={firstFighterWinner}
                  fighter={firstFighter || undefined}
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
