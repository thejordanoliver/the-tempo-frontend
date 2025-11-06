import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { useRouter } from "expo-router";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import { memo, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/GameCard.styles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import {
  formatQuarter,
  getGameDate,
  getNFLGameStatus,
  getNFLTeamData,
  getTeamTextStyle,
  isSuperBowlGame,
  normalizeDisplayStatus,
} from "utils/nflGameCardUtils";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
type Props = {
  game: any; // TODO: replace with proper Game type
  isDark?: boolean;
};

function NFLGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  // --- Game Date ---
  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(game?.game?.date?.timestamp);

  

  // --- Status ---
  const status = getNFLGameStatus(game);

  // --- Super Bowl ---
  const isSuperBowl = isSuperBowlGame(game, gameDate);

  // --- Team Records ---
  const { record: awayRecord } = useNFLTeamRecord(awayId);
  const { record: homeRecord } = useNFLTeamRecord(homeId);

  // --- Possession & live data (only if live) ---
  const possession =
    status.isLive && homeId && awayId
      ? useNFLGamePossession(
          game?.teams?.home?.name,
          game?.teams?.away?.name,
          gameDateStr
        )
      : {
          possessionTeamId: undefined,
          displayClock: undefined,
          shortDownDistanceText: undefined,
          downDistanceText: undefined,
          period: undefined,
          possessionText: undefined,
          lastPlay: undefined,
          homeTimeouts: undefined,
          awayTimeouts: undefined,
          score: {
            home: { total: game?.scores?.home?.total ?? 0 },
            away: { total: game?.scores?.away?.total ?? 0 },
          },
          loading: false,
          error: null,
          gameStatusDescription: undefined,
          gameStatusDetail: undefined,
          gameStatusShortDetail: undefined,
          refresh: () => {},
        };

  const {
    possessionTeamId,
    displayClock,
    shortDownDistanceText,
    downDistanceText,
    period,
    possessionText,
    gameStatusDescription,
    score,
  } = possession;

  const safeScore = score ?? { home: { total: 0 }, away: { total: 0 } };

  // --- Display Status ---
  const displayStatus = normalizeDisplayStatus(
    gameStatusDescription ?? status.long ?? status.short ?? ""
  );
const awayTeamEspnID = awayId;
const homeTeamEspnID = homeId;

  // --- Teams ---
const awayTeam = useMemo(
  () =>
    getNFLTeamData(
      awayId,
      awayTeamEspnID, // ✅ replace with the actual ESPN ID variable
      dark,
      awayRecord?.overall ?? "0-0",
      possessionTeamId
    ),
  [awayId, awayTeamEspnID, awayRecord?.overall, possessionTeamId, dark]
);

const homeTeam = useMemo(
  () =>
    getNFLTeamData(
      homeId,
      homeTeamEspnID, // ✅ replace with the actual ESPN ID variable
      dark,
      homeRecord?.overall ?? "0-0",
      possessionTeamId
    ),
  [homeId, homeTeamEspnID, homeRecord?.overall, possessionTeamId, dark]
);


   const { headlineText } = useGameInfo(
      Number(  homeTeam?.espnID ),
      Number(  awayTeam?.espnID ),
      gameDateStr,
      "nfl"
    );
  

  // --- Broadcasts ---
  const { broadcasts } = useNFLGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Team Style (winner/loser) ---
  const getTeamStyle = useMemo(
    () => (isHome: boolean) =>
      getTeamTextStyle(isHome, dark, status, safeScore, isSuperBowl),
    [dark, status, safeScore, isSuperBowl]
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
      <View style={styles.card}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          {awayTeam.hasPossession && (
            <Image
              source={dark ? FootballLight : Football}
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                position: "absolute",
                right: -70,
                top: 24,
              }}
            />
          )}
          <Image source={awayTeam.logo} style={styles.logo} />
          <Text style={[styles.teamName, { width: 100 }]}>{awayTeam.name}</Text>
        </View>

        {/* Away Score / Record */}
        <Text
          style={[
            status.isScheduled ? styles.teamRecord : styles.teamScore,
            getTeamStyle(false),
          ]}
        >
          {status.isScheduled ? awayTeam.record : safeScore.away.total}
        </Text>

        {/* Game Info */}
        <View style={styles.info}>
          {status.isScheduled ? (
            <View style={styles.infoWrapper}>
              <Text style={styles.date}>{formattedDate}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.date}>{formattedTime}</Text>
            </View>
          ) : status.isLive ? (
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.date}>{formatQuarter(period)}</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.clock}>{displayClock}</Text>
              </View>
              {shortDownDistanceText && possessionText && (
                <Text style={styles.downDistance}>{possessionText}</Text>
              )}
            </>
          ) : status.isHalftime && !status.isLive ? (
            // Only show "Halftime" if not live and no active clock
            <>
              <Text style={styles.date}>Halftime</Text>
            </>
          ) : status.isLive ? (
            // Live state overrides halftime
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.date}>{formatQuarter(period)}</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.clock}>
                  {displayClock && displayClock !== "0:00" ? displayClock : ""}
                </Text>
              </View>
              {shortDownDistanceText && possessionText && (
                <Text style={styles.downDistance}>{possessionText}</Text>
              )}
            </>
          ) : (
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText}>{displayStatus}</Text>
              <View style={styles.finalStatusDivider} />
              <Text style={styles.finalText}>{formattedDate}</Text>
            </View>
          )}
          {!status.isFinal && broadcastText && (
            <Text style={styles.broadcast}>{broadcastText}</Text>
          )}
        </View>

        {/* Home Score / Record */}
        <Text
          style={[
            status.isScheduled ? styles.teamRecord : styles.teamScore,
            getTeamStyle(true),
          ]}
        >
          {status.isScheduled ? homeTeam.record : safeScore.home.total}
        </Text>

        {/* Home Team */}
        <View style={styles.teamSection}>
          {homeTeam.hasPossession && (
            <Image
              source={dark ? FootballLight : Football}
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                position: "absolute",
                left: -70,
                top: 24,
              }}
            />
          )}
          <Image source={homeTeam.logo} style={styles.logo} />
          <Text style={[styles.teamName, { width: 100 }]}>{homeTeam.name}</Text>
        </View>
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
            color={isDark ? "#fff" : "#1d1d1d"}
          />
        </Pressable>
      </View>
    </TouchableOpacity>
  );
}

export default memo(NFLGameCard);
