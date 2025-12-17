import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Colors } from "constants/Colors";
import { neutralVenues, venueImages } from "constants/teams";
import { teams } from "constants/teamsCBB";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useGameDetails } from "hooks/CBBHooks/useGameDetails";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useLastFiveGames } from "hooks/CBBHooks/useLastFiveGames";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameScores } from "hooks/useGameScores";
import { useGameStatistics } from "hooks/useGameStatistics";
import { useTeamRecord } from "hooks/useTeamRecords";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { gamePreviewModalStyle } from "styles/GamePreviewStyles/GamePreviewModal";
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

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
    ? new Date(game.date)
    : null;

  // Championship: April 7
  const isChampionship =
    gameDate?.getMonth() === 3 && gameDate?.getDate() === 7;

  const styles = gamePreviewModalStyle(isChampionship);

  const home = teams.find((t) => String(t.id) === String(game.teams.home?.id));
  const away = teams.find((t) => String(t.id) === String(game.teams.away?.id));

  const { data: gameStats } = useGameStatistics(game?.id ?? 0);

  const { record: homeRecord } = useTeamRecord(home?.espnID, "cbb");
  const { record: awayRecord } = useTeamRecord(away?.espnID, "cbb");

  const neutralVenueData = neutralVenues[game?.venue ?? ""];
  const lat = neutralVenueData?.latitude ?? home?.latitude ?? null;
  const lon = neutralVenueData?.longitude ?? home?.longitude ?? null;

  const { broadcasts } = useGameBroadcasts(
    home?.name ?? "",
    away?.name ?? "",
    gameDate ? gameDate.toISOString() : "",
    "mens-college-basketball"
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

  const snapPoints = useMemo(() => ["60%", "80%", "88%", "94%"], []);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) requestAnimationFrame(() => sheetRef.current?.present());
    else requestAnimationFrame(() => sheetRef.current?.dismiss());
  }, [visible]);

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

  const gameDateISO = gameDate ? gameDate.toISOString() : "";
  const gameDateStr = gameDateISO ? gameDateISO.split("T")[0] : "";

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

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  // Use ESPN team IDs, not internal IDs
  const homeEspnId = getTeamById(home?.id)?.espnID;
  const awayEspnId = getTeamById(away?.id)?.espnID;

  // --- Live score (source of truth for status/clock/period) ---
  const { score: liveScore } = useGameScores(
    "mens-college-basketball",
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDateStr
  );


  // --- Period scores / line score ---
  const lineScore = liveScore?.periodScores?.length
    ? {
        home: liveScore.periodScores.map((p) => p.home.toString()),
        away: liveScore.periodScores.map((p) => p.away.toString()),
      }
    : undefined;

  // --- Fallback status from schedule/game object ---
  const statusData = game?.status ?? {};

  // --- Unified status object driven by liveScore.status first ---
  const status = useMemo(() => {
    // 1) Primary: live status
    const liveStatus = (liveScore?.status ?? "")
      .toString()
      .toLowerCase()
      .trim();

    // 2) Fallback: game status (long/short)
    const fallbackLong = (statusData?.long ?? "").toString().toLowerCase();
    const fallbackShort = (statusData?.short ?? "").toString().toLowerCase();

    const combined = liveStatus || fallbackShort || fallbackLong || ""; // never undefined

    const hasClock = !!liveScore?.displayClock || !!statusData?.timer;

    const contains = (needle: string) =>
      combined.includes(needle.toLowerCase());

    const isCanceled =
      combined === "canceled" || contains("canceled") || contains("cancelled");

    const isPostponed =
      combined === "postponed" || contains("postponed") || contains("ppd");

    const isDelayed =
      combined === "delayed" || contains("delayed") || contains("delay");

    const isHalftime =
      combined === "halftime" ||
      contains("halftime") ||
      fallbackLong === "halftime" ||
      fallbackShort === "halftime";

    const isFinal =
      combined === "final" ||
      contains("final") ||
      combined === "end_game" ||
      contains("end of game") ||
      contains("aot");

    const isScheduled =
      combined === "scheduled" ||
      combined === "pre_game" ||
      contains("not started") ||
      contains("scheduled") ||
      combined === "";

    const isLive =
      !isFinal &&
      !isHalftime &&
      !isCanceled &&
      !isPostponed &&
      !isDelayed &&
      (combined === "in_play" ||
        combined === "live" ||
        contains("in play") ||
        contains("playing") ||
        contains("1st half") ||
        contains("2nd half") ||
        contains("q1") ||
        contains("q2") ||
        contains("q3") ||
        contains("q4") ||
        (hasClock && !contains("end of")));

    const wentOT =
      contains("ot") ||
      contains("overtime") ||
      combined === "aot" ||
      fallbackLong.includes("aot");

    return {
      isScheduled,
      isFinal,
      wentOT,
      isCanceled,
      isDelayed,
      isPostponed,
      isHalftime,
      isLive,
      raw: combined,
      short: statusData?.short,
      long: statusData?.long,
      timer: statusData?.timer,
    };
  }, [liveScore?.status, statusData]);

  const displayClock = liveScore?.displayClock;

  const {
    officials,
    leaders,
    loading: officialsLoading,
    error: officialsError,
  } = useGameDetails("cbb", homeEspnId, awayEspnId, gameDateStr);

  const { rankings } = useCBBRankings();

  // --- Extract AP Top 25 ---
  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];
    return apPoll.ranks.slice(0, 25).map((r) => ({
      id: r.team?.id, // use team id (string)
      rank: r.current,
    }));
  }, [rankings]);

  const getTeamRank = (teamId: string | number) => {
    const idStr = String(teamId);
    const found = apTop25.find((t) => t.id === idStr);
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
        team?.color ?? Colors.darkGray;

      return {
        homeColor: getTeamColor(home),
        awayColor: getTeamColor(away),
        resolvedVenueCity,
        resolvedVenueAddress,
        resolvedVenueImage,
      };
    }, [game, home, neutralVenueData, away]);

  const getFinalWithOTLabel = (homePeriods: number, awayPeriods: number) => {
    const maxPeriods = Math.max(homePeriods, awayPeriods);
    const regulationPeriods = 2; // college basketball halves
    if (maxPeriods <= regulationPeriods) return "Final";
    const otCount = maxPeriods - regulationPeriods;
    return otCount === 1 ? "Final/OT" : `Final/OT${otCount}`;
  };

  const homeLastGames = useLastFiveGames(Number(game.teams.home?.id) || 0);
  const awayLastGames = useLastFiveGames(Number(game.teams.away?.id) || 0);

  const week = game.week;
  const round =
    week === "NCAA - Final"
      ? "NCAA Men's Basketball Championship"
      : week === "NCAA - Semi-finals"
      ? "Final Four"
      : week === "NCAA - Quarter-finals"
      ? "Elite Eight"
      : week ?? "";

  // For TeamInfo: consider game "over" if final / canceled / postponed
  const isGameOverForTeams =
    status.isFinal || status.isCanceled || status.isPostponed;

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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
            {headlineText && (
              <>
                {headlineText && (
                  <Text style={styles.headlineText}>{headlineText}</Text>
                )}
              </>
            )}

            <View style={styles.gameHeaderContainer}>
              <TeamInfo
                team={away}
                teamName={away?.code ?? away?.shortName ?? away?.name ?? "Away"}
                score={awayScore}
                opponentScore={homeScore}
                record={awayRecord?.overall ?? "0-0"}
                isDark={isDark}
                isGameOver={isGameOverForTeams}
                isScheduled={status.isScheduled}
                side="away"
                rank={getTeamRank(away?.espnID ?? 0)}
                lighter
              />

              <CenterInfo
                isChampionship={isChampionship}
                isFinalFour={isFinalFour}
                isMarchMadness={isMarchMadness}
                round={round ?? ""}
                isFinal={status.isFinal}
                isCanceled={status.isCanceled}
                isHalftime={status.isHalftime}
                isScheduled={status.isScheduled}
                broadcastNetworks={broadcastText}
                showLiveInfo={!!status.isLive}
                clock={displayClock ?? null}
                period={
                  status.isLive || status.isHalftime
                    ? (() => {
                        const rawPeriod = liveScore?.period ?? statusData.long;
                        if (typeof rawPeriod === "number") {
                          // 1 = 1H, 2 = 2H, 3+ = OT variants
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
                    : statusData.long
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
                isGameOver={isGameOverForTeams}
                isScheduled={status.isScheduled}
                side="home"
                rank={getTeamRank(home?.espnID ?? 0)}
                lighter
              />
            </View>
          </>

          <GamePreviewContent
            game={game}
            home={home}
            away={away}
            lineScore={lineScore}
            gameStats={gameStats}
            leaders={!status.isScheduled ? leaders : null}
            homeLastGames={homeLastGames}
            awayLastGames={awayLastGames}
            officials={officials}
            isDark={isDark}
            gameDateISO={gameDateISO} // 👈 NEW
            gameDateStr={gameDateStr} // 👈 stays
          />
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
