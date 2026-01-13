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
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";

import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { stackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { emptyNFLAwayTeam, emptyNFLHomeTeam } from "types/nfl";
import { getGameDate } from "utils/nflGameCardUtils";

type NFLGameCardProps = {
  game: any;
};

function NFLStackedGameCard({ game }: NFLGameCardProps) {
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

  const homeName = homeTeamObj?.fullName
  const awayName = awayTeamObj?.fullName

  const homeEspnId = homeTeamObj?.espnID;
  const awayEspnId = awayTeamObj?.espnID;

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
  const isFinal = gameStatusDescription === "Final";
  const isLive = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isScheduled = gameStatusDescription === "Scheduled";
  const displayClock = possession.displayClock;

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2026 &&
      gameDate.getMonth() === 1 &&
      gameDate.getDate() === 7
  );

  const styles = stackedGameCardStyles(isDark, isChampionship);

  // -----------------------------------------------------
  // TEAM RECORDS
  // -----------------------------------------------------
  const awayRecord = useNFLTeamRecord(awayId).record.overall;
  const homeRecord = useNFLTeamRecord(homeId).record.overall;

  

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
  const homeScore = possession?.score?.home ?? 0;
  const awayScore = possession?.score?.away ?? 0;
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

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
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
    if (isLive)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{formatNFLPeriod(Number(period))}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{possession?.displayClock ?? ""}</Text>
        </View>
      );

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (gameStatusDescription === "End of Period")
      return (
        <Text style={styles.clock}>
          End of {formatNFLPeriod(Number(period))}
        </Text>
      );

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
      <View style={styles.cardWrapper}>
        {/* AWAY */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={isDark ? awayTeam.logoLight : awayTeam.logo}
              style={styles.logo}
            />
            <Text style={styles.teamName}>{awayName}</Text>
            {isLive && awayTeam.hasPossession && (
              <Image
                source={isDark ? FootballLight : Football}
                style={styles.footballPossesion}
              />
            )}
          </View>

          <View style={styles.teamSection}>
            <ScoreText
              score={awayScore}
              record={awayTeam.record}
              teamWins={awayWins}
            />
          </View>
        </View>

        {/* HOME */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={isDark ? homeTeam.logoLight : homeTeam.logo}
              style={styles.logo}
            />
            <Text style={styles.teamName}>{homeName}</Text>
            {isLive && homeTeam.hasPossession && (
              <Image
                source={isDark ? FootballLight : Football}
                style={styles.footballPossesion}
              />
            )}
          </View>

          <ScoreText
            score={homeScore}
            record={homeTeam.record}
            teamWins={homeWins}
          />
        </View>
      </View>
      <Text style={styles.headlineText}>{headline}</Text>
      <View style={styles.info}>
        {renderStatus()}
        {renderDownAndDistance()}

        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
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

export default memo(NFLStackedGameCard);
