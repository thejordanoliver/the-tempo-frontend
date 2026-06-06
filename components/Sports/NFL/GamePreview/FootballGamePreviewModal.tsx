// ./NFL/GamePreview/NFLGamePreviewModal.tsx
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { gamePreviewModalStyle } from "@/styles/ModalsStyles/GamePreviewStyles/GamePreviewModalStyles";
import { formatQuarter, getBroadcastDisplay } from "@/utils/games";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { CenterInfo } from "components/Sports/NFL/GamePreview/CenterInfo";
import { Colors } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FootballGame } from "types/football";
import { getHolidayLabel } from "utils/dateUtils";
import { snapPoints } from "utils/modalUtils";
import TeamInfo from "./TeamInfo";

type Props = {
  game: FootballGame;
  isNFL: boolean;
  visible: boolean;
  onClose: () => void;
};

export default function FootballGamePreviewModal({
  game,
  isNFL,
  visible,
  onClose,
}: Props) {
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

  const league = game?.league?.id;

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;

  const home = isNFL ? getNFLTeam(homeId) : getCFBTeam(homeId);
  const away = isNFL ? getNFLTeam(awayId) : getCFBTeam(awayId);

  const homeName = home?.code ?? "";
  const awayName = away?.code ?? "";

  const homeLogo = isNFL
    ? getNFLTeamLogo(homeId, true)
    : getCFBTeamLogo(homeId, true);
  const awayLogo = isNFL
    ? getNFLTeamLogo(awayId, true)
    : getCFBTeamLogo(awayId, true);

  const homeColor = home?.color ?? "";
  const awayColor = away?.color ?? "";

  const gameStatusDescription = game?.status.description ?? "";
  const gameStatusDetail = game?.status.shortDetail ?? "";
  const inProgress = gameStatusDescription === "In Progress";
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
  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;
  const homeRank = game.home.rank ?? null;
  const awayRank = game.away.rank ?? null;
  const isChampionship =
    game?.headline?.includes("Super Bowl") ??
    game?.headline?.includes("Championship");
  const styles = gamePreviewModalStyle(isChampionship);
  const homeHasPossession = inProgress && possessionTeamId === home?.espnID;
  const awayHasPossession = inProgress && possessionTeamId === away?.espnID;

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = awayScore === homeScore;

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
          <>
            {headline && <Text style={styles.headlineText}>{headline}</Text>}

            {/* HEADER */}
            <View style={styles.gameHeaderContainer}>
              <TeamInfo
                side="away"
                logo={awayLogo}
                name={awayName}
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
                name={homeName}
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
          </>
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
