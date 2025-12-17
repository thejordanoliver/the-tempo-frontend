// ----------------------------------------------
// 🚀 NEW NFL GAMECARD — MATCHED TO NBA LOGIC
// ----------------------------------------------

import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { getNFLTeam } from "constants/teamsNFL";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useMemo } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { emptyNFLAwayTeam, emptyNFLHomeTeam } from "types/nfl";

import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { stackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import {
  getGameDate,
  getNFLGameStatus,
  normalizeDisplayStatus,
} from "utils/nflGameCardUtils";

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

function NFLStackedGameCard({ game, isDark }: NFLGameCardProps) {
  const scheme = useColorScheme();
  const dark = isDark ?? scheme === "dark";
  const router = useRouter();

  // -----------------------------------------------------
  // TEAM + DATE
  // -----------------------------------------------------
  const homeId = game?.teams?.home?.id ?? emptyNFLHomeTeam.id;
  const awayId = game?.teams?.away?.id ?? emptyNFLAwayTeam.id;

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
    ? useNFLGamePossession(
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

  const styles = stackedGameCardStyles(dark, isChampionship);

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
  const score = possession?.score ?? {
    home: { total: game?.scores?.home?.total ?? 0 },
    away: { total: game?.scores?.away?.total ?? 0 },
  };

  const period = possession?.period;
  const statusDisplay = normalizeDisplayStatus(
    possession?.gameStatusDescription ?? statusObj.long ?? statusObj.short ?? ""
  );

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
  const homeWins = score.home.total > score.away.total;
  const awayWins = score.away.total > score.home.total;

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

  const renderStatus = () => {
    if (endOfPeriod) return <Text style={styles.date}>{statusDisplay}</Text>;

    if (isLive)
      return (
        <View style={styles.info}>
          <Text style={styles.date}>{formatNFLPeriod(Number(period))}</Text>
          <Text style={styles.clock}>{possession?.displayClock ?? ""}</Text>
        </View>
      );

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (isFinal)
      return (
        <View style={styles.info}>
          <Text style={styles.finalText}>{statusDisplay}</Text>
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View style={styles.info}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
        <Text style={styles.broadcast}>{broadcastText}</Text>
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={awayTeam.logo} style={styles.logo} />
            <Text style={styles.teamName}>{awayTeam.name}</Text>
            {awayTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={styles.footballIcon}
              />
            )}
          </View>

          <ScoreText
            score={score.away.total}
            record={awayTeam.record}
            teamWins={awayWins}
          />
        </View>

        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={homeTeam.logo} style={styles.logo} />
            <Text style={styles.teamName}>{homeTeam.name}</Text>
            {homeTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={styles.footballIcon}
              />
            )}
          </View>

          <ScoreText
            score={score.home.total}
            record={homeTeam.record}
            teamWins={homeWins}
          />
        </View>
      </View>

      {renderStatus()}
      <Text style={styles.headlineText}>{headlineText}</Text>
    </>
  );

  // --- UI ---
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

export default memo(NFLStackedGameCard);
