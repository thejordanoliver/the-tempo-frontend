import NBAPlayoffsDark from "assets/Logos/NBAPlayoffs.png";
import NBAPlayoffsLight from "assets/Logos/NBAPlayoffsLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useGameDetails } from "hooks/NBAHooks/useGameDetails";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getCenteredX,
  getColCenter,
  getX,
  playoffBracketStyles,
} from "styles/PlayoffBraketStyles";
import { BracketMatchup, PlayoffBracket, PlayoffTeam } from "types/nba";
import { getBroadcastDisplay } from "utils/matchBroadcast";

const CARD_WIDTH = 176;
const ROUND2_WIDTH = 176;
const ROUND3_WIDTH = 176;
const FINALS_WIDTH = 176;
const CARD_HEIGHT = 142;
const ROUND2_HEIGHT = 142;
const ROUND3_HEIGHT = 142;
const FINALS_HEIGHT = 178;
const COL_WIDTH = 220;
const COL_GAP = 20;
const LABEL_WIDTH = 180;
const LABEL_TOP = 28;

const COLS = {
  WEST_R1: 0,
  WEST_R2: 1,
  WEST_R3: 2,
  FINALS: 3,
  EAST_R3: 4,
  EAST_R2: 5,
  EAST_R1: 6,
};

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const WEST_ROUND1_LAYOUTS: CardLayout[] = [
  { x: getX(COLS.WEST_R1), y: 84, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.WEST_R1), y: 254, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.WEST_R1), y: 424, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.WEST_R1), y: 594, width: CARD_WIDTH, height: CARD_HEIGHT },
];

const WEST_ROUND2_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.WEST_R2, ROUND2_WIDTH),
    y: 172,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
  {
    x: getCenteredX(COLS.WEST_R2, ROUND2_WIDTH),
    y: 512,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
];

const WEST_ROUND3_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.WEST_R3, ROUND3_WIDTH),
    y: 344,
    width: ROUND3_WIDTH,
    height: ROUND3_HEIGHT,
  },
];

const EAST_ROUND3_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.EAST_R3, ROUND3_WIDTH),
    y: 344,
    width: ROUND3_WIDTH,
    height: ROUND3_HEIGHT,
  },
];

const EAST_ROUND2_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.EAST_R2, ROUND2_WIDTH),
    y: 172,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
  {
    x: getCenteredX(COLS.EAST_R2, ROUND2_WIDTH),
    y: 512,
    width: ROUND2_WIDTH,
    height: ROUND2_HEIGHT,
  },
];

const EAST_ROUND1_LAYOUTS: CardLayout[] = [
  { x: getX(COLS.EAST_R1), y: 84, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.EAST_R1), y: 254, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.EAST_R1), y: 424, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.EAST_R1), y: 594, width: CARD_WIDTH, height: CARD_HEIGHT },
];

const FINALS_LAYOUT: CardLayout = {
  x: getCenteredX(COLS.FINALS, FINALS_WIDTH),
  y: 322,
  width: FINALS_WIDTH,
  height: FINALS_HEIGHT,
};

const centerY = (layout?: CardLayout) =>
  layout ? layout.y + layout.height / 2 : 0;
const rightX = (layout: CardLayout) => layout.x + layout.width;
const bottomTeamId = (matchup: BracketMatchup) =>
  matchup.bottomTeam?.id?.toString() ?? "";
const topTeamId = (matchup: BracketMatchup) =>
  matchup.topTeam?.id?.toString() ?? "";

const getSeriesRecord = (matchup: BracketMatchup) => {
  const topWins = matchup.wins[topTeamId(matchup)] ?? 0;
  const bottomWins = matchup.wins[bottomTeamId(matchup)] ?? 0;
  return { topWins, bottomWins };
};
const getSeriesLeader = (matchup: BracketMatchup) => {
  const leader = matchup.leader;
  return { leader };
};

const isGameLive = (game: BracketMatchup["games"][number]) => {
  if (game.status.short === 2) return true;

  const normalizedStatus = game.status.long.trim().toLowerCase();
  return !["scheduled", "finished"].includes(normalizedStatus);
};

const getLiveGame = (matchup: BracketMatchup) =>
  matchup.games.find((game) => isGameLive(game));

const getTeamGamePoints = (
  game: BracketMatchup["games"][number],
  teamId?: number,
) => {
  if (!teamId) return 0;
  if (game.teams.home.id === teamId) return game.scores.home.points ?? 0;
  if (game.teams.visitors.id === teamId)
    return game.scores.visitors.points ?? 0;
  return 0;
};

