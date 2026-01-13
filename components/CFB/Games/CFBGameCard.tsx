import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { getRivalryHeadline, getTeamLogo, teams } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCFBGameDetails } from "hooks/CFBHooks/useCFBGameDetails";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { memo, useMemo, useState } from "react";
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
import { emptyAwayTeam, emptyHomeTeam, emptyTeam, Game } from "types/cfb";
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";

type Props = {
  game: Game;
};

function CFBGameCard({ game }: Props) {
  const colorScheme = useColorScheme();
  const  isDark = colorScheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  // --- Date & Championship detection ---
  const gameDate = game?.game?.date?.timestamp
    ? new Date(game.game.date.timestamp * 1000)
    : null;
  const gameDateStr = gameDate?.toISOString();

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2026 &&
      gameDate.getMonth() === 0 &&
      gameDate.getDate() === 19
  );

  const styles = getStyles(isDark, isChampionship);

  // --- Rankings ---
  const cfpTop25 = useCFPTop25();
  const apTop25 = useAPTop25();
  const isCFPActive = cfpTop25 && cfpTop25.length > 0;

  const getTeamRank = (id: number | string) => {
    if (isCFPActive) return getTeamRankFromCFPById(id, cfpTop25) ?? "";
    return getTeamRankFromAPById(id, apTop25) ?? "";
  };

  // --- Team info helpers ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  const getTeamName = (id?: number | string) =>
    getTeamById(id)?.name ?? emptyTeam.name;
  const getTeamShortName = (id?: number | string) =>
    getTeamById(id)?.shortName ?? "";

  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  const status = game.game.status;
  const finished =
    status.long === "Finished" || status.long === "After Over Time";
  const notStarted = status.long === "Not Started";
  const halftime = status.long === "Halftime";
  const finalOT = status.long === "After Over Time" ? "Final/OT" : "Final";

  const isLive = [
    "First Quarter",
    "Second Quarter",
    "Halftime",
    "Third Quarter",
    "Fourth Quarter",
    "Overtime",
  ].includes(status.long);

  // --- Possession & Score ---
  const {
    possessionTeamId,
    downDistanceText,
    displayClock,
    period,
    score,
    redzone,
    gameStatusShortDetail,
    gameStatusDescription,
  } = useFootballGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr);

  const isFinal = finished || gameStatusDescription === "Final";
  const inProgress = gameStatusDescription === "In Progress" || isLive;
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isScheduled = gameStatusDescription === "Scheduled" || notStarted;
  const isHalftime = gameStatusDescription === "Halftime" || halftime;
  const isRedzone = redzone;

  const renderDownAndDistance = () => {
    if (!downDistanceText) return null;
    const [beforeAt, afterAt] = downDistanceText.split(" at ");
    return (
      <Text style={styles.downDistance}>
        {beforeAt}
        {afterAt && (
          <>
            {" at "}
            <Text
              style={[
                styles.downDistance,
                isRedzone && {
                  color: isDark ? Colors.dark.lightRed : Colors.light.red,
                },
              ]}
            >
              {afterAt}
            </Text>
          </>
        )}
      </Text>
    );
  };

  // --- Team records ---
  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      ...emptyAwayTeam,
      id: awayId ?? emptyAwayTeam.id,
      espnID: awayEspnId ?? emptyAwayTeam.espnID,
      name: getTeamName(awayId),
      shortName: getTeamShortName(awayId),
      logo: getTeamLogo(awayId, isDark) || emptyAwayTeam.logo,
      record: awayRecord?.overall ?? "0-0",
      hasPossession:
        inProgress && String(possessionTeamId) === String(awayEspnId),
    }),
    [
      awayId,
      awayEspnId,
      awayRecord?.overall,
      possessionTeamId,
      isDark,
      inProgress,
    ]
  );

  const homeTeam = useMemo(
    () => ({
      ...emptyHomeTeam,
      id: homeId ?? emptyHomeTeam.id,
      espnID: homeEspnId ?? emptyHomeTeam.espnID,
      name: getTeamName(homeId),
      shortName: getTeamShortName(homeId),
      logo: getTeamLogo(homeId, isDark) ?? emptyHomeTeam.logo,
      record: homeRecord?.overall ?? "0-0",
      hasPossession:
        inProgress && String(possessionTeamId) === String(homeEspnId),
    }),
    [
      homeId,
      homeEspnId,
      homeRecord?.overall,
      possessionTeamId,
      isDark,
      inProgress,
    ]
  );

  const { broadcast, headline } = useCFBGameDetails(
    String(awayEspnId || emptyAwayTeam.espnID),
    String(homeEspnId || emptyHomeTeam.espnID),
    gameDateStr
  );

  const rivalryHeadline = useMemo(
    () => getRivalryHeadline(Number(homeEspnId), Number(awayEspnId)),
    [homeEspnId, awayEspnId]
  );

  const headlineText = headline || rivalryHeadline || "";

  const getDisplayValue = (isHome: boolean) => {
    if (isScheduled) return isHome ? homeTeam.record : awayTeam.record;
    if (isFinal)
      return isHome
        ? score?.home ?? game?.scores?.home?.total ?? 0
        : score?.away ?? game?.scores?.away?.total ?? 0;
    return isHome ? score?.home : score?.away;
  };

  const formatQuarter = (period?: number | string) => {
    if (!period) return "";

    const p = Number(period);
    if (!isNaN(p)) {
      if (p <= 4) return ["1st", "2nd", "3rd", "4th"][p - 1];
      const otNumber = p - 4;
      return otNumber === 1 ? "OT" : `OT${otNumber}`;
    }

    // fallback for string values like "ot", "overtime"
    const val = String(period).toLowerCase();
    if (val.includes("ot") || val.includes("overtime")) {
      const match = val.match(/\d+/);
      return match ? `OT${match[0]}` : "OT";
    }

    return period;
  };

  const formattedDate =
    gameDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ||
    "";
  const formattedTime =
    gameDate?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const getTeamStyle = useMemo(
    () =>
      (isHome: boolean): TextStyle => {
        const homeScore = score?.home ?? 0;
        const awayScore = score?.away ?? 0;

        let isWinner = true; // default: fully visible

        if (isFinal && homeScore !== awayScore) {
          // final and not a tie: only winner is fully visible
          isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
        }

        return {
          color: isDark ? Colors.white : Colors.black,
          opacity: isWinner ? 1 : 0.5,
        };
      },
    [isDark, isFinal, score]
  );

  const renderCardContent = () => (
    <>
      {/* Away Team */}
      <View style={styles.teamSection}>
        <Image source={awayTeam.logo} style={styles.logo} />
        <Text style={[styles.teamName, { width: 100, flexDirection: "row" }]}>
          {awayEspnId && getTeamRank(String(awayEspnId)) ? (
            <Text style={styles.rank}>{getTeamRank(String(awayEspnId))} </Text>
          ) : null}
          {awayTeam.shortName || awayTeam.name}
        </Text>
      </View>

      {/* Away Score / Record */}
      <View style={styles.teamSection}>
        <Text
          style={[
            isScheduled ? styles.teamRecord : styles.teamScore,
            getTeamStyle(false),
          ]}
        >
          {getDisplayValue(false)}
        </Text>
        {awayTeam.hasPossession && (
          <Image
            source={isDark ? FootballLight : Football}
            style={styles.awayPossession}
          />
        )}
      </View>

      {/* Headline */}
      <Text style={styles.headlineText}>{headlineText}</Text>

      {/* Game Info */}
      <View style={styles.info}>
        {isScheduled ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.date}>{formattedTime}</Text>
          </View>
        ) : inProgress ? (
          <>
            {isHalftime ? (
              <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
            ) : endOfPeriod ? (
              <Text style={styles.clock}>End of {formatQuarter(period)}</Text>
            ) : (
              <View style={styles.infoWrapper}>
                <Text style={styles.date}>{formatQuarter(period)}</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
              </View>
            )}
            {renderDownAndDistance()}
          </>
        ) : isFinal ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>
              {gameStatusShortDetail ? gameStatusShortDetail : finalOT}
            </Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
          </View>
        ) : (
          <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
        )}

        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>

      {/* Home Score / Record */}
      <View style={styles.teamSection}>
        <Text
          style={[
            isScheduled ? styles.teamRecord : styles.teamScore,
            getTeamStyle(true),
          ]}
        >
          {getDisplayValue(true)}
        </Text>
        {homeTeam.hasPossession && (
          <Image
            source={isDark ? FootballLight : Football}
            style={styles.awayPossession}
          />
        )}
      </View>

      {/* Home Team */}
      <View style={styles.teamSection}>
        <Image source={homeTeam.logo} style={styles.logo} />
        <Text style={[styles.teamName, { width: 100, flexDirection: "row" }]}>
          {homeEspnId && getTeamRank(String(homeEspnId)) ? (
            <Text style={styles.rank}>{getTeamRank(String(homeEspnId))} </Text>
          ) : null}
          {homeTeam.shortName || homeTeam.name}
        </Text>
      </View>

      {/* Notification Bell */}
      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
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
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/cfb/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : (["#DFBD69", "#CDA765"] as [string, string])
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

export default memo(CFBGameCard);
