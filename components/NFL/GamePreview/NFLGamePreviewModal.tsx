//./NFL/GamePreview/NFLGamePreviewModal.tsx
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  LastFiveGamesSwitcher,
  TeamLocationSection,
} from "components/GameDetails";
import LineScore from "components/GameDetails/LineScore";
import Weather from "components/GameDetails/Weather";
import { NFLCenterInfo } from "components/NFL/GamePreview/CenterInfo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { neutralStadiums, teams, venueImages } from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossession";
import { useLastFiveGames } from "hooks/NFLHooks/useLastFiveGames";
import { useNFLGameDetails } from "hooks/NFLHooks/useNFLGameDetails";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { useWeatherForecast } from "hooks/useWeather";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Game } from "types/nfl";
import NFLOfficials from "../../GameDetails/Officials";
import GameLeaders from "../GameDetails/GameLeaders";
import NFLInjuries from "../GameDetails/NFLInjuries";
import NFLTeamDrives from "../GameDetails/TeamDrives";
import TeamInfo from "./TeamInfo";

type Props = {
  game: Game; // ✅ normalized type, consistent with NBA + Summer League
  visible: boolean;
  onClose: () => void;
};

export default function NFLGamePreviewModal({ game, visible, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);
  const gameInfo = game.game;
  const isChampionship = gameInfo.week?.includes("Super Bowl"); // ✅ adjust based on your API
  const styles = getStyles(isDark, isChampionship);

  const home = game.teams.home;
  const away = game.teams.away;
  const scores = game.scores;

  // Ensure timestamp is a number
  const timestampNum = Number(gameInfo.date.timestamp);
  const apiDateStr = new Date(timestampNum * 1000).toISOString();
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
  const playoffKeywords = [
    "Super Bowl",
    "Wild Card",
    "Divisional Round",
    "Conference Championship",
  ];
  const isPlayoff = playoffKeywords.some((keyword) =>
    gameInfo.week?.includes(keyword)
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

  // Weather
  const isNeutralSite =
    gameInfo.venue?.name &&
    ![homeTeamData?.venue, awayTeamData?.venue].includes(
      gameInfo.venue?.name ?? ""
    );

  const stadiumData = isNeutralSite
    ? neutralStadiums[gameInfo.venue?.name ?? ""]
    : homeTeamData;

  const lat = isNeutralSite
    ? neutralStadiums[gameInfo.venue?.name ?? ""]?.latitude ?? null
    : home.latitude;
  const lon = isNeutralSite
    ? neutralStadiums[gameInfo.venue?.name ?? ""]?.longitude ?? null
    : home.longitude;

  const { weather } = useWeatherForecast(
    lat,
    lon,
    apiDateStr,
    stadiumData?.city ?? ""
  );

  const displayWeather = weather
    ? { ...weather, cityName: stadiumData?.city ?? "Unknown" }
    : null;

  // Snap points
  const snapPoints = useMemo(() => ["80%", "94%"], []);

  // Modal open/close
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);
  // Colors for NFLGameCenterInfo
  const colorsRecord = useMemo(
    () => ({
      text: "",
      record: "",
      score: "",
      winnerScore: "",
    }),
    []
  );

  // Records
  const { record: awayRecord } = useNFLTeamRecord(String(awayTeamData.id));
  const { record: homeRecord } = useNFLTeamRecord(String(homeTeamData.id));
  const homeTeamIdNum = Number(homeTeamData.id);
  const awayTeamIdNum = Number(awayTeamData.id);
  const homeLastGames = useLastFiveGames(homeTeamIdNum);
  const awayLastGames = useLastFiveGames(awayTeamIdNum);

  const {
    officials,
    injuries,
    previousDrives,
    currentDrives,
    venue,
    highlights,
    scoringPlays,
  } = useNFLGameDetails(
    homeTeamData.espnID,
    awayTeamData.espnID,
    gameInfo?.date?.timestamp
      ? new Date(gameInfo.date.timestamp * 1000).toISOString()
      : ""
  );

  const { headlineText } = useGameInfo(
    Number(homeTeamData.espnID),
    Number(awayTeamData.espnID),
    apiDateStr,
    "nfl"
  );

  // --- Format quarter / period ---
  const formatQuarter = (
    short?: string | null,
    long?: string | null
  ): string => {
    const val = short && short.trim() !== "" ? short : long ?? "";
    if (!val) return "";

    const q = val.toLowerCase();
    if (q.includes("1")) return "1st";
    if (q.includes("2")) return "2nd";
    if (q.includes("3")) return "3rd";
    if (q.includes("4")) return "4th";
    if (q.includes("ot") || q.includes("overtime")) return "OT";
    if (q.includes("half")) return "Halftime";
    if (q.includes("end")) return "End";

    const asNumber = Number(val);
    if (!isNaN(asNumber)) {
      if (asNumber === 5) return "OT";
      if (asNumber > 5) return `${asNumber - 4}OT`;
    }

    return val;
  };
  const isLive =
    gameStatus === "In Progress" ||
    gameStatus === "Halftime" ||
    gameStatus === "Delayed";

  const possessionData = isLive
    ? useFootballGamePossession(
        "nfl",
        Number(homeTeamData?.espnID),
        Number(awayTeamData?.espnID),
        apiDateStr
      )
    : {
        possessionTeamId: undefined,
        shortDownDistanceText: "",
        downDistanceText: "",
        displayClock: gameInfo?.status?.timer ?? "",
        period: gameInfo?.status?.short ?? "",
        homeTimeouts: 0,
        awayTimeouts: 0,
        loading: false,
      };

  const {
    possessionTeamId,
    shortDownDistanceText,
    downDistanceText,
    displayClock,
    period,
    homeTimeouts,
    awayTimeouts,
    loading: possessionLoading,
  } = possessionData;

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
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <View style={styles.container}>
        <>
          <LinearGradient
            colors={
              isChampionship
                ? ["#DFBD69", "#CDA765"]
                : [awayTeamData.color, homeTeamData.color]
            }
            locations={isChampionship ? undefined : [0, 0.4, 0.6, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
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
            style={styles.blur}
          >
            <>
              {headlineText && (
                <>
                  {headlineText && (
                    <Text style={styles.headline}>{headlineText}</Text>
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
                  teamName={awayTeamData.code ?? "Away"}
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

                <NFLCenterInfo
                  isPlayoff={true}
                  week={`${gameInfo.week} LX`}
                  status={gameStatus}
                  date={displayDateStr}
                  time={displayTimeStr}
                  period={formatQuarter(period ?? gameInfo.status.short ?? "")}
                  clock={displayClock ?? gameInfo?.status?.timer ?? ""} // ✅ main clock: displayClock, fallback: timer
                  isDark={isDark}
                  homeTeam={homeTeamData} // ✅ must have .code
                  awayTeam={awayTeamData} // ✅ must have .code
                  colors={colorsRecord}
                  lighter
                  apiDate={apiDateStr}
                  downAndDistance={downDistanceText ?? ""} // 👈 use real data
                />

                <TeamInfo
                  team={homeTeamData}
                  teamName={homeTeamData.code ?? "Home"}
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
                />
              </View>

              {/* Scrollable Details */}
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                style={{ flex: 1 }}
              >
                <View style={{ gap: 24 }}>
                  <LineScore
                    linescore={linescore}
                    homeCode={homeTeamData.code ?? "HOM"}
                    awayCode={awayTeamData.code ?? "AWY"}
                    lighter
                  />

                  {homeTeamData &&
                    awayTeamData &&
                    gameStatus !== "Scheduled" && (
                      <GameLeaders
                        gameId={String(gameInfo.id)}
                        homeTeamId={String(homeTeamData.id)}
                        awayTeamId={String(awayTeamData.id)}
                        lighter
                        league="NFL"
                      />
                    )}

                  <NFLTeamDrives
                    previousDrives={previousDrives ?? []}
                    currentDrives={currentDrives ?? []}
                    homeTeamId={Number(homeTeamData.espnID)}
                    awayTeamId={Number(awayTeamData.espnID)}
                    lighter
                  />

                  <LastFiveGamesSwitcher
                    isDark={isDark}
                    home={{
                      teamCode: homeTeamData.code,
                      teamLogo: homeTeamData.logo,
                      teamLogoLight: homeTeamData.logoLight,
                      games: homeLastGames.games,
                    }}
                    away={{
                      teamCode: awayTeamData.code,
                      teamLogo: awayTeamData.logo,
                      teamLogoLight: awayTeamData.logoLight,
                      games: awayLastGames.games,
                    }}
                    league="NFL"
                    lighter
                  />

                  <NFLInjuries
                    injuries={injuries}
                    loading={false}
                    error={null}
                    awayTeamAbbr={awayTeamData.code}
                    homeTeamAbbr={homeTeamData.code}
                    lighter
                  />
                  {gameStatus !== "Scheduled" && (
                    <NFLOfficials
                      officials={officials}
                      loading={false}
                      error={null}
                      lighter
                    />
                  )}
                  {/* Location */}
                  {(
                    isNeutralSite
                      ? gameInfo?.venue?.name || gameInfo?.venue?.city
                      : homeTeamData?.venue || homeTeamData?.location
                  ) ? (
                    <TeamLocationSection
                      venueImage={
                        isNeutralSite
                          ? venueImages[gameInfo?.venue?.name ?? ""] ||
                            venueImages[gameInfo?.venue?.city ?? ""]
                          : homeTeamData?.venueImage
                      }
                      venueName={
                        isNeutralSite
                          ? neutralStadiums[gameInfo?.venue?.name ?? ""]
                              ?.name ?? ""
                          : homeTeamData?.venue ?? ""
                      }
                      location={
                        isNeutralSite
                          ? gameInfo?.venue?.city ?? ""
                          : homeTeamData?.location ?? ""
                      }
                      address={
                        isNeutralSite
                          ? neutralStadiums[gameInfo?.venue?.name ?? ""]
                              ?.address ?? ""
                          : homeTeamData?.address ?? ""
                      }
                      venueCapacity={
                        isNeutralSite
                          ? neutralStadiums[gameInfo?.venue?.name ?? ""]
                              ?.venueCapacity ?? ""
                          : homeTeamData?.venueCapacity ?? ""
                      }
                      surface="football"
                      grass={venue?.grass ?? undefined}
                      loading={false}
                      error={null}
                      lighter={true}
                    />
                  ) : null}
                  {gameStatus !== "Scheduled" && (
                    <Weather
                      weather={displayWeather}
                      address={stadiumData?.city ?? ""}
                      loading={false}
                      error={null}
                      lighter
                    />
                  )}
                </View>
              </BottomSheetScrollView>
            </>
          </BlurView>
        </>
      </View>
    </BottomSheetModal>
  );
}

const getStyles = (isDark: boolean, isChampionship: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      overflow: "hidden",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    blur: {
      flex: 1,
      paddingHorizontal: 12,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    handle: {
      backgroundColor: "transparent",
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 8,
      right: 8,
      top: 0,
    },
    handleIndicator: {
      backgroundColor: isChampionship ? Colors.lightGray : Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    headline: {
      fontSize: 12,
      fontFamily: Fonts.OSLIGHT,
      color: Colors.dark.white,
      textAlign: "center",
    },
  });
