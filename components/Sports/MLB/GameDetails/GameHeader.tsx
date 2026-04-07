import { SeriesSummary } from "hooks/MLBHooks/useBaseballGameDetails";
import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { MLBTeam } from "types/baseball";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  seriesSummary: SeriesSummary | undefined;
  seasonState?: string | null;
  home: MLBTeam;
  away: MLBTeam;
  rankHome?: string;
  rankAway?: string;
  homeScore: number;
  awayScore: number;
  inning?: string;
  isDark: boolean;
  isTopInning: boolean;
  formattedDate?: string;
  headlineText?: string | null;
  outs?: number;
  time?: string;
  networkString?: string;
  refreshTick?: number;
  homeRecord?: string;
  awayRecord?: string;
  gameStatusDescription: string;
  gameStatusDetail: string;
  league?: "mlb";
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
};

export default function GameHeader({
  seriesSummary,
  isTopInning,
  headlineText,
  home,
  away,
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
  refreshTick = 0,
  homeRecord,
  awayRecord,
  league = "mlb", // ✅ default league
  outs,
  bases,
}: Props) {
  const styles = gameHeaderStyles(isDark);

  const awayIsWinner =
    gameStatusDescription === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    gameStatusDescription === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  function renderHeadline(
    seriesSummary: SeriesSummary | undefined,
    headline?: string | null,
  ) {
    if (seriesSummary?.type === "playoff") {
      return (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText}>
            {headline} {} <View style={styles.divider} /> {}{" "}
            {seriesSummary.summary}
          </Text>
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
          gameStatusDescription={gameStatusDescription}
          league={league}
        />

        <GameInfo
          key={`gameinfo-${refreshTick}`}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
          date={formattedDate || new Date().toISOString()}
          time={time}
          inning={inning}
          isDark={isDark}
          broadcast={networkString}
          isTopInning={isTopInning}
          outs={outs ?? 0}
          bases={bases}
        />

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
          gameStatusDescription={gameStatusDescription}
          league={league}
        />
      </View>
    </View>
  );
}
