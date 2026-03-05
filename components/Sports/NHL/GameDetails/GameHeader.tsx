import { SeriesSummary } from "hooks/MLBHooks/useBaseballGameDetails";
import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { NHLTeam } from "types/types";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  home: NHLTeam;
  away: NHLTeam;
  isPostSeason: boolean;
  seriesSummary: string;
  rankHome?: string;
  rankAway?: string;
  homeScore: number;
  awayScore: number;
  inning?: string;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string | null;
  time?: string;
  networkString?: string;
  refreshTick?: number;
  homeBonusState?: string | null;
  awayBonusState?: string | null;
  homeTimeouts?: number;
  awayTimeouts?: number;
  homeRecord?: string;
  awayRecord?: string;
  gameStatusDescription: string;
  gameStatusDetail: string;
};

export default function GameHeader({
  headlineText,
  home,
  away,
  isPostSeason,
  seriesSummary,
  rankHome,
  rankAway,
  homeScore,
  awayScore,
  gameStatusDetail,
  gameStatusDescription,
  inning,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  homeTimeouts = 0,
  awayTimeouts = 0,
  refreshTick = 0,
  homeRecord,
  awayRecord,
}: Props) {
  const styles = gameHeaderStyles(isDark);

  const awayIsWinner =
    gameStatusDescription === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    gameStatusDescription === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

function renderHeadline(
  seriesSummary: string | undefined,
  headline?: string | null,
) {
  if (isPostSeason) {
    return (
      <View style={styles.seriesContainer}>
        <Text style={styles.seriesText}>{headline}</Text>
        <View style={styles.divider} />
        <Text style={styles.seriesText}>{seriesSummary}</Text>
      </View>
    );
  }

  return (
    <View style={styles.headlineContainer}>
      <Text style={styles.headlineText}>{headline}</Text>
    </View>
  );
}


  return (
    <View style={styles.container}>
   {renderHeadline(seriesSummary, headlineText)}

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          key={`away-${refreshTick}`}
          team={{
            id: away.id,
            code: away.code,
            name: away.name,
            record: awayRecord,
            logo:
              isDark && away.logoLight
                ? away.logoLight
                : away.logo ||
                  require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          rank={rankAway}
          score={awayScore}
          isWinner={awayIsWinner}
          timeouts={awayTimeouts}
          gameStatusDescription={gameStatusDescription}
        />

        <View>
          {/* Game Info */}
          <GameInfo
            key={`gameinfo-${refreshTick}`}
            gameStatusDescription={gameStatusDescription}
            gameStatusDetail={gameStatusDetail}
            date={formattedDate || new Date().toISOString()}
            time={time}
            inning={inning}
            isDark={isDark}
            broadcastNetworks={networkString}
          />
        </View>

        {/* Home Team Row */}
        <TeamRow
          key={`home-${refreshTick}`}
          team={{
            id: home.id,
            code: home.code,
            name: home.name,
            record: homeRecord,
            logo:
              isDark && home.logoLight
                ? home.logoLight
                : home.logo ||
                  require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          rank={rankHome}
          isHome
          score={homeScore}
          isWinner={homeIsWinner}
          timeouts={homeTimeouts}
          gameStatusDescription={gameStatusDescription}
        />
      </View>
    </View>
  );
}
