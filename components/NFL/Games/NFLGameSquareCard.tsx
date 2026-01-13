// ----------------------------------------------
// 🚀 NEW NFL GAMECARD — MATCHED TO NBA LOGIC
// ----------------------------------------------

import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "constants/Colors";
import { getNFLTeam } from "constants/teamsNFL";
import { gameSquareCardStyles } from "styles/GamecardStyles/GameSquareCardStyles";
import { emptyNFLAwayTeam, emptyNFLHomeTeam } from "types/nfl";

import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";

import { getBroadcastDisplay } from "utils/matchBroadcast";
import {
  getGameDate,
  getNFLGameStatus,
  normalizeDisplayStatus,
} from "utils/nflGameCardUtils";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";

// -----------------------------------------------------
// 🧠 Detect “End of X Quarter”
// -----------------------------------------------------
function detectEndOfPeriod(statusText?: string) {
  const text = (statusText ?? "").toLowerCase();
  return (
    text.includes("end of") &&
    (text.includes("quarter") || text.includes("qtr"))
  );
}

// -----------------------------------------------------
// 🧠 Map ESPN status → readable state
// -----------------------------------------------------
function mapNFLStatus(statusObj: any): string {
  const long = statusObj?.long?.toLowerCase?.() ?? "";
  const short = String(statusObj?.short ?? "").toUpperCase();

  if (
    long.includes("final") ||
    short === "F" ||
    short === "FT" ||
    short === "FINAL"
  )
    return "Final";

  if (long.includes("halftime") || short === "HT") return "Halftime";
  if (long.includes("in") && long.includes("play")) return "In Play";
  if (long.includes("scheduled")) return "Scheduled";
  if (long.includes("canceled")) return "Canceled";
  if (long.includes("delayed")) return "Delayed";
  if (long.includes("postponed")) return "Postponed";

  if (["Q1", "Q2", "Q3", "Q4", "OT"].includes(short)) return "In Play";

  return "Scheduled";
}

type NFLGameCardProps = {
  game: any;
  isDark?: boolean;
};