const formatQuarter = (period: number) => {
  if (period === 1) return "1st";
  if (period === 2) return "2nd";
  if (period === 3) return "3rd";
  if (period === 4) return "4th";
};

const getLiveGameStatus = (
  game: BracketMatchup["games"][number],
  isDark: boolean,
) => {
  const styles = playoffBracketStyles(isDark);
  const status = game.periods.current || 0;
  const halftime = game.status.halftime;
  const clock = game.status.clock?.trim();
  const isEndOfPeriod = game.periods.endOfPeriod;
  const period = formatQuarter(status);

  if (isEndOfPeriod === true) {
    return (
      <View style={styles.statusWrapper}>
        <Text style={styles.clock}>{`End of ${period}`}</Text>
      </View>
    );
  }
  if (halftime === true) {
    return (
      <View style={styles.statusWrapper}>
        <Text style={styles.clock}>Halftime</Text>
      </View>
    );
  }
  if (!clock || clock === "0.0") {
    return status;
  }

  return (
    <View style={styles.statusWrapper}>
      <Text style={styles.period}>{period}</Text>
      <View style={styles.statusDivder} />
      <Text style={styles.clock}>{clock}</Text>
    </View>
  );
};

const getFooterLabel = (matchup: BracketMatchup) => {
  const { topWins, bottomWins } = getSeriesRecord(matchup);
  const { leader } = getSeriesLeader(matchup);
  const teamName = getNBATeam(leader ?? 0)?.code;
  if (topWins || bottomWins) {
    return `${teamName} leads ${topWins}-${bottomWins}`;
  }

  return "Best of 7";
};

const getTeamStatus = (isTop: boolean, topWins: number, bottomWins: number) => {
  if (topWins === bottomWins) return "tied";

  if (isTop) return topWins > bottomWins ? "winner" : "loser";

  return bottomWins > topWins ? "winner" : "loser";
};

const TeamRow = ({
  team,
  wins,
  score,
  status,
  isDark,
}: {
  team?: PlayoffTeam;
  wins: number;
  score: number | null;
  status: "winner" | "loser" | "tied";
  isDark: boolean;
}) => {
  const styles = playoffBracketStyles(isDark);
  const teamId = team?.id ?? 0;
  const teamLogo = getTeamLogo(teamId, isDark);
  const teamData = getNBATeam(teamId);
  const teamName = teamData?.code ?? "TBD";
  const getTeamCodeColor = () => {
    if (!team) return Colors.midTone;

    if (status === "loser") return Colors.midTone;

    return isDark ? Colors.white : Colors.black;
  };

  return (
    <View style={styles.teamRow}>
      <Text
        style={[
          styles.seedText,
          {
            color: team
              ? isDark
                ? Colors.white
                : Colors.black
              : Colors.midTone,
          },
        ]}
      >
        {team?.seed ?? "-"}
      </Text>
      <Image source={teamLogo} style={styles.teamLogo} resizeMode="contain" />
      <Text
        numberOfLines={1}
        style={[styles.teamCode, { color: getTeamCodeColor() }]}
      >
        {teamName}
      </Text>
      {score && (
        <View style={styles.winsBadge}>
          <Text numberOfLines={1} style={styles.score}>
            {score}
          </Text>
        </View>
      )}
      {!score && (
        <View
          style={[
            styles.winsBadge,
            {
              backgroundColor: status === "winner" ? Colors.light.gold : "",
            },
          ]}
        >
          <Text
            style={[
              styles.winsText,
              {
                color:
                  status === "winner"
                    ? Colors.black
                    : isDark
                      ? Colors.white
                      : Colors.black,
              },
            ]}
          >
            {team ? wins : "-"}
          </Text>
        </View>
      )}
    </View>
  );
};

