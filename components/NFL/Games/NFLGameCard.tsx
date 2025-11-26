import { Ionicons } from "@expo/vector-icons";
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

import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";

import { Colors } from "constants/Colors";
import { getStyles } from "styles/GamecardStyles/GameCard.styles";

import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";

import {
  formatQuarter,
  getGameDate,
  getNFLGameStatus,
  getNFLTeamData,
  isSuperBowlGame,
  normalizeDisplayStatus,
} from "utils/nflGameCardUtils";

import { getBroadcastDisplay } from "utils/matchBroadcast";

// -------------------------------
// Types
// -------------------------------
type NFLStatus = {
  long?: string;
  short?: string;
};

// -------------------------------
// Status Mapper 
// -------------------------------
function mapNFLStatus(status: NFLStatus | undefined) {
  const long = status?.long?.toLowerCase() ?? "";
  const short = status?.short ?? "";

  if (long.includes("in") && long.includes("play")) return "In Play";
  if (long.includes("final")) return "Final";
  if (short === "FT" || short === "FINAL" || short === "F") return "Final";
  if (long.includes("halftime")) return "Halftime";
  if (long.includes("not started")) return "Scheduled";
  if (long.includes("canceled")) return "Canceled";
  if (long.includes("delayed")) return "Delayed";
  if (long.includes("postponed")) return "Postponed";

  return short || "Scheduled";
}


// -------------------------------
// Props
// -------------------------------
interface NFLGameCardProps {
  game: any;
  isDark?: boolean;
}
function NFLGameCard({ game, isDark }: NFLGameCardProps) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();

  const [notifEnabled, setNotifEnabled] = useState(false);

  // IDs
  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(game?.game?.date?.timestamp);

  const statusObj = getNFLGameStatus(game);
  const mappedStatus = mapNFLStatus(statusObj);

  const isLive =
    mappedStatus === "In Play" ||
    statusObj?.isLive ||
    statusObj?.short === "LIVE";

  const isFinal = mappedStatus === "Final";
  const isHalftime = mappedStatus === "Halftime";
  const isScheduled = mappedStatus === "Scheduled";

  const isSuperBowl = isSuperBowlGame(game, gameDate);

  // -----------------------
  // Team Records
  // -----------------------
  const { record: awayRecord } = useNFLTeamRecord(awayId);
  const { record: homeRecord } = useNFLTeamRecord(homeId);

  const awayEspnID = awayId;
  const homeEspnID = homeId;

  // -----------------------
  // Memo Team Objects
  // -----------------------
  const awayTeam = useMemo(
    () =>
      getNFLTeamData(
        awayId,
        awayEspnID,
        dark,
        awayRecord?.overall ?? "0-0",
        undefined
      ),
    [awayId, awayEspnID, awayRecord?.overall, dark]
  );

  const homeTeam = useMemo(
    () =>
      getNFLTeamData(
        homeId,
        homeEspnID,
        dark,
        homeRecord?.overall ?? "0-0",
        undefined
      ),
    [homeId, homeEspnID, homeRecord?.overall, dark]
  );

  // -----------------------
  // Possession + Live Data (same placement)
  // -----------------------
  const possession = isLive
    ? useNFLGamePossession(
        game?.teams?.home?.name,
        game?.teams?.away?.name,
        gameDateStr
      )
    : null;

  const safeScore = possession?.score ?? {
    home: { total: game?.scores?.home?.total ?? 0 },
    away: { total: game?.scores?.away?.total ?? 0 },
  };

  const period = possession?.period ?? null;

  // Normalize display status
  const displayStatus = normalizeDisplayStatus(
    possession?.gameStatusDescription ?? statusObj.long ?? statusObj.short ?? ""
  );


  const { headlineText } = useGameInfo(
    Number(homeEspnID),
    Number(awayEspnID),
    gameDateStr,
    "nfl"
  );

 
  const { broadcasts } = useNFLGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );
  const broadcastText = getBroadcastDisplay(broadcasts);


  const homeWins = safeScore.home.total > safeScore.away.total;
  const awayWins = safeScore.away.total > safeScore.home.total;

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

  // UI
  // -----------------------
  const renderCardContent = () => (
    <>
      {/* Away Team */}
      <View style={styles.teamSection}>
        {possession?.possessionTeamId === awayId && (
          <Image
            source={dark ? FootballLight : Football}
            style={{
              width: 20,
              height: 20,
              position: "absolute",
              right: -70,
              top: 24,
            }}
          />
        )}
        <Image source={awayTeam.logo} style={styles.logo} />
        <Text style={styles.teamName}>{awayTeam.name}</Text>
      </View>

      <ScoreText
        score={safeScore.away.total}
        record={awayTeam.record}
        teamWins={awayWins}
      />

      {/* Headline (center) */}
      <Text style={styles.headlineText}>{headlineText}</Text>

      {/* Center Info */}
      <View style={styles.info}>
        {isScheduled ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.date}>{formattedTime}</Text>
          </View>
        ) : isLive ? (
          <>
            <View style={styles.infoWrapper}>
              <Text style={styles.date}>{formatQuarter(period)}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.clock}>{possession?.displayClock ?? ""}</Text>
            </View>
            {possession?.possessionText && (
              <Text style={styles.downDistance}>
                {possession.possessionText}
              </Text>
            )}
          </>
        ) : isHalftime ? (
          <Text style={styles.date}>Halftime</Text>
        ) : (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{displayStatus}</Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
          </View>
        )}

        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      <ScoreText
        score={safeScore.home.total}
        record={homeTeam.record}
        teamWins={homeWins}
      />

      {/* Home Team */}
      <View style={styles.teamSection}>
        {possession?.possessionTeamId === homeId && (
          <Image
            source={dark ? FootballLight : Football}
            style={{
              width: 20,
              height: 20,
              position: "absolute",
              left: -70,
              top: 24,
            }}
          />
        )}
        <Image source={homeTeam.logo} style={styles.logo} />
        <Text style={styles.teamName}>{homeTeam.name}</Text>
      </View>

      {/* Bell */}
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

  // --- UI Render ---
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
      {isSuperBowl ? (
        <LinearGradient
          colors={
            isDark
              ? ["#876e42ff", "#54442aff"]
              : (["#DFBD69", "#CDA765"] as [string, string])
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
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
