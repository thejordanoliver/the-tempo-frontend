//./CFB/GamePreview/CFBGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { TeamLocationSection, Weather } from "components/GameDetails";
import LineScore from "components/GameDetails/LineScore";
import { neutralSiteGames, teams } from "constants/teamsCFB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBGameOfficialsAndInjuries } from "hooks/CFBHooks/useCFBOfficials";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useCFBGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useLastFiveGames } from "hooks/CFBHooks/useLastFiveGames";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { CFBGame } from "types/cfb";
import CFBGameLeaders from "../GameDetails/CFBGameLeaders";
import CFBTeamDrives from "../GameDetails/CFBTeamDrives";
import LastFiveGamesSwitcher from "../GameDetails/LastFiveGames";
import { CFBGameCenterInfo } from "./GameCenterInfo";
import TeamInfo from "./TeamInfo";

type Props = {
  game: CFBGame; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};

export default function CFBGamePreviewModal({ game, visible, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  const gameInfo = game.game;
  const home = game.teams.home;
  const away = game.teams.away;
  const scores = game.scores;

  // Ensure timestamp is a number
  const timestampNum = Number(gameInfo.date.timestamp);
  const apiDateStr = new Date(timestampNum * 1000).toISOString().split("T")[0]; // ✅ for API hooks
  const displayDateStr = new Date(timestampNum * 1000).toLocaleDateString(
    "en-us",
    {
      month: "numeric",
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

  // Status mapping
  type GameStatus =
    | "Scheduled"
    | "In Progress"
    | "Halftime"
    | "Final"
    | "Canceled"
    | "Postponed"
    | "Delayed";
  const statusMap: Record<string, GameStatus> = {
    NS: "Scheduled",
    Q1: "In Progress",
    Q2: "In Progress",
    Q3: "In Progress",
    Q4: "In Progress",
    OT: "In Progress",
    HT: "Halftime",
    FT: "Final",
    AOT: "Final",
    CANC: "Canceled",
    PST: "Postponed",
    DELAYED: "Delayed",
  };
  const rawStatus = (
    gameInfo.status.short ||
    gameInfo.status.long ||
    ""
  ).toUpperCase();
  const gameStatus: GameStatus = statusMap[rawStatus] ?? "Scheduled";

  // Linescore
  const linescore = useMemo(() => {
    const homePeriods = [
      scores.home?.quarter_1,
      scores.home?.quarter_2,
      scores.home?.quarter_3,
      scores.home?.quarter_4,
    ];
    const awayPeriods = [
      scores.away?.quarter_1,
      scores.away?.quarter_2,
      scores.away?.quarter_3,
      scores.away?.quarter_4,
    ];
    if (scores.home?.overtime != null) homePeriods.push(scores.home.overtime);
    if (scores.away?.overtime != null) awayPeriods.push(scores.away.overtime);
    return {
      home: homePeriods.map((v) => (v != null ? String(v) : "-")),
      away: awayPeriods.map((v) => (v != null ? String(v) : "-")),
    };
  }, [scores]);

  const homeTeamData = teams.find((t) => t.id === home.id) ?? home;
  const awayTeamData = teams.find((t) => t.id === away.id) ?? away;

  const homeLastGames = useLastFiveGames(Number(homeTeamData?.id || 0));
  const awayLastGames = useLastFiveGames(Number(awayTeamData?.id || 0));

  // Snap points
  const snapPoints = useMemo(() => ["60%", "80%", "94%"], []);

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

  // --- Team records ---
  const awayEspnId = getTeamById(away?.id)?.espnID;
  const homeEspnId = getTeamById(home?.id)?.espnID;

  const { record: awayRecord } = useCFBTeamRecord(
    awayEspnId ? Number(awayEspnId) : undefined
  );
  const { record: homeRecord } = useCFBTeamRecord(
    homeEspnId ? Number(homeEspnId) : undefined
  );

  // Officials & Injuries
  const { officials, injuries, previousDrives, currentDrives } =
    useCFBGameOfficialsAndInjuries(
      homeTeamData.name ?? "",
      awayTeamData.name ?? "",
      gameInfo?.date?.timestamp
        ? new Date(gameInfo.date.timestamp * 1000).toISOString()
        : ""
    );

  const formatPeriod = (raw: string | number | undefined | null) => {
    if (!raw) return "";
    const map: Record<string, string> = {
      Q1: "1st",
      Q2: "2nd",
      Q3: "3rd",
      Q4: "4th",
      OT: "OT",
      HT: "Halftime",
      FT: "Final",
    };

    // If it matches keys (Q1..OT) use map
    if (typeof raw === "string" && map[raw]) {
      return map[raw];
    }

    // If it’s a number, format with ordinal suffix
    if (typeof raw === "number") {
      const suffix =
        raw === 1 ? "st" : raw === 2 ? "nd" : raw === 3 ? "rd" : "th";
      return `${raw}${suffix}`;
    }

    return String(raw);
  };

  const isLive =
    gameStatus === "In Progress" ||
    gameStatus === "Halftime" ||
    gameStatus === "Delayed";

  // --- Compute game date ---
  const gameDate = useMemo(() => {
    return game?.game?.date?.timestamp
      ? new Date(game.game.date.timestamp * 1000)
      : null;
  }, [game?.game?.date?.timestamp]);
  const gameDateStr = gameDate?.toISOString();

  const neutralSiteKey1 = `${homeTeamData.name}-${awayTeamData.name}`;
  const neutralSiteKey2 = `${awayTeamData.name}-${homeTeamData.name}`;
  const isNeutralSite =
    neutralSiteGames[neutralSiteKey1] || neutralSiteGames[neutralSiteKey2];

  const resolvedVenueName = isNeutralSite
    ? isNeutralSite.name
    : homeTeamData?.venue ?? "Unknown Stadium";

  const resolvedVenueCity = isNeutralSite
    ? isNeutralSite.city
    : homeTeamData?.city ?? "Unknown City";

  const resolvedVenueAddress = isNeutralSite
    ? isNeutralSite.address
    : homeTeamData?.address ?? "";

  const resolvedVenueCapacity = isNeutralSite
    ? isNeutralSite.venueCapacity
    : homeTeamData?.venueCapacity ?? "";

  const resolvedVenueImage = isNeutralSite
    ? isNeutralSite.venueImage
    : homeTeamData?.venueImage ?? "";

  const lat = isNeutralSite
    ? isNeutralSite.latitude ?? null
    : homeTeamData?.latitude ?? null;

  const lon = isNeutralSite
    ? isNeutralSite.longitude ?? null
    : homeTeamData?.longitude ?? null;

  const { weather } = useWeatherForecast(
    lat,
    lon,
    gameDate ? gameDate.toISOString() : null,
    resolvedVenueCity ?? homeTeamData?.city ?? ""
  );

  const displayWeather = weather
    ? { ...weather, cityName: resolvedVenueCity ?? "Unknown" }
    : null;

  const possession = isLive
    ? useCFBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr)
    : {
        possessionTeamId: undefined,
        displayClock: undefined,
        shortDownDistanceText: undefined,
        downDistanceText: undefined,
        period: undefined,
        homeTimeouts: undefined,
        awayTimeouts: undefined,
        refresh: () => {},
      };

  const {
    possessionTeamId,
    shortDownDistanceText,
    displayClock,
    period,
    homeTimeouts,
    awayTimeouts,
  } = possession;

  const { headlineText } = useCFBGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  // Championship Game Detection (Jan 19, 2026)
  const isChampionshipGame =
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
        backgroundColor: "#888",
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
        <>
          {isChampionshipGame ? (
            // 🏆 National Championship Gradient
            <LinearGradient
              colors={["#DFBD69", "#CDA765"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            // Regular Team Color Gradient
            <LinearGradient
              colors={[
                awayTeamData.color ?? "#888",
                homeTeamData.color ?? "#888",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          <LinearGradient
            colors={
              isDark
                ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]
                : ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, .8)"]
            }
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
                teamName={awayTeamData.name ?? "Away"}
                score={scores?.away?.total ?? 0}
                opponentScore={scores?.home?.total ?? 0} // 👈 add this
                record={awayRecord?.overall ?? "0-0"}
                isDark={isDark}
                isGameOver={
                  gameStatus === "Final" ||
                  gameStatus === "Canceled" ||
                  gameStatus === "Postponed"
                }
                hasStarted={gameStatus !== "Scheduled"}
                possessionTeamId={
                  possessionTeamId !== undefined
                    ? String(possessionTeamId)
                    : undefined
                }
                side="away"
                timeouts={awayTimeouts ?? 0} // ✅ fallback to 0
                lighter
              />

              <CFBGameCenterInfo
                week={gameInfo?.week ?? "0"} // fallback
                status={gameStatus}
                date={displayDateStr}
                time={displayTimeStr}
                period={formatPeriod(period ?? gameInfo.status.short ?? "")}
                clock={displayClock ?? gameInfo?.status?.timer ?? ""}
                isDark={isDark}
                homeTeam={homeTeamData}
                awayTeam={awayTeamData}
                colors={colorsRecord}
                lighter
                apiDate={apiDateStr}
                downAndDistance={shortDownDistanceText ?? ""}
                headlineText={headlineText ?? ""}
              />

              <TeamInfo
                team={homeTeamData}
                teamName={homeTeamData.name ?? "Home"}
                score={scores?.home?.total ?? 0}
                opponentScore={scores?.away?.total ?? 0} // 👈 add this
                record={homeRecord?.overall ?? "0-0"}
                isDark={isDark}
                isGameOver={
                  gameStatus === "Final" ||
                  gameStatus === "Canceled" ||
                  gameStatus === "Postponed"
                }
                hasStarted={gameStatus !== "Scheduled"}
                possessionTeamId={
                  possessionTeamId !== undefined
                    ? String(possessionTeamId)
                    : undefined
                }
                side="home"
                timeouts={homeTimeouts ?? 0}
                lighter
              />
            </View>
            {/* Scrollable Details */}
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              style={{ flex: 1 }}
            >
              <View style={{ gap: 20 }}>
                <LineScore
                  linescore={linescore}
                  homeCode={homeTeamData.code ?? "HOM"}
                  awayCode={awayTeamData.code ?? "AWY"}
                  lighter
                />

                {homeTeamData && awayTeamData && gameStatus !== "Scheduled" && (
                  <CFBGameLeaders
                    gameId={String(gameInfo.id)}
                    homeTeamId={String(homeTeamData.id)}
                    awayTeamId={String(awayTeamData.id)}
                    lighter
                  />
                )}

                <CFBTeamDrives
                  previousDrives={previousDrives ?? []}
                  currentDrives={currentDrives ?? []}
                  awayTeamAbbr={awayTeamData?.code} // 👈 use getTeamInfo result
                  homeTeamAbbr={homeTeamData?.code} // 👈 use getTeamInfo result
                  lighter
                />

                <LastFiveGamesSwitcher
                  isDark={isDark}
                  home={{
                    teamCode: homeTeamData?.code ?? "",
                    games: homeLastGames?.games ?? [],
                  }}
                  away={{
                    teamCode: awayTeamData?.code ?? "",
                    games: awayLastGames?.games ?? [],
                  }}
                  lighter
                />

                <TeamLocationSection
                  venueImage={resolvedVenueImage}
                  venueName={resolvedVenueName}
                  location={resolvedVenueCity}
                  address={resolvedVenueAddress ?? ""}
                  venueCapacity={resolvedVenueCapacity ?? ""}
                  loading={false} // default value
                  error={null} // default value
                  lighter
                />

                {/* Weather */}
                {displayWeather ? (
                  <Weather
                    weather={displayWeather}
                    address={resolvedVenueAddress ?? ""}
                    loading={false}
                    error={null}
                    lighter
                  />
                ) : null}
              </View>
            </BottomSheetScrollView>
          </BlurView>
        </>
      </View>
    </BottomSheetModal>
  );
}
