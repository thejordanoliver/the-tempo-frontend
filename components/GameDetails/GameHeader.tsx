import { TeamRecord } from "hooks/useTeamRecords";
import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";
import { Team } from "types/types";


type Props = {
  home: Team;
  away: Team;
  rankHome?: string;
  rankAway?: string;
  homeScore: number;
  awayScore: number;
  homeFoulsToGive?: number;
  awayFoulsToGive?: number;
  homeTimeouts?: number;
  awayTimeouts?: number;
  period?: string;
  displayClock?: string;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string;
  time?: string;
  networkString?: string;
  seriesSummary?: string;
  refreshTick?: number;
  homeRecord?: TeamRecord | string;
  awayRecord?: TeamRecord | string;
  halftime?: boolean;
  league?: "nba" | "cbb" | "wcbb";
  statusText?: string;
  gameStatusDetail :string;
  gameStatusDescription: string;
};

export default function GameHeader({
  headlineText,
  home,
  away,
  rankHome,
  rankAway,
  homeScore,
  homeFoulsToGive,
  awayFoulsToGive,
  awayScore,
  homeTimeouts = 0,
  awayTimeouts = 0,
  period,
  displayClock,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  seriesSummary,
  refreshTick = 0,
  homeRecord,
  awayRecord,
  halftime,
  league = "nba",
 gameStatusDetail,
  gameStatusDescription,
}: Props) {
  const styles = gameHeaderStyles(isDark);
  const isWomen = league === "wcbb";



  const awayIsWinner =
    gameStatusDescription === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    gameStatusDescription === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  return (
    <View style={styles.container}>
      {headlineText ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={2}>
            {headlineText}
          </Text>
        </View>
      ) : null}

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          key={`away-${refreshTick}`}
          team={{
            id: !isWomen ? away.id : undefined,
            wid: isWomen ? away.wid : undefined,
            code: away.code,
            name: away.name,
            record:
              typeof awayRecord === "object"
                ? awayRecord?.overall ?? away.record ?? "0-0"
                : awayRecord || away.record,
            logo:
              isDark && away.logoLight
                ? away.logoLight
                : away.logo ||
                  require("../../assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          foulsToGive={awayFoulsToGive}
          rank={rankAway}
          score={awayScore}
          isWinner={awayIsWinner}
          league={isWomen ? "wcbb" : league}
          timeouts={league === "nba" ? awayTimeouts : undefined}
          gameStatusDescription={gameStatusDescription}
        />

        {/* Game Info */}
        <GameInfo
          key={`gameinfo-${refreshTick}`}
          date={formattedDate || new Date().toISOString()}
          time={time}
          clock={halftime ? undefined : displayClock}
          period={period}
          isDark={isDark}
          broadcastNetworks={networkString}
          halftime={halftime}
          gameStatusDetail={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
        />

        {/* Home Team Row */}
        <TeamRow
          key={`home-${refreshTick}`}
          team={{
            id: !isWomen ? home.id : undefined,
            wid: isWomen ? home.wid : undefined,
            code: home.code,
            name: home.name,
            record:
              typeof homeRecord === "object"
                ? homeRecord?.overall ?? home.record ?? "0-0"
                : homeRecord || home.record,
            logo:
              isDark && home.logoLight
                ? home.logoLight
                : home.logo ||
                  require("../../assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          rank={rankHome}
          isHome
          score={homeScore}
          foulsToGive={homeFoulsToGive}
          isWinner={homeIsWinner}
          league={isWomen ? "wcbb" : league}
          timeouts={league === "nba" ? homeTimeouts : undefined}
          gameStatusDescription={gameStatusDescription}
        />
      </View>
    </View>
  );
}