const MatchupCard = ({
  matchup,
  layout,
  isDark,
  finals = false,
}: {
  matchup: BracketMatchup;
  layout: CardLayout;
  isDark: boolean;
  finals?: boolean;
}) => {
  const styles = playoffBracketStyles(isDark);
  const { topWins, bottomWins } = getSeriesRecord(matchup);
  const topStatus = getTeamStatus(true, topWins, bottomWins);
  const bottomStatus = getTeamStatus(false, topWins, bottomWins);
  const liveGame = getLiveGame(matchup);
  const liveTopPoints = liveGame
    ? getTeamGamePoints(liveGame, matchup.topTeam?.id)
    : null;
  const liveBottomPoints = liveGame
    ? getTeamGamePoints(liveGame, matchup.bottomTeam?.id)
    : null;

  const topTeamData = getNBATeam(matchup?.topTeam?.id ?? 0);
  const bottomTeamData = getNBATeam(matchup?.bottomTeam?.id ?? 0);

  const topTeamEspnId = String(topTeamData?.espnID);
  const bottomTeamEspnId = String(bottomTeamData?.espnID ?? 0);
  const gameDateObj = useMemo(() => {
    if (!liveGame?.date.start) return new Date(); // fallback to now
    const d = new Date(liveGame?.date.start);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [liveGame?.date.start]);

  const gameDate = useMemo(
    () => gameDateObj?.toISOString().split("T")[0],
    [gameDateObj],
  );
  const { details } = useGameDetails(
    "nba",
    topTeamEspnId,
    bottomTeamEspnId,
    gameDate,
  );

  const broadcast = getBroadcastDisplay(details?.broadcasts);

  return (
    <View
      style={[
        styles.cardShell,
        finals ? styles.finalsShell : null,
        {
          left: layout.x,
          top: layout.y,
          width: layout.width,
          height: layout.height,
          borderColor:
            finals && isDark
              ? Colors.dark.gold
              : finals
                ? Colors.light.gold
                : isDark
                  ? Colors.darkGray
                  : Colors.lightGray,
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
        },
      ]}
    >
      <TeamRow
        team={matchup.topTeam}
        wins={topWins}
        score={liveTopPoints}
        status={topStatus}
        isDark={isDark}
      />
      <View style={styles.divider} />

      <TeamRow
        team={matchup.bottomTeam}
        wins={bottomWins}
        score={liveBottomPoints}
        status={bottomStatus}
        isDark={isDark}
      />
      <View style={styles.statusContainer}>
        <Text style={styles.broadcast}>{broadcast}</Text>
        {!liveGame && (
          <Text style={styles.footerText}>{getFooterLabel(matchup)}</Text>
        )}
        {liveGame && (
          <View>
            <Text style={styles.clock}>
              {getLiveGameStatus(liveGame, isDark)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ConnectorLayer = ({ isDark }: { isDark: boolean }) => {
  const lineColor = isDark ? Colors.darkGray : Colors.lightGray;

  const renderLeftPair = (source: CardLayout[], target: CardLayout[]) =>
    source.map((layout, index) => {
      const targetIndex = Math.floor(index / 2);
      const targetLayout = target[targetIndex];
      const nextLayout = source[index + 1];
      const styles = playoffBracketStyles(isDark);
      // ❌ Skip anything invalid OR non-pair starters
      if (!layout || !targetLayout || index % 2 !== 0 || !nextLayout)
        return null;

      const midX = rightX(layout) + (targetLayout.x - rightX(layout)) / 2;

      return (
        <View key={`left-${index}`}>
          {/* Top horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: rightX(layout),
                top: centerY(layout),
                width: midX - rightX(layout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Bottom horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: rightX(nextLayout),
                top: centerY(nextLayout),
                width: midX - rightX(nextLayout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Vertical join */}
          <View
            style={[
              styles.connectorV,
              {
                left: midX,
                top: centerY(layout),
                height: centerY(nextLayout) - centerY(layout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* To next round */}
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(targetLayout),
                width: targetLayout.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />
        </View>
      );
    });

  const renderRightPair = (source: CardLayout[], target: CardLayout[]) =>
    source.map((layout, index) => {
      const styles = playoffBracketStyles(isDark);
      const targetIndex = Math.floor(index / 2);
      const targetLayout = target[targetIndex];
      const nextLayout = source[index + 1];

      // ❌ Skip invalid / non-pairs
      if (!layout || !targetLayout || index % 2 !== 0 || !nextLayout)
        return null;

      const targetRight = rightX(targetLayout);
      const midX = targetRight + (layout.x - targetRight) / 2;

      return (
        <View key={`right-${index}`}>
          {/* Top horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(layout),
                width: layout.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Bottom horizontal */}
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(nextLayout),
                width: nextLayout.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* Vertical join */}
          <View
            style={[
              styles.connectorV,
              {
                left: midX,
                top: centerY(layout),
                height: centerY(nextLayout) - centerY(layout),
                backgroundColor: lineColor,
              },
            ]}
          />

          {/* To next round */}
          <View
            style={[
              styles.connectorH,
              {
                left: targetRight,
                top: centerY(targetLayout),
                width: midX - targetRight,
                backgroundColor: lineColor,
              },
            ]}
          />
        </View>
      );
    });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {renderLeftPair(WEST_ROUND1_LAYOUTS, WEST_ROUND2_LAYOUTS)}
      {renderLeftPair(WEST_ROUND2_LAYOUTS, WEST_ROUND3_LAYOUTS)}
      {renderLeftPair(WEST_ROUND3_LAYOUTS, [FINALS_LAYOUT])}
      {renderRightPair(EAST_ROUND1_LAYOUTS, EAST_ROUND2_LAYOUTS)}
      {renderRightPair(EAST_ROUND2_LAYOUTS, EAST_ROUND3_LAYOUTS)}
      {renderRightPair(EAST_ROUND3_LAYOUTS, [FINALS_LAYOUT])}
    </View>
  );
};

const RoundLabel = ({
  title,
  x,
  isDark,
}: {
  title: string;
  x: number;
  isDark: boolean;
}) => {
  const styles = playoffBracketStyles(isDark);

  return (
    <Text
      style={[
        styles.roundLabel,
        {
          top: LABEL_TOP,
          left: x - LABEL_WIDTH / 2,
          width: LABEL_WIDTH,
          textAlign: "center",
        },
      ]}
    >
      {title}
    </Text>
  );
};

export function NBAPlayoffBracket({
  bracket,
  loading,
  error,
}: {
  bracket: PlayoffBracket | null;
  loading: boolean;
  error: string | null;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => playoffBracketStyles(isDark), [isDark]);
  const global = globalStyles(isDark);

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text style={global.errorText}>{error}</Text>;
  }

  if (!bracket) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No playoff bracket available.</Text>
        <Text style={global.emptySubText}>
          Playoff series will appear here once the postseason data is available.
        </Text>
      </View>
    );
  }

  const logoSource = isDark ? NBAPlayoffsLight : NBAPlayoffsDark;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.canvas}>
        <Text style={[styles.sideLabel, styles.westLabel]}>WEST</Text>
        <Text style={[styles.sideLabel, styles.eastLabel]}>EAST</Text>

        <RoundLabel
          title="FIRST ROUND"
          x={getColCenter(COLS.WEST_R1)}
          isDark={isDark}
        />

        <RoundLabel
          title="CONFERENCE SEMIFINALS"
          x={getColCenter(COLS.WEST_R2)}
          isDark={isDark}
        />

        <RoundLabel
          title="CONFERENCE FINALS"
          x={getColCenter(COLS.WEST_R3)}
          isDark={isDark}
        />

        <RoundLabel
          title="NBA FINALS"
          x={getColCenter(COLS.FINALS)}
          isDark={isDark}
        />

        <RoundLabel
          title="CONFERENCE FINALS"
          x={getColCenter(COLS.EAST_R3)}
          isDark={isDark}
        />

        <RoundLabel
          title="CONFERENCE SEMIFINALS"
          x={getColCenter(COLS.EAST_R2)}
          isDark={isDark}
        />

        <RoundLabel
          title="FIRST ROUND"
          x={getColCenter(COLS.EAST_R1)}
          isDark={isDark}
        />
        <Image
          source={logoSource}
          style={styles.playoffsLogo}
          resizeMode="contain"
        />

        <ConnectorLayer isDark={isDark} />

        {bracket.west[0].map((matchup, index) => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            layout={WEST_ROUND1_LAYOUTS[index]}
            isDark={isDark}
          />
        ))}
        {bracket.west[1].map((matchup, index) => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            layout={WEST_ROUND2_LAYOUTS[index]}
            isDark={isDark}
          />
        ))}
        {bracket.west[2].map((matchup, index) => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            layout={WEST_ROUND3_LAYOUTS[index]}
            isDark={isDark}
          />
        ))}
        {bracket.east[2].map((matchup, index) => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            layout={EAST_ROUND3_LAYOUTS[index]}
            isDark={isDark}
          />
        ))}
        {bracket.east[1].map((matchup, index) => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            layout={EAST_ROUND2_LAYOUTS[index]}
            isDark={isDark}
          />
        ))}
        {bracket.east[0].map((matchup, index) => (
          <MatchupCard
            key={matchup.id}
            matchup={matchup}
            layout={EAST_ROUND1_LAYOUTS[index]}
            isDark={isDark}
          />
        ))}
        {bracket.finals ? (
          <MatchupCard
            matchup={bracket.finals}
            layout={FINALS_LAYOUT}
            isDark={isDark}
            finals={true}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}
