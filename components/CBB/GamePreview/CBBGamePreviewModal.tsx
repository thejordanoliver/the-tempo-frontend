import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { neutralVenues, venueImages } from "constants/teams";
import { teams } from "constants/teamsCBB";
import { useGameDetails } from "hooks/CBBHooks/useGameDetails";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameScores } from "hooks/useGameScores";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useWeatherForecast } from "hooks/useWeather";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import CenterInfo from "./CenterInfo";
import GamePreviewContent from "./GamePreviewContent";
import TeamInfo from "./TeamInfo";
type Props = {
  visible: boolean;
  game: CBBGame;
  onClose: () => void;
};

export default function CBBGamePreviewModal({ visible, game, onClose }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = useRef<BottomSheetModal>(null);

  if (!game) return null;

  const home = teams.find((t) => String(t.id) === String(game.teams.home?.id));
  const away = teams.find((t) => String(t.id) === String(game.teams.away?.id));

  const { data: gameStats } = useGameStatistics(game?.id ?? 0);



  const { record: homeRecord } = useTeamRecord(home?.espnID, "cbb");
  const { record: awayRecord } = useTeamRecord(away?.espnID, "cbb");

  const neutralVenueData = neutralVenues[game?.venue ?? ""];
  const lat = neutralVenueData?.latitude ?? home?.latitude ?? null;
  const lon = neutralVenueData?.longitude ?? home?.longitude ?? null;

  const { weather, weatherLoading, weatherError } = useWeatherForecast(
    lat,
    lon,
    new Date(game.date).toISOString()
  );
  const { broadcasts } = useGameBroadcasts(
    home?.name ?? "",
    away?.name ?? "",
    new Date(game.date).toISOString(),
    "mens-college-basketball"
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  const snapPoints = useMemo(() => ["60%", "80%", "88%", "94%"], []);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) requestAnimationFrame(() => sheetRef.current?.present());
    else requestAnimationFrame(() => sheetRef.current?.dismiss());
  }, [visible]);

  const isFinal = game?.status?.long === "Game Finished";
  const isCanceled = game?.status?.long === "Canceled";

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
    ? new Date(game.date)
    : null;

  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const formattedTime = gameDate
    ? gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";
  const gameDateStr = gameDate ? gameDate.toISOString().split("T")[0] : "";

  const { headlineText } = useCBBHeadline(
    Number(home?.espnID),
    Number(away?.espnID),
    gameDateStr
  );

  // March Madness runs March 18 – April 7
  const isMarchMadness =
    (gameDate?.getMonth() === 2 && gameDate?.getDate() >= 18) || // March (2)
    (gameDate?.getMonth() === 3 && gameDate?.getDate() <= 7); // April (3)

  // Final Four: April 5–7
  const isFinalFour =
    gameDate?.getMonth() === 3 &&
    gameDate?.getDate() >= 5 &&
    gameDate?.getDate() <= 7;

  // Championship: April 7
  const isChampionship =
    gameDate?.getMonth() === 3 && gameDate?.getDate() === 7;

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  // 🏈 Use ESPN team IDs, not internal IDs
  const homeEspnId = getTeamById(home?.id)?.espnID;
  const awayEspnId = getTeamById(away?.id)?.espnID;

  // --- Game status ---
  const statusData = game?.status ?? game?.status ?? {};

  const status = useMemo(() => {
    const long = statusData?.long ?? "";
    const short = String(statusData?.short ?? "").toLowerCase();
    const longLower = long.toLowerCase();

    const livePhrases = [
      "in play",
      "playing",
      "live",
      "in progress",
      "1st half",
      "2nd half",
      "q1",
      "q2",
      "q3",
      "q4",
    ];

    const isHalftime =
      longLower.includes("halftime") ||
      statusData?.long?.toLowerCase?.() === "halftime" ||
      statusData?.short?.toLowerCase?.() === "halftime";

    let isFinal =
      ["final"].some((s) => longLower.includes(s)) || short.includes("ft");

    // ✅ Treat "AOT" as final
    if (longLower.includes("aot") || short.includes("aot")) {
      isFinal = true;
    }

    const isScheduled = ["not started"].some((s) => longLower.includes(s));

    // ✅ Live only if not final
    const isLive =
      !isFinal &&
      !isHalftime &&
      (livePhrases.some((p) => longLower.includes(p) || short.includes(p)) ||
        (statusData?.timer && statusData.timer !== "")) &&
      !longLower.includes("end of");

    return {
      isScheduled,
      isFinal,
      wentOT:
        longLower.includes("ot") ||
        longLower.includes("overtime") ||
        short.includes("ot"),
      isCanceled: longLower.includes("canceled"),
      isDelayed: longLower.includes("delayed"),
      isPostponed: longLower.includes("postponed"),
      isHalftime,
      isLive,
      short: statusData?.short,
      long,
      timer: statusData?.timer,
    };
  }, [statusData]);

  // --- Fix: College scores are not arrays ---
  const getPeriodScores = (teamScore?: Record<string, number | null>) => {
    if (!teamScore) return [];

    const periods: number[] = [];

    // ✅ CBB: use Q2 as H1, Q4 as H2
    const firstHalf = teamScore.quarter_2 ?? teamScore.half_1;
    const secondHalf = teamScore.quarter_4 ?? teamScore.half_2;

    if (firstHalf != null) periods.push(firstHalf);
    if (secondHalf != null) periods.push(secondHalf);
    // --- Date ---
    const gameDate = game?.timestamp
      ? new Date(game.timestamp * 1000)
      : game?.date
      ? new Date(game.date)
      : null;

    // ✅ Dynamically find all overtime keys and sort them numerically
    const overtimeKeys = Object.keys(teamScore)
      .filter((k) => k.startsWith("over_time"))
      .sort((a, b) => {
        const aNum = parseInt(a.split("_")[2] || "1", 10);
        const bNum = parseInt(b.split("_")[2] || "1", 10);
        return aNum - bNum;
      });

    // ✅ Add overtimes in proper order
    overtimeKeys.forEach((key) => {
      const val = teamScore[key];
      if (val != null) periods.push(val);
    });

    return periods.map((v) => v.toString());
  };

  
  const { score: liveScore } = useGameScores(
    "mens-college-basketball",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDateStr
  );
  const lineScore = liveScore?.periodScores?.length
   ? {
       home: liveScore.periodScores.map((p) => p.home.toString()),
       away: liveScore.periodScores.map((p) => p.away.toString()),
     }
   : undefined;
  
   const {
      officials,
      leaders,
      loading: officialsLoading,
      error: officialsError,
    } = useGameDetails("cbb", homeEspnId, awayEspnId, gameDateStr);
  

  const displayClock = liveScore?.displayClock;

  const { rankings } = useCBBRankings();
  // --- Extract AP Top 25 ---
  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];
    return apPoll.ranks.slice(0, 25).map((r) => ({
      name: r.team?.nickname, // use the same key as your game data
      rank: r.current,
    }));
  }, [rankings]);

  // --- Helper to get rank for a team ---
  const getTeamRank = (teamName: string) => {
    const found = apTop25.find((t) => t.name === teamName);
    return found ? found.rank : undefined;
  };

  const homeScore = liveScore?.home?.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away?.total ?? game.scores?.away?.total ?? 0;

  const { homeColor, awayColor, resolvedVenueCity, resolvedVenueAddress } =
    useMemo(() => {
      const resolvedVenueCity = game?.venue ?? home?.location ?? "";
      const resolvedVenueAddress =
        neutralVenueData?.address || home?.address || "";
      const resolvedVenueImage =
        neutralVenueData?.venueImage ||
        venueImages[resolvedVenueCity] ||
        venueImages[home?.code ?? ""];

      const getTeamColor = (team?: (typeof teams)[number]) =>
        team?.color ?? "#444";

      return {
        homeColor: getTeamColor(home),
        awayColor: getTeamColor(away),
        resolvedVenueCity,
        resolvedVenueAddress,
        resolvedVenueImage,
      };
    }, [game, home, neutralVenueData]);

  const getFinalWithOTLabel = (homePeriods: number, awayPeriods: number) => {
    const maxPeriods = Math.max(homePeriods, awayPeriods);
    const regulationPeriods = 2; // college basketball halves
    if (maxPeriods <= regulationPeriods) return "Final";
    const otCount = maxPeriods - regulationPeriods;
    return otCount === 1 ? "Final/OT" : `Final/OT${otCount}`;
  };

  const homeLastGames = useLastFiveGames(Number(game.teams.home?.id) || 0);
  const awayLastGames = useLastFiveGames(Number(game.teams.away?.id) || 0);
  const isScheduled = game.status.long === "Not Started";

  const week = game.week;
  const round =
    week === "NCAA - Final"
      ? "NCAA Men's Basketball Championship"
      : week === "NCAA - Semi-finals"
      ? "Final Four"
      : week === "NCAA - Quarter-finals"
      ? "Elite Eight"
      : week ?? "";

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
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={
            isChampionship
              ? ["#DFBD69", "#CDA765"]
              : [awayColor, awayColor, homeColor, homeColor]
          }
          locations={isChampionship ? undefined : [0, 0.4, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={
            isDark
              ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]
              : ["rgba(0,0,0,0.4)", "rgba(0,0,0,0.1)"]
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

            <View style={styles.header}>
              <TeamInfo
                team={away}
                teamName={away?.code ?? away?.shortName ?? away?.name ?? "Away"}
                score={awayScore}
                opponentScore={homeScore}
                record={awayRecord?.overall ?? "0-0"}
                isDark={isDark}
                isGameOver={isFinal}
                isScheduled={isScheduled}
                side="away"
                rank={getTeamRank(away?.name ?? "")}
              />

              <CenterInfo
                isChampionship={isChampionship}
                isFinalFour={isFinalFour}
                isMarchMadness={isMarchMadness}
                round={round ?? ""}
                isFinal={isFinal}
                isCanceled={isCanceled}
                isHalftime={status.isHalftime}
                isScheduled={status.isScheduled}
                broadcastNetworks={broadcastText}
                showLiveInfo={!!status.isLive} // ✅ fixed here
                clock={displayClock ?? liveScore?.displayClock ?? null}
                period={
                  status.isLive || status.isHalftime
                    ? (() => {
                        const rawPeriod = liveScore?.period ?? status.long;
                        if (typeof rawPeriod === "number") {
                          if (rawPeriod === 3) return "OT";
                          if (rawPeriod === 4) return "OT2";
                          if (rawPeriod > 4) return `OT${rawPeriod - 2}`;
                        } else if (typeof rawPeriod === "string") {
                          const p = rawPeriod.toLowerCase();
                          if (p.includes("3rd")) return "OT";
                          if (p.includes("4th")) return "OT2";
                          if (p.includes("5th")) return "OT3";
                        }
                        return rawPeriod;
                      })()
                    : status.isFinal
                    ? getFinalWithOTLabel(
                        lineScore?.home.length ?? 0,
                        lineScore?.away.length ?? 0
                      )
                    : status.long
                }
                formattedDate={formattedDate}
                isDark={isDark}
                time={formattedTime}
                lighter
              />

              <TeamInfo
                team={home}
                teamName={home?.code ?? home?.shortName ?? home?.name ?? "Home"}
                score={homeScore}
                opponentScore={awayScore}
                record={homeRecord?.overall ?? "0-0"}
                isDark={isDark}
                isGameOver={isFinal}
                isScheduled={isScheduled}
                side="home"
                rank={getTeamRank(home?.name ?? "")}
              />
            </View>
          </>

          <GamePreviewContent
            game={game}
            home={home}
            away={away}
            lineScore={lineScore}
            gameStats={gameStats}
           leaders={leaders}
            homeLastGames={homeLastGames}
            awayLastGames={awayLastGames}
            officials={officials}
            resolvedVenueCity={resolvedVenueCity}
            resolvedVenueAddress={resolvedVenueAddress}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            isDark={isDark}
          />
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "#888",
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
