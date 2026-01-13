import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { getTeamInfo, getTeamLogo, teams } from "constants/teamsCBB";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameDetails } from "hooks/useGameDetails";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/GameCardStyles";
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";

function CBBGameCard({
  game,
  isWomen = false,
}: {
  game: CBBGame;
  isWomen?: boolean; // 👈 NEW
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const leagueKey = isWomen
    ? "womens-college-basketball"
    : "mens-college-basketball";

  const detailsLeague = isWomen ? "wcbb" : "cbb";

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  const home = getTeamInfo(homeId, isWomen);
  const away = getTeamInfo(awayId, isWomen);

  const homeName = home?.shortName ?? home?.name?? game?.teams?.home.name;
  const awayName = away?.shortName ?? away?.name ?? game?.teams?.away.name;

  const homeLogo = getTeamLogo(homeId, isDark);
  const awayLogo = getTeamLogo(awayId, isDark);

  const homeEspnId = home?.espnID ?? 0;
  const awayEspnId = away?.espnID ?? 0;

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
    ? new Date(game.date)
    : null;

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2025 &&
      gameDate.getMonth() === 3 &&
      gameDate.getDate() === 7
  );

  const styles = getStyles(isDark, isChampionship);
  const gameDateStr = gameDate ? gameDate.toISOString().split("T")[0] : "";
  const rankingsLeague = isWomen ? "423" : "116"; // 👈 ESPN league IDs

  const {
    getTeamRankingById,
    rankedTeamIds,
    loading: rankingsLoading,
  } = useCBBRankings(rankingsLeague);

  const getTeamById = useCallback((id?: number | string) => {
    if (!id) return undefined;

    // ✅ Always check wid first (works for men and women), then id
    return (
      teams.find((t) => String(t.wid) === String(id)) ??
      teams.find((t) => String(t.id) === String(id))
    );
  }, []);

  const canNavigate = getTeamById(homeId) && getTeamById(awayId);

  const headlineLeague = isWomen ? "wcbb" : "cbb";

  const { headlineText } = useCBBHeadline(
    homeEspnId,
    awayEspnId,
    gameDateStr,
    headlineLeague
  );

  const { score: liveScore, details } = useGameDetails(
    detailsLeague,
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDateStr
  );

  // --- Game status ---
  const gameStatusDescription = liveScore?.gameStatusDescription;
  const gameStatusDetail = liveScore?.gameStatusDetail;
  const isScheduled = gameStatusDescription === "Scheduled";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const currentPeriod = liveScore?.period ?? game.status.long ?? "";
  const clock = liveScore?.displayClock ?? game.status.timer ?? "0:00";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "Halftime" ||
    gameStatusDescription === "End of Period";

  // --- Helpers ---
  const formatQuarter = (period?: number | string, statusText?: string) => {
    if (!period && !statusText) return "";

    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) return val.toUpperCase();
      if (val.includes("halftime")) return "Halftime";
      return val;
    }

    const p = Number(period);

    // ✅ WOMEN: 4 quarters
    if (isWomen) {
      if (p === 1) return "1st";
      if (p === 2) return "2nd";
      if (p === 3) return "3rd";
      if (p === 4) return "4th";

      const ot = p - 4;
      return ot === 1 ? "OT" : `${ot}OT`;
    }

    // ✅ MEN: 2 halves
    if (p === 1) return "1st";
    if (p === 2) return "2nd";

    const ot = p - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  };

  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";
  const homeScore = liveScore?.home.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores?.away?.total ?? 0;

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/game/cbb/[game]",
      params: { game: JSON.stringify(game) },
    });
  }, [router, game]);

  // --- Broadcasts ---
  const { broadcasts } = useGameBroadcasts(
    homeEspnId,
    awayEspnId,
    gameDateStr,
    leagueKey
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

  const { formattedDate, formattedTime } = useMemo(() => {
    if (!gameDate) return { formattedDate: "", formattedTime: "" };

    return {
      formattedDate: gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      formattedTime: gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  }, [gameDate]);

  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: inProgress || isHalftime ? 1 : isFinal ? (teamWins ? 1 : 0.5) : 1,
  });

  const ScoreText = useCallback(
    ({
      score,
      recordData,
      teamWins,
      showRecord,
    }: {
      score?: number;
      recordData?: string;
      teamWins: boolean;
      showRecord?: boolean;
    }) => {
      const hasScore = typeof score === "number" && !isNaN(score);
      const displayValue =
        showRecord || !hasScore ? recordData ?? "-" : score?.toString() ?? "-";
      const style =
        showRecord || !hasScore
          ? styles.teamRecord
          : [styles.teamScore, winnerStyle(teamWins)];

      return <Text style={style}>{displayValue}</Text>;
    },
    [styles, winnerStyle]
  );

  const renderCardContent = () => (
    <>
      {/* Away Team */}
      <View style={styles.teamSection}>
        <Image
          source={awayLogo}
          style={[styles.logo]}
          accessibilityLabel={`${awayName} logo`}
        />
        <Text style={styles.teamName}>
          {(() => {
            if (!awayEspnId) return null;

            const ranking = getTeamRankingById(String(awayEspnId));

            if (!ranking || !rankedTeamIds.has(String(awayEspnId))) {
              return null;
            }

            return <Text style={styles.rank}>{ranking.current} </Text>;
          })()}

          {awayName}
        </Text>
      </View>
      <ScoreText
        score={awayScore}
        recordData={awayRecord}
        teamWins={awayWins}
        showRecord={isScheduled || isCanceled || isPostponed || isDelayed}
      />

      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headlineText}</Text>

      {/* Center Info */}
      <View style={styles.info}>
        {/* Status / Score */}
        {isCanceled ? (
          <Text style={styles.finalText}>Canceled</Text>
        ) : isDelayed ? (
          <Text style={styles.finalText}>Delayed</Text>
        ) : isPostponed ? (
          <Text style={styles.finalText}>Postponed</Text>
        ) : isHalftime ? (
          <Text style={styles.finalText}>Halftime</Text>
        ) : isFinal ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{gameStatusDetail}</Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
          </View>
        ) : endOfPeriod ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>
              End of {formatQuarter(currentPeriod)}
            </Text>
          </View>
        ) : inProgress ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formatQuarter(currentPeriod)}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.clock}>{clock}</Text>
          </View>
        ) : (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.date}>{formattedTime ?? "TBD"}</Text>
          </View>
        )}

        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* Home Team */}
      <ScoreText
        score={homeScore}
        recordData={homeRecord}
        teamWins={homeWins}
        showRecord={isScheduled || isCanceled || isPostponed || isDelayed}
      />

      <View style={styles.teamSection}>
        <Image
          source={homeLogo}
          style={[styles.logo]}
          accessibilityLabel={`${homeName} logo`}
        />
        <Text style={styles.teamName}>
          {(() => {
            if (!homeEspnId) return null;

            const ranking = getTeamRankingById(String(homeEspnId));

            if (!ranking || !rankedTeamIds.has(String(homeEspnId))) {
              return null;
            }

            return <Text style={styles.rank}>{ranking.current} </Text>;
          })()}

          {homeName}
        </Text>
      </View>

      {/* Notification Bell */}
      <Pressable
        onPress={() => {
          if (!canNavigate) return;

          router.push({
            pathname: "/game/cbb/[game]",
            params: { game: JSON.stringify(game) },
          });
        }}
        style={({ pressed }) => [
          styles.notificationBell,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : (["#dbb145ff", "#CDA765"] as [string, string])
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          {renderCardContent()}
        </LinearGradient>
      ) : (
        <View style={styles.card}>{renderCardContent()}</View>
      )}
    </TouchableOpacity>
  );
}
export default memo(CBBGameCard);
