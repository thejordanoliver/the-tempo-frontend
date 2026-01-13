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
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "constants/Colors";
import { getNFLTeam } from "constants/teamsNFL";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";

import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { getStyles } from "styles/GamecardStyles/GameCardStyles";
import { emptyNFLAwayTeam, emptyNFLHomeTeam, Game } from "types/nfl";

import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { getGameDate } from "utils/nflGameCardUtils";

type NFLGameCardProps = {
  game: Game;
};

function NFLGameCard({ game }: NFLGameCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  // -----------------------------------------------------
  // TEAM + DATE
  // -----------------------------------------------------
  const homeId = game?.teams?.home?.id ?? emptyNFLHomeTeam.id;
  const awayId = game?.teams?.away?.id ?? emptyNFLAwayTeam.id;

  const homeTeamObj = getNFLTeam(homeId);
  const awayTeamObj = getNFLTeam(awayId);

  const homeEspnId = homeTeamObj?.espnID;
  const awayEspnId = awayTeamObj?.espnID;

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

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(game?.game?.date?.timestamp);

  // -----------------------------------------------------
  // POSSESSION (live fetch)
  // -----------------------------------------------------
  const possession = useFootballGamePossession(
    homeEspnId,
    awayEspnId,
    gameDateStr,
    "nfl"
  );
  const isRedzone = possession?.redzone;

  const renderDownAndDistance = () => {
    if (!possession?.downDistanceText) return null;

    // Split only once on " at "
    const [beforeAt, afterAt] = possession?.downDistanceText.split(" at ");

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
                }, // or any red you want
              ]}
            >
              {afterAt}
            </Text>
          </>
        )}
      </Text>
    );
  };

  const gameStatusShortDetail = possession.gameStatusShortDetail;
  const gameStatusDescription = possession?.gameStatusDescription;
  const isFinal = finished || gameStatusDescription === "Final";
  const inProgress = gameStatusDescription === "In Progress" || isLive;
  const endOfPeriod = gameStatusDescription === "End of Period";
  const isScheduled = gameStatusDescription === "Scheduled" || notStarted;
  const isHalftime = gameStatusDescription === "Halftime" || halftime;
  const displayClock = possession.displayClock;

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2026 &&
      gameDate.getMonth() === 1 &&
      gameDate.getDate() === 7
  );

  const styles = getStyles(isDark, isChampionship);

  // -----------------------------------------------------
  // TEAM RECORDS
  // -----------------------------------------------------
  const awayRecord = useNFLTeamRecord(String(awayId)).record.overall;
  const homeRecord = useNFLTeamRecord(String(homeId)).record.overall;

  // -----------------------------------------------------
  // TEAM DATA
  // -----------------------------------------------------
  const awayTeam = useMemo(() => {
    const team = getNFLTeam(awayId) ?? emptyNFLAwayTeam;
    return {
      ...team,
      record: awayRecord ?? "0-0",
      hasPossession: isLive && possession?.possessionTeamId === team.espnID,
    };
  }, [awayId, awayRecord, isLive, possession]);

  const homeTeam = useMemo(() => {
    const team = getNFLTeam(homeId) ?? emptyNFLHomeTeam;
    return {
      ...team,
      record: homeRecord ?? "0-0",
      hasPossession: isLive && possession?.possessionTeamId === team.espnID,
    };
  }, [homeId, homeRecord, isLive, possession]);

  // -----------------------------------------------------
  // SCORE
  // -----------------------------------------------------
  const homeScore = isFinal ? game.scores.home.total : possession?.score?.home ?? 0;
  const awayScore = isFinal ? game.scores.away.total : possession?.score?.away ?? 0;
  const { data: details, loading } = useFootballGameDetails(
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
    "nfl"
  );

  
  const period = possession?.period;
  const headlineText = details?.headline;
  const broadcast = details?.broadcast;

  const isChristmasDay =
    gameDate?.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYearsDay = gameDate?.getMonth() === 0 && gameDate.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
    ? "New Year's Day"
    : null;

  const headline = headlineText ?? holidayLabel ?? "";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = awayScore === homeScore

  const winnerStyle = (teamWins: boolean) => ({
  color: isDark ? Colors.white : Colors.black,
  opacity: isFinal ? (isTie ? 1 : teamWins ? 1 : 0.5) : 1,
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
    if (inProgress)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formatNFLPeriod(Number(period))}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
        </View>
      );

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>{gameStatusShortDetail}</Text>;

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>
            {possession.gameStatusShortDetail}
          </Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View style={styles.infoWrapper}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.statusDivider} />
        <Text style={styles.date}>{formattedTime}</Text>
      </View>
    );
  };

  // -----------------------------------------------------
  // FINAL COMPONENT
  // -----------------------------------------------------
  const renderCardContent = () => (
    <>
      {/* AWAY */}
      <View style={styles.teamSection}>
        <Image
          source={isDark ? awayTeam.logoLight : awayTeam.logo}
          style={styles.logo}
        />
        <Text style={styles.teamName}>{awayTeam.name}</Text>
      </View>

      {/* HOME */}
      <View style={styles.teamSection}>
        <ScoreText
          score={awayScore}
          record={awayTeam.record}
          teamWins={awayWins}
        />
        {inProgress && awayTeam.hasPossession && (
          <Image
            source={isDark ? FootballLight : Football}
            style={styles.awayPossession}
          />
        )}
      </View>
      <Text style={styles.headlineText}>{headline}</Text>

      <View style={styles.info}>
        {renderStatus()}
        {renderDownAndDistance()}

        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>
      {/* HOME */}
      <View style={styles.teamSection}>
        <ScoreText
          score={homeScore}
          record={homeTeam.record}
          teamWins={homeWins}
        />
        {inProgress && homeTeam.hasPossession && (
          <Image
            source={isDark ? FootballLight : Football}
            style={styles.homePossession}
          />
        )}
      </View>
      <View style={styles.teamSection}>
        <Image
          source={isDark ? homeTeam.logoLight : homeTeam.logo}
          style={styles.logo}
        />
        <Text style={styles.teamName}>{homeTeam.name}</Text>
      </View>

      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
        style={styles.notificationBell}
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
