import { TeamRow } from "components/Sports/NFL/GameDetails/TeamRow";
import { getTeamLogo } from "constants/teamsCFB";
import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { GameCenterInfo } from "./GameCenterInfo";
type Props = {
  awayTeam: any;
  homeTeam: any;
  rankHome: number | undefined;
  rankAway: number | undefined;
  scores: any;
  possessionTeamId?: string;
  homeTimeouts?: number;
  awayTimeouts?: number;
  period?: string | undefined;
  displayClock?: string;
  downAndDistance?: string;
  isDark: boolean;
  homeRecord?: string;
  awayRecord?: string;
  formattedDate?: string; // ✅ new props
  formattedTime?: string; // ✅ new props
  broadcast?: string;
  headlineText?: string;
  gameStatusDescription: string;
  gameStatusShortDetail?: string;
  redzone: boolean;
};

export default function CFBGameHeader({
  awayTeam,
  homeTeam,
  rankHome,
  rankAway,
  scores,
  possessionTeamId,
  homeTimeouts = 0,
  awayTimeouts = 0,
  gameStatusDescription,
  gameStatusShortDetail,
  period,
  displayClock,
  downAndDistance,
  isDark,
  homeRecord,
  awayRecord,
  broadcast = "",
  headlineText,
  formattedDate = "", // default
  formattedTime = "", // default
  redzone = false,
}: Props) {
  const styles = gameHeaderStyles(isDark);

  return (
    <View style={styles.container}>
      {/* Headline (optional) */}
      {headlineText ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText}>{headlineText}</Text>
        </View>
      ) : null}
      <View style={styles.teamsContainer}>
        <TeamRow
          team={{
            id: String(awayTeam.id),
            espnID: String(awayTeam.espnID),
            shortName: awayTeam.code,
            name: awayTeam.name,
            logo: getTeamLogo(awayTeam.id, isDark),
            record: awayRecord ?? "0-0",
          }}
          rank={rankAway ? Number(rankAway) : undefined}
          isDark={isDark}
          isHome={false}
          score={scores?.away?.total}
          opponentScore={scores?.home?.total}
          isWinner={scores?.away?.total > scores?.home?.total}
          gameStatusDescription={gameStatusDescription}
          possessionTeamId={possessionTeamId}
          timeouts={awayTimeouts}
          league="cfb"
        />

        <View>
          <GameCenterInfo
            date={formattedDate}
            time={formattedTime}
            period={period}
            clock={displayClock}
            isDark={isDark}
            downAndDistance={downAndDistance}
            broadcast={broadcast}
            gameStatusDescription={gameStatusDescription ?? ""}
            gameStatusShortDetail={gameStatusShortDetail ?? ""}
            redzone={redzone}
          />
        </View>

        <TeamRow
          team={{
            id: String(homeTeam.id),
            espnID: String(homeTeam.espnID),
            shortName: homeTeam.code,
            name: homeTeam.name,
            logo: getTeamLogo(homeTeam.id, isDark),
            record: homeRecord ?? "0-0",
          }}
          rank={rankHome ? Number(rankHome) : undefined}
          isDark={isDark}
          isHome
          score={scores?.home?.total}
          opponentScore={scores?.away?.total}
          isWinner={scores?.home?.total > scores?.away?.total}
          gameStatusDescription={gameStatusDescription}
          possessionTeamId={possessionTeamId}
          timeouts={homeTimeouts}
          league="cfb"
        />
      </View>
    </View>
  );
}
