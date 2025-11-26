import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { useRouter } from "expo-router";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossession";
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
import { getStyles } from "styles/GamecardStyles/StackedGameCard.styles";
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


type Props = {
  game: any; // TODO: replace with proper Game type
  isDark?: boolean;
};

function NFLStackedGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

    const awayTeamEspnID = awayId;
  const homeTeamEspnID = homeId;


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
      ? useFootballGamePossession(
          "nfl",
         homeTeamEspnID,
         awayTeamEspnID,
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
    gameStatusShortDetail,
    downDistanceText,
    period,
    possessionText,
    gameStatusDescription,
    score,
  } = possession;

  const safeScore = score ?? { home: { total: 0 }, away: { total: 0 } };

  const normalizeScoreSide = (side: any) => {
  if (typeof side === "number") return { total: side };
  if (typeof side?.total === "number") return { total: side.total };
  return { total: 0 };
};

const normalizedAwayScore = normalizeScoreSide(safeScore.away);
const normalizedHomeScore = normalizeScoreSide(safeScore.home);

  const showStatusDetail =
    gameStatusShortDetail &&
    (gameStatusShortDetail.toLowerCase().includes("halftime") ||
      gameStatusShortDetail.toLowerCase().includes("end of"));

  // --- Display Status ---
  const displayStatus = normalizeDisplayStatus(
    gameStatusDescription ?? status.long ?? status.short ?? ""
  );

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
    Number(homeTeam?.espnID),
    Number(awayTeam?.espnID),
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
            <Text
              style={[
                status.isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(false),
              ]}
            >
              {status.isScheduled ? awayTeam.record : normalizedAwayScore.total ?? 0}
            </Text>
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
            <Text
              style={[
                status.isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(true),
              ]}
            >
              {status.isScheduled ? homeTeam.record : normalizedHomeScore.total ?? 0}
            </Text>
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.info}>
          {status.isScheduled && (
            <>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text
                style={[
                  styles.time,
                  { color: dark ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.6)" },
                ]}
              >
                {formattedTime}
              </Text>
            </>
          )}

          {status.isLive && (
            <>
              <Text style={styles.date}>{formatQuarter(period)}</Text>
               {showStatusDetail ? (
                <Text style={styles.date}>{gameStatusShortDetail}</Text>
              ) : (
                <Text style={styles.clock}>{displayClock}</Text>
              )}
            </>
          )}

          {status.isHalftime && <Text style={styles.date}>Halftime</Text>}

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

export default memo(NFLStackedGameCard);
