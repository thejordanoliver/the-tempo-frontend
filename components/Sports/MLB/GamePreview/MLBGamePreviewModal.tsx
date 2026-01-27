//./CFB/GamePreview/CFBGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsMLB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameInfo } from "hooks/MLBHooks/useGameInfo";
import { useTeamRecord } from "hooks/MLBHooks/useTeamRecords";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { MLBGame } from "types/mlb";
import { CenterInfo } from "./CenterInfo";
import TeamInfo from "./TeamInfo";
type Props = {
  game: MLBGame; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};


export default function MLBGamePreviewModal({ game, visible, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameInfo = game;
  const home = game.teams.home;
  const away = game.teams.away;

  // Ensure timestamp is a number
  const timestampNum = Number(gameInfo.date.timestamp);
  const apiDateStr = new Date(timestampNum * 1000).toISOString().split("T")[0]; // ✅ for API hooks
  const displayDateStr = new Date(timestampNum * 1000).toLocaleDateString(
    "en-us",
    {
      month: "short",
      day: "numeric",
    }
  ); // ✅ for UI
  const displayTimeStr = new Date(timestampNum * 1000).toLocaleTimeString(
    "en-us",
    {
      hour: "numeric",
      minute: "numeric",
    }
  );

  type GameStatus =
    | "Not Started"
    | "In Progress"
    | "Final"
    | "Canceled"
    | "Postponed"
    | "Delayed"
    | "Abandoned";

  const statusMap: Record<string, GameStatus> = {
    NS: "Not Started",
    FT: "Final",
    POST: "Postponed",
    CANC: "Canceled",
    INTR: "Delayed",
    ABD: "Abandoned",
  };

  const rawStatus = (
    gameInfo.status.short ||
    gameInfo.status.long ||
    ""
  ).toUpperCase();

  let gameStatus: GameStatus =
    statusMap[rawStatus] ??
    (rawStatus.startsWith("IN") ? "In Progress" : "Not Started");

  // --- Compute game date ---
  const gameDate = useMemo(() => {
    return game?.date?.timestamp ? new Date(game.date.timestamp * 1000) : null;
  }, [game?.date?.timestamp]);
  const gameDateStr = gameDate?.toISOString();

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
    []
  );

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  const homeTeamData = teams.find((t) => t.id === home.id) ?? home;
  const awayTeamData = teams.find((t) => t.id === away.id) ?? away;

  // --- Team records ---
  const awayEspnId = getTeamById(away?.id)?.espnID;
  const homeEspnId = getTeamById(home?.id)?.espnID;



  const { record: awayRecord } = useTeamRecord(
    awayEspnId ? Number(awayEspnId) : undefined
  );
  const { record: homeRecord } = useTeamRecord(
    homeEspnId ? Number(homeEspnId) : undefined
  );

  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  // Championship Game Detection (Jan 19, 2026)
  const isChampionship =
    gameDate &&
    gameDate.getFullYear() === 2026 &&
    gameDate.getMonth() === 0 && // January = 0
    gameDate.getDate() === 19;

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
      handleStyle={{
        backgroundColor: "transparent",
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: 8,
        right: 8,
        top: 0,
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors.lightGray,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <LinearGradient
          colors={
            isChampionship
              ? ["#DFBD69", "#CDA765"]
              : [awayTeamData.color, homeTeamData.color]
          }
          locations={isChampionship ? undefined : [0, 1]}
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
          style={{
            flex: 1,
            padding: 12,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 40,
          }}
        >
          <>
            {headlineText && (
              <>
                {headlineText && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.OSLIGHT,
                      color: Colors.dark.white,
                      textAlign: "center",
                    }}
                  >
                    {headlineText}
                  </Text>
                )}
              </>
            )}

            {/* Teams + Center Info */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TeamInfo
                team={awayTeamData}
                teamName={awayTeamData.code ?? awayTeamData.name ?? "Away"}
                score={game.scores.away.total}
                opponentScore={game.scores.home.total}
                record={awayRecord?.overall ?? "0-0"}
                isGameOver={
                  gameStatus === "Final" ||
                  gameStatus === "Canceled" ||
                  gameStatus === "Postponed"
                }
                hasStarted={gameStatus !== "Not Started"}
                side="away"
                lighter
              />
              <CenterInfo
                status={gameStatus}
                date={displayDateStr}
                time={displayTimeStr}

                isDark={isDark}
                homeTeam={homeTeamData}
                awayTeam={awayTeamData}
                colors={colorsRecord}
                lighter
                apiDate={apiDateStr}
              />

              <TeamInfo
                team={homeTeamData}
                teamName={homeTeamData.code ?? homeTeamData.name ?? "Home"}
                score={game.scores.home.total}
                opponentScore={game.scores.away.total}
                record={homeRecord?.overall ?? "0-0"}
                isGameOver={
                  gameStatus === "Final" ||
                  gameStatus === "Canceled" ||
                  gameStatus === "Postponed"
                }
                hasStarted={gameStatus !== "Not Started"}
                side="home"
                lighter
              />
            </View>
          </>
          {/* Scrollable Details */}
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ flex: 1 }}
          >
            <View style={{ gap: 20 }}></View>
          </BottomSheetScrollView>
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