function NFLGameCard({ game, isDark }: NFLGameCardProps) {
  const scheme = useColorScheme();
  const dark = isDark ?? scheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  // -----------------------------------------------------
  // TEAM + DATE
  // -----------------------------------------------------
  const homeId = game?.teams?.home?.id ?? emptyNFLHomeTeam.id;
  const awayId = game?.teams?.away?.id ?? emptyNFLAwayTeam.id;

  const homeTeamObj = getNFLTeam(homeId);
  const awayTeamObj = getNFLTeam(awayId);

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(game?.game?.date?.timestamp);

  // -----------------------------------------------------
  // BASE STATUS (from ESPN)
  // -----------------------------------------------------
  const statusObj = getNFLGameStatus(game);
  const mappedStatus = mapNFLStatus(statusObj);

  const status = statusObj.short;

  const prelimLive =
    mappedStatus === "In Play" ||
    statusObj?.isLive ||
    statusObj?.short === "LIVE";

  // -----------------------------------------------------
  // POSSESSION (live fetch)
  // -----------------------------------------------------
  const possession = prelimLive
    ? useFootballGamePossession(
        game?.teams?.home?.name,
        game?.teams?.away?.name,
        gameDateStr
      )
    : null;

  const liveText = (possession?.gameStatusDescription ?? "").toLowerCase();
  const endOfPeriod = detectEndOfPeriod(liveText);

  // -----------------------------------------------------
  // EFFECTIVE STATUS (NBA identical logic)
  // -----------------------------------------------------
  const effectiveStatus = endOfPeriod
    ? "EndOfPeriod"
    : liveText.includes("final")
    ? "Final"
    : liveText.includes("halftime")
    ? "Halftime"
    : liveText.includes("in progress") ||
      liveText.includes("qtr") ||
      liveText.includes("quarter")
    ? "In Play"
    : mappedStatus;

  const isFinal = effectiveStatus === "Final";
  const isLive = effectiveStatus === "In Play";
  const isHalftime = effectiveStatus === "Halftime";
  const isScheduled = effectiveStatus === "Scheduled";

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2026 &&
      gameDate.getMonth() === 1 &&
      gameDate.getDate() === 7
  );

  const styles = gameSquareCardStyles(dark, isChampionship);

  // -----------------------------------------------------
  // TEAM RECORDS
  // -----------------------------------------------------
  const { record: awayRecord } = useNFLTeamRecord(awayId);
  const { record: homeRecord } = useNFLTeamRecord(homeId);

  // -----------------------------------------------------
  // TEAM DATA
  // -----------------------------------------------------
  const awayTeam = useMemo(() => {
    const team = getNFLTeam(awayId) ?? emptyNFLAwayTeam;
    return {
      ...team,
      record: awayRecord?.overall ?? "0-0",
      hasPossession: isLive && possession?.possessionTeamId === awayId,
    };
  }, [awayId, awayRecord?.overall, isLive, possession]);

  const homeTeam = useMemo(() => {
    const team = getNFLTeam(homeId) ?? emptyNFLHomeTeam;
    return {
      ...team,
      record: homeRecord?.overall ?? "0-0",
      hasPossession: isLive && possession?.possessionTeamId === homeId,
    };
  }, [homeId, homeRecord?.overall, isLive, possession]);

  // -----------------------------------------------------
  // SCORE
  // -----------------------------------------------------
 const homeScore = possession?.score?.home ?? 0
 const awayScore = possession?.score?.away ?? 0

  const period = possession?.period;
  const statusDetail =
    game?.status?.type?.detail ||
    possession?.gameStatusDescription ||
    statusObj.long ||
    statusObj.short ||
    "";

  const statusDisplay = normalizeDisplayStatus(statusDetail);

  // -----------------------------------------------------
  // HEADLINE
  // -----------------------------------------------------
  const { headlineText } = useGameInfo(
    Number(homeTeam.espnID),
    Number(awayTeam.espnID),
    gameDateStr,
    "nfl"
  );

  // -----------------------------------------------------
  // BROADCAST
  // -----------------------------------------------------
  const { broadcasts } = useNFLGameBroadcasts(
    homeTeam.espnID,
    awayTeam.espnID,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;

  const winnerStyle = (teamWins: boolean) => ({
    color: dark ? Colors.white : Colors.black,
    opacity: isFinal ? (teamWins ? 1 : 0.5) : 1,
  });

  const ScoreText = ({
    score,
    record,
    teamWins,
  }: {
    score: number;
    record: string;
    teamWins: boolean;
  }) => {
    const showRecord = isScheduled;
    return (
      <Text
        style={
          showRecord
            ? styles.teamRecord
            : [styles.teamScore, winnerStyle(teamWins)]
        }
      >
        {showRecord ? record : score}
      </Text>
    );
  };

  function formatNFLPeriod(period?: number) {
    if (!period) return "Live";

    if (period <= 4) {
      const map = ["1st", "2nd", "3rd", "4th"];
      return map[period - 1] ?? `${period}`;
    }

    // OT logic
    const ot = period - 4;
    return ot === 1 ? "OT" : `${ot}OT`;
  }

  // -----------------------------------------------------
  // STATUS UI
  // -----------------------------------------------------
  const renderStatus = () => {
    if (endOfPeriod) return <Text style={styles.date}>{statusDisplay}</Text>;

    if (isLive)
      return (
        <>
          <Text style={styles.period}>{formatNFLPeriod(Number(period))}</Text>
          <Text style={styles.clock}>{possession?.displayClock ?? ""}</Text>
        </>
      );

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (isFinal)
      return (
        <>
          <Text style={styles.finalText}>{statusDisplay}</Text>
        </>
      );

    return (
      <>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.date}>{formattedTime}</Text>
      </>
    );
  };

  // -----------------------------------------------------
  // FINAL COMPONENT
  // -----------------------------------------------------
  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* AWAY */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={isDark ? awayTeam.logoLight : awayTeam.logo}
              style={styles.logo}
            />
            <Text style={styles.teamName}>{awayTeam.code}</Text>
            {isLive && awayTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={styles.footballPossesion}
              />
            )}
          </View>
          <ScoreText
            score={awayScore}
            record={awayTeam.record}
            teamWins={awayWins}
          />
        </View>

        <Text style={styles.headlineText}>{headlineText}</Text>

        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={isDark ? homeTeam.logoLight : homeTeam.logo}
              style={styles.logo}
            />
            <Text style={styles.teamName}>{homeTeam.code}</Text>
            {isLive && homeTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={styles.footballPossesion}
              />
            )}
          </View>
          {/* HOME */}
          <ScoreText
            score={homeScore}
            record={homeTeam.record}
            teamWins={homeWins}
          />
        </View>
      </View>
      <View style={styles.info}>
        {renderStatus()}
        {possession?.downDistanceText && (
          <Text style={styles.downDistance}>
            {possession?.shortDownDistanceText ?? null}
          </Text>
        )}

       
      </View>
      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
        style={styles.notificationBell}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={20}
          color={dark ? Colors.white : Colors.black}
        />
      </Pressable>
       {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
    </>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/nfl/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
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

export default memo(NFLGameCard);
