import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { Team } from "types/nfl";
import { NFLGameCenterInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  home: Team;
  away: Team;
  awayLogo: any;
  homeLogo: any;
  homeScore: number;
  awayScore: number;
  possessionTeamId?: number | null;
  homeTimeouts?: number | null;
  awayTimeouts?: number | null;
  period?: number;
  displayClock?: string;
  possessionText?: string | null;
  isDark: boolean;
  homeRecord?: string;
  awayRecord?: string;
  formattedDate?: string;
  formattedTime?: string;
  broadcast?: string;
  headlineText?: string;
  gameStatusShortDetail?: string;
  gameStatusDescription?: string;
  league: "nfl" | "cfb";
  redzone: boolean | undefined;
};

export default function GameHeader({
  home,
  away,
  awayLogo,
  homeLogo,
  homeScore,
  awayScore,
  possessionTeamId,
  homeTimeouts = 0,
  awayTimeouts = 0,
  period,
  displayClock,
  possessionText,
  isDark,
  homeRecord,
  awayRecord,
  broadcast = "",
  formattedDate = "",
  formattedTime = "",
  headlineText,
  gameStatusShortDetail,
  gameStatusDescription,
  league,
  redzone = false,
}: Props) {
  const styles = gameHeaderStyles(isDark);

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
        {/* Away Team */}
        <TeamRow
          key={`away`}
          team={{
            id: away.id,
            code: away.code,
            name: away.name,
            record: awayRecord,
            logo: awayLogo,
          }}
          isDark={isDark}
          isHome={false}
          score={awayScore}
          opponentScore={homeScore}
          isWinner={awayScore > homeScore}
          possessionTeamId={possessionTeamId}
          timeouts={awayTimeouts}
          league={league}
          gameStatusDescription={gameStatusDescription}
        />

        {/* Game Info */}
        <NFLGameCenterInfo
          date={formattedDate}
          time={formattedTime}
          period={period}
          clock={displayClock}
          isDark={isDark}
          broadcast={broadcast}
          downAndDistance={possessionText}
          gameStatusShortDetail={gameStatusShortDetail}
          gameStatusDescription={gameStatusDescription}
          redzone={redzone}
        />

        {/* Home Team */}
        <TeamRow
          key={`home`}
          team={{
            id: home.id,
            code: home.code,
            name: home.name,
            record: homeRecord,
            logo: homeLogo,
          }}
          isDark={isDark}
          isHome
          score={homeScore}
          opponentScore={awayScore}
          isWinner={homeScore > awayScore}
          possessionTeamId={possessionTeamId}
          timeouts={homeTimeouts}
          league={league}
          gameStatusDescription={gameStatusDescription}
        />
      </View>
    </View>
  );
}
