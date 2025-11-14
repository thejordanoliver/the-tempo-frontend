import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { useRouter } from "expo-router";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import React, { memo, useMemo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/GameSquareCard.styles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import {
  formatQuarter,
  getNFLGameStatus,
  getNFLTeamData,
  getTeamTextStyle,
  isSuperBowlGame,
  normalizeDisplayStatus,
} from "utils/nflGameCardUtils";
type Props = {
  game: any;
  isDark?: boolean;
};

function NFLGameSquareCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();

  const homeId = String(game?.teams?.home?.id);
  const awayId = String(game?.teams?.away?.id);

  // --- Game date ---
  const gameDate = useMemo(
    () =>
      game?.game?.date?.timestamp
        ? new Date(game.game.date.timestamp * 1000)
        : null,
    [game?.game?.date?.timestamp]
  );
  const gameDateStr = gameDate?.toISOString();

  // --- Records ---
  const { record: awayRecord } = useNFLTeamRecord(awayId);
  const { record: homeRecord } = useNFLTeamRecord(homeId);

  // --- Status ---
  const status = getNFLGameStatus(game);

  // --- Super Bowl ---
  const isSuperBowl = isSuperBowlGame(game, gameDate);

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

  // --- Teams ---
  const awayTeam = useMemo(
    () =>
      getNFLTeamData(
        String(awayId ?? ""),
        dark,
        awayRecord?.overall ?? "0-0",
        possessionTeamId
      ),
    [awayId, awayRecord?.overall, dark, possessionTeamId]
  );

  const homeTeam = useMemo(
    () =>
      getNFLTeamData(
        String(homeId ?? ""),
        dark,
        homeRecord?.overall ?? "0-0",
        possessionTeamId
      ),
    [homeId, homeRecord?.overall, dark, possessionTeamId]
  );

  // --- Broadcast ---
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

  // --- Display Status ---
  const displayStatus = normalizeDisplayStatus(
    gameStatusDescription ?? status.long ?? status.short ?? ""
  );

  // --- Date formatting ---
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
        <View style={styles.cardWrapper}>
          {/* Away */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image source={awayTeam.logo} style={styles.logo} />
              <Text style={styles.teamName}>{awayTeam.code}</Text>
              {awayTeam.hasPossession && (
                <Image
                  source={dark ? FootballLight : Football}
                  style={styles.footballIcon}
                />
              )}
            </View>
            <Text
              style={[
                status.isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(false),
              ]}
            >
              {status.isScheduled ? awayTeam.record : safeScore.away.total ?? 0}
            </Text>
          </View>

          {/* Home */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image source={homeTeam.logo} style={styles.logo} />
              <Text style={styles.teamName}>{homeTeam.code}</Text>
              {homeTeam.hasPossession && (
                <Image
                  source={dark ? FootballLight : Football}
                  style={styles.footballIcon}
                />
              )}
            </View>
            <Text
              style={[
                status.isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(true),
              ]}
            >
              {status.isScheduled ? homeTeam.record : safeScore.home.total ?? 0}
            </Text>
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.info}>
          {status.isScheduled && (
            <>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text style={styles.time}>{formattedTime}</Text>
            </>
          )}

          {status.isLive && (
            <>
              <Text style={styles.date}>{formatQuarter(period)}</Text>
              <Text style={styles.clock}>{displayClock}</Text>
            </>
          )}

          {status.isHalftime && (
            <Text style={styles.date}>{displayStatus}</Text>
          )}

          {status.isFinal && (
            <>
              <Text style={styles.finalText}>
                {status.wentOT ? "F/OT" : "Final"}
              </Text>
              <Text style={styles.dateFinal}>{formattedDate}</Text>
            </>
          )}

          {status.isCanceled && <Text style={styles.finalText}>Canceled</Text>}
          {status.isDelayed && <Text style={styles.finalText}>Delayed</Text>}

          <Text style={styles.broadcast}>{broadcastText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(NFLGameSquareCard);
