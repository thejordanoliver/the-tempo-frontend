import type { BracketApiResponse } from "@/types/football/football";
import NFLPlayoffsLogo from "assets/Football/NFL_Logos/NFLPlayoffsLogo.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { nflPlayoffBracketStyles } from "styles/NFLPlayoffBracketStyles";

/* ---------------- TYPES ---------------- */

type PlayoffGame = BracketApiResponse["games"][number];
type PlayoffTeam = PlayoffGame["home"];
type Conference = "AFC" | "NFC";

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ConnectorTarget = {
  source?: CardLayout;
  target?: CardLayout;
};

type NFLPlayoffBracketProps = {
  bracket: BracketApiResponse | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
};

/* ---------------- LAYOUT CONSTANTS ---------------- */

const CARD_WIDTH = 176;
const CARD_HEIGHT = 142;

const FINALS_WIDTH = 176;
const FINALS_HEIGHT = 178;

const COL_WIDTH = 220;
const COL_GAP = 20;

const LABEL_WIDTH = 180;
const LABEL_TOP = 28;

const COLS = {
  AFC_R1: 0,
  AFC_R2: 1,
  AFC_R3: 2,
  FINALS: 3,
  NFC_R3: 4,
  NFC_R2: 5,
  NFC_R1: 6,
} as const;

/*
 * Fallback connection layout for games whose teams
 * have not been determined yet.
 */
const WILD_CARD_TO_DIVISIONAL: Record<number, number> = {
  0: 0,
  1: 1,
  2: 1,
};

export const getX = (column: number) =>
  column * (COL_WIDTH + COL_GAP);

export const CANVAS_WIDTH =
  getX(COLS.NFC_R1) + CARD_WIDTH;

export const CANVAS_HEIGHT = 840;

export const SIDE_LABEL_TOP =
  CANVAS_HEIGHT / 2 - 22;

export const getColCenter = (column: number) =>
  getX(column) + CARD_WIDTH / 2;

export const getCenteredX = (
  column: number,
  width: number,
) => getColCenter(column) - width / 2;

const centerY = (layout?: CardLayout) =>
  layout ? layout.y + layout.height / 2 : 0;

/* ---------------- DATA HELPERS ---------------- */

const sortGamesByDate = (
  games: PlayoffGame[],
): PlayoffGame[] => {
  return [...games].sort((first, second) => {
    const firstTime =
      first.timestamp ??
      new Date(first.date).getTime();

    const secondTime =
      second.timestamp ??
      new Date(second.date).getTime();

    if (firstTime !== secondTime) {
      return firstTime - secondTime;
    }

    return Number(first.id) - Number(second.id);
  });
};

const getGamesByWeek = (
  playoffData: BracketApiResponse | null,
  weekNumber: number,
): PlayoffGame[] => {
  if (!playoffData) {
    return [];
  }

  const matchingGroup = playoffData.groups?.find(
    (group) => group.week?.number === weekNumber,
  );

  if (matchingGroup?.games?.length) {
    return matchingGroup.games;
  }

  return (
    playoffData.games?.filter(
      (game) => game.week?.number === weekNumber,
    ) ?? []
  );
};

const getConference = (
  game: PlayoffGame,
): Conference | null => {
  const headline =
    game.headline?.trim().toUpperCase() ?? "";

  if (headline.includes("AFC")) {
    return "AFC";
  }

  if (headline.includes("NFC")) {
    return "NFC";
  }

  return null;
};

const getRoundConferenceGames = (
  games: PlayoffGame[],
  conference: Conference,
  gamesPerConference: number,
): PlayoffGame[] => {
  const sortedGames = sortGamesByDate(games);

  const explicitlyTaggedGames = sortedGames.filter(
    (game) => getConference(game) === conference,
  );

  /*
   * Completed playoff games normally contain AFC or NFC
   * in the headline.
   */
  if (explicitlyTaggedGames.length > 0) {
    return explicitlyTaggedGames.slice(
      0,
      gamesPerConference,
    );
  }

  /*
   * Future Wild Card and Divisional games may not identify
   * their conferences yet. Split them evenly so that all
   * TBD games still appear.
   */
  const startingIndex =
    conference === "AFC"
      ? 0
      : gamesPerConference;

  return sortedGames.slice(
    startingIndex,
    startingIndex + gamesPerConference,
  );
};

const isTbdTeam = (
  team: PlayoffTeam | null | undefined,
): boolean => {
  if (!team) {
    return true;
  }

  const id = Number(team.id);
  const espnId = Number(team.espnId);

  const code =
    team.code?.trim().toUpperCase() ?? "";

  const name =
    team.name?.trim().toUpperCase() ?? "";

  return (
    !Number.isFinite(id) ||
    id <= 0 ||
    !Number.isFinite(espnId) ||
    espnId <= 0 ||
    code === "TBD" ||
    name === "TBD"
  );
};

const getWinnerId = (
  game?: PlayoffGame,
): number | null => {
  if (!game) {
    return null;
  }

  if (
    game.home?.winner === true &&
    !isTbdTeam(game.home)
  ) {
    return Number(game.home.id);
  }

  if (
    game.away?.winner === true &&
    !isTbdTeam(game.away)
  ) {
    return Number(game.away.id);
  }

  return null;
};

const gameContainsTeam = (
  game: PlayoffGame,
  teamId: number,
): boolean => {
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return false;
  }

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);

  return (
    homeId === teamId ||
    awayId === teamId
  );
};

const findNextRoundIndex = (
  sourceGame: PlayoffGame,
  nextRoundGames: PlayoffGame[],
): number | null => {
  const winnerId = getWinnerId(sourceGame);

  if (winnerId !== null) {
    const winnerIndex = nextRoundGames.findIndex(
      (game) =>
        gameContainsTeam(game, winnerId),
    );

    if (winnerIndex >= 0) {
      return winnerIndex;
    }
  }

  /*
   * Fallback for games that have real teams but have not
   * been completed. Placeholder IDs are excluded.
   */
  const sourceTeamIds = [
    Number(sourceGame.home?.id),
    Number(sourceGame.away?.id),
  ].filter(
    (id) =>
      Number.isFinite(id) && id > 0,
  );

  const matchingIndex =
    nextRoundGames.findIndex((game) =>
      sourceTeamIds.some((teamId) =>
        gameContainsTeam(game, teamId),
      ),
    );

  return matchingIndex >= 0
    ? matchingIndex
    : null;
};

/*
 * Orders Wild Card cards according to the Divisional game
 * they feed into.
 *
 * This prevents lines from crossing when the chronological
 * game order does not match the visual bracket order.
 */
const orderWildCardGamesForBracket = (
  wildCardGames: PlayoffGame[],
  divisionalGames: PlayoffGame[],
): PlayoffGame[] => {
  const gamesWithTargets = wildCardGames.map(
    (game, originalIndex) => ({
      game,
      originalIndex,
      targetIndex: findNextRoundIndex(
        game,
        divisionalGames,
      ),
    }),
  );

  const matchedGames = gamesWithTargets
    .filter(
      (
        item,
      ): item is typeof item & {
        targetIndex: number;
      } => item.targetIndex !== null,
    )
    .sort((first, second) => {
      if (
        first.targetIndex !==
        second.targetIndex
      ) {
        return (
          first.targetIndex -
          second.targetIndex
        );
      }

      return (
        first.originalIndex -
        second.originalIndex
      );
    });

  const unmatchedGames = gamesWithTargets
    .filter(
      (item) =>
        item.targetIndex === null,
    )
    .sort(
      (first, second) =>
        first.originalIndex -
        second.originalIndex,
    );

  return [
    ...matchedGames,
    ...unmatchedGames,
  ].map((item) => item.game);
};

/* ---------------- TEAM ROW ---------------- */

const getTeamLogoSource = (
  team: PlayoffTeam | null | undefined,
  isDark: boolean,
): ImageSourcePropType | null => {
  if (isTbdTeam(team)) {
    return null;
  }

  if (team?.logo) {
    return {
      uri: team.logo,
    };
  }

  return (
    getNFLTeamLogo(
      Number(team?.id ?? 0),
      isDark,
    ) ?? null
  );
};

const TeamRow = ({
  team,
  gameCompleted,
  isDark,
}: {
  team?: PlayoffTeam | null;
  gameCompleted: boolean;
  isDark: boolean;
}) => {
  const styles =
    nflPlayoffBracketStyles(isDark);

  const isTbd = isTbdTeam(team);

  const isWinner =
    gameCompleted &&
    !isTbd &&
    team?.winner === true;

  const isLoser =
    gameCompleted &&
    !isTbd &&
    team?.winner === false;

  const opacity =
    isTbd || isLoser ? 0.5 : 1;

  const logoSource =
    getTeamLogoSource(team, isDark);

  const teamCode = isTbd
    ? "TBD"
    : team?.code?.trim() || "TBD";

  const seed =
    isTbd ? "-" : team?.rank ?? "-";

  /*
   * Future TBD teams use a placeholder score of zero.
   * Only display scores for completed games with real teams.
   */
  const score =
    !isTbd &&
    gameCompleted &&
    team?.score !== null &&
    team?.score !== undefined
      ? team.score
      : null;

  return (
    <View style={styles.teamRow}>
      <Text
        style={[
          styles.seedText,
          { opacity },
        ]}
      >
        {seed}
      </Text>

      {logoSource ? (
        <Image
          source={logoSource}
          style={[
            styles.teamLogo,
            { opacity },
          ]}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[
            styles.teamLogo,
            {
              opacity: 0.25,
            },
          ]}
        />
      )}

      <Text
        numberOfLines={1}
        style={[
          styles.teamCode,
          {
            opacity:
              isWinner ? 1 : opacity,
          },
        ]}
      >
        {teamCode}
      </Text>

      {score !== null ? (
        <View style={styles.winsBadge}>
          <Text
            style={[
              styles.score,
              { opacity },
            ]}
          >
            {score}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

/* ---------------- MATCHUP CARD ---------------- */

const MatchupCard = ({
  game,
  layout,
  isDark,
  finals = false,
}: {
  game: PlayoffGame;
  layout: CardLayout;
  isDark: boolean;
  finals?: boolean;
}) => {
  const styles =
    nflPlayoffBracketStyles(isDark);

  const gameCompleted =
    game.status?.completed ?? false;

  return (
    <View
      style={[
        styles.cardShell,
        finals && styles.finalsShell,
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
        team={game.away}
        gameCompleted={gameCompleted}
        isDark={isDark}
      />

      <View style={styles.divider} />

      <TeamRow
        team={game.home}
        gameCompleted={gameCompleted}
        isDark={isDark}
      />
    </View>
  );
};

/* ---------------- ROUND LABEL ---------------- */

const RoundLabel = ({
  title,
  x,
  isDark,
}: {
  title: string;
  x: number;
  isDark: boolean;
}) => {
  const styles =
    nflPlayoffBracketStyles(isDark);

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

/* ---------------- CONNECTORS ---------------- */

const ConnectorLayer = ({
  isDark,
  connections,
}: {
  isDark: boolean;
  connections: ConnectorTarget[];
}) => {
  const styles =
    nflPlayoffBracketStyles(isDark);

  const lineColor = isDark
    ? Colors.darkGray
    : Colors.lightGray;

  const connectOneToOne = useCallback(
    (
      key: string,
      source?: CardLayout,
      target?: CardLayout,
    ) => {
      if (!source || !target) {
        return null;
      }

      const sourceRight =
        source.x + source.width;

      const sourceLeft = source.x;

      const targetRight =
        target.x + target.width;

      const targetLeft = target.x;

      const sourceIsRightOfTarget =
        source.x > target.x;

      const x1 = sourceIsRightOfTarget
        ? sourceLeft
        : sourceRight;

      const x2 = sourceIsRightOfTarget
        ? targetRight
        : targetLeft;

      const y1 = centerY(source);
      const y2 = centerY(target);

      const middleX =
        (x1 + x2) / 2;

      return (
        <View key={key}>
          <View
            style={[
              styles.connectorH,
              {
                left: Math.min(
                  x1,
                  middleX,
                ),
                top: y1,
                width: Math.abs(
                  middleX - x1,
                ),
                backgroundColor:
                  lineColor,
              },
            ]}
          />

          <View
            style={[
              styles.connectorV,
              {
                left: middleX,
                top: Math.min(y1, y2),
                height: Math.abs(y1 - y2),
                backgroundColor:
                  lineColor,
              },
            ]}
          />

          <View
            style={[
              styles.connectorH,
              {
                left: Math.min(
                  middleX,
                  x2,
                ),
                top: y2,
                width: Math.abs(
                  x2 - middleX,
                ),
                backgroundColor:
                  lineColor,
              },
            ]}
          />
        </View>
      );
    },
    [
      lineColor,
      styles.connectorH,
      styles.connectorV,
    ],
  );

  return (
    <>
      {connections.map(
        (connection, index) =>
          connectOneToOne(
            `connection-${index}`,
            connection.source,
            connection.target,
          ),
      )}
    </>
  );
};

/* ---------------- COMPONENT ---------------- */

export function NFLPlayoffBracket({
  bracket,
  loading,
  error,
  refreshing,
  onRefresh,
}: NFLPlayoffBracketProps) {
  const { resolvedColorScheme } =
    usePreferences();

  const isDark =
    resolvedColorScheme === "dark";

  const styles = useMemo(
    () =>
      nflPlayoffBracketStyles(isDark),
    [isDark],
  );

  const global = useMemo(
    () => globalStyles(isDark),
    [isDark],
  );

  /* ---------------- ROUND GAMES ---------------- */

  const wildCardGames = useMemo(
    () =>
      getGamesByWeek(bracket, 1),
    [bracket],
  );

  const divisionalGames = useMemo(
    () =>
      getGamesByWeek(bracket, 2),
    [bracket],
  );

  const conferenceGames = useMemo(
    () =>
      getGamesByWeek(bracket, 3),
    [bracket],
  );

  const superBowlGame = useMemo(
    () =>
      getGamesByWeek(bracket, 5)[0] ??
      null,
    [bracket],
  );

  /* ---------------- AFC DATA ---------------- */

  const rawAfcWildCard = useMemo(
    () =>
      getRoundConferenceGames(
        wildCardGames,
        "AFC",
        3,
      ),
    [wildCardGames],
  );

  const afcDivisional = useMemo(
    () =>
      getRoundConferenceGames(
        divisionalGames,
        "AFC",
        2,
      ),
    [divisionalGames],
  );

  const afcWildCard = useMemo(
    () =>
      orderWildCardGamesForBracket(
        rawAfcWildCard,
        afcDivisional,
      ),
    [
      rawAfcWildCard,
      afcDivisional,
    ],
  );

  const afcConference = useMemo(
    () =>
      conferenceGames.find(
        (game) =>
          getConference(game) === "AFC",
      ) ?? null,
    [conferenceGames],
  );

  /* ---------------- NFC DATA ---------------- */

  const rawNfcWildCard = useMemo(
    () =>
      getRoundConferenceGames(
        wildCardGames,
        "NFC",
        3,
      ),
    [wildCardGames],
  );

  const nfcDivisional = useMemo(
    () =>
      getRoundConferenceGames(
        divisionalGames,
        "NFC",
        2,
      ),
    [divisionalGames],
  );

  const nfcWildCard = useMemo(
    () =>
      orderWildCardGamesForBracket(
        rawNfcWildCard,
        nfcDivisional,
      ),
    [
      rawNfcWildCard,
      nfcDivisional,
    ],
  );

  const nfcConference = useMemo(
    () =>
      conferenceGames.find(
        (game) =>
          getConference(game) === "NFC",
      ) ?? null,
    [conferenceGames],
  );

  /* ---------------- CARD LAYOUTS ---------------- */

  const AFC_R1 = useMemo(() => {
    const startingY = 120;
    const gap = 170;

    return Array.from(
      { length: 3 },
      (_, index) => ({
        x: getX(COLS.AFC_R1),
        y: startingY + index * gap,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }),
    );
  }, []);

  const NFC_R1 = useMemo(
    () =>
      AFC_R1.map((layout) => ({
        ...layout,
        x: getX(COLS.NFC_R1),
      })),
    [AFC_R1],
  );

  const AFC_R2 = useMemo(
    () => [
      {
        x: getCenteredX(
          COLS.AFC_R2,
          CARD_WIDTH,
        ),
        y: AFC_R1[0].y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
      {
        x: getCenteredX(
          COLS.AFC_R2,
          CARD_WIDTH,
        ),
        y:
          (AFC_R1[1].y +
            AFC_R1[2].y) /
          2,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    ],
    [AFC_R1],
  );

  const NFC_R2 = useMemo(
    () =>
      AFC_R2.map((layout) => ({
        ...layout,
        x: getCenteredX(
          COLS.NFC_R2,
          CARD_WIDTH,
        ),
      })),
    [AFC_R2],
  );

  const AFC_R3 = useMemo(
    () => ({
      x: getCenteredX(
        COLS.AFC_R3,
        CARD_WIDTH,
      ),
      y:
        (AFC_R2[0].y +
          AFC_R2[1].y) /
        2,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }),
    [AFC_R2],
  );

  const NFC_R3 = useMemo(
    () => ({
      ...AFC_R3,
      x: getCenteredX(
        COLS.NFC_R3,
        CARD_WIDTH,
      ),
    }),
    [AFC_R3],
  );

  const FINALS_LAYOUT =
    useMemo<CardLayout>(
      () => ({
        x: getCenteredX(
          COLS.FINALS,
          FINALS_WIDTH,
        ),

        y:
          (centerY(AFC_R3) +
            centerY(NFC_R3)) /
            2 -
          FINALS_HEIGHT / 2,

        width: FINALS_WIDTH,
        height: FINALS_HEIGHT,
      }),
      [AFC_R3, NFC_R3],
    );

  /* ---------------- AFC CONNECTIONS ---------------- */

  const afcConnections = useMemo(() => {
    const connections: ConnectorTarget[] =
      [];

    afcWildCard.forEach(
      (game, index) => {
        const matchedTargetIndex =
          findNextRoundIndex(
            game,
            afcDivisional,
          );

        const targetIndex =
          matchedTargetIndex ??
          WILD_CARD_TO_DIVISIONAL[index];

        const sourceLayout =
          AFC_R1[index];

        const targetLayout =
          targetIndex !== undefined
            ? AFC_R2[targetIndex]
            : undefined;

        if (
          sourceLayout &&
          targetLayout
        ) {
          connections.push({
            source: sourceLayout,
            target: targetLayout,
          });
        }
      },
    );

    afcDivisional.forEach(
      (_, index) => {
        const sourceLayout =
          AFC_R2[index];

        if (
          afcConference &&
          sourceLayout
        ) {
          connections.push({
            source: sourceLayout,
            target: AFC_R3,
          });
        }
      },
    );

    if (
      afcConference &&
      superBowlGame
    ) {
      connections.push({
        source: AFC_R3,
        target: FINALS_LAYOUT,
      });
    }

    return connections;
  }, [
    afcWildCard,
    afcDivisional,
    afcConference,
    superBowlGame,
    AFC_R1,
    AFC_R2,
    AFC_R3,
    FINALS_LAYOUT,
  ]);

  /* ---------------- NFC CONNECTIONS ---------------- */

  const nfcConnections = useMemo(() => {
    const connections: ConnectorTarget[] =
      [];

    nfcWildCard.forEach(
      (game, index) => {
        const matchedTargetIndex =
          findNextRoundIndex(
            game,
            nfcDivisional,
          );

        const targetIndex =
          matchedTargetIndex ??
          WILD_CARD_TO_DIVISIONAL[index];

        const sourceLayout =
          NFC_R1[index];

        const targetLayout =
          targetIndex !== undefined
            ? NFC_R2[targetIndex]
            : undefined;

        if (
          sourceLayout &&
          targetLayout
        ) {
          connections.push({
            source: sourceLayout,
            target: targetLayout,
          });
        }
      },
    );

    nfcDivisional.forEach(
      (_, index) => {
        const sourceLayout =
          NFC_R2[index];

        if (
          nfcConference &&
          sourceLayout
        ) {
          connections.push({
            source: sourceLayout,
            target: NFC_R3,
          });
        }
      },
    );

    if (
      nfcConference &&
      superBowlGame
    ) {
      connections.push({
        source: NFC_R3,
        target: FINALS_LAYOUT,
      });
    }

    return connections;
  }, [
    nfcWildCard,
    nfcDivisional,
    nfcConference,
    superBowlGame,
    NFC_R1,
    NFC_R2,
    NFC_R3,
    FINALS_LAYOUT,
  ]);

  /* ---------------- DISPLAY STATES ---------------- */

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  const hasPlayoffGames =
    Boolean(bracket?.games?.length) ||
    Boolean(
      bracket?.groups?.some(
        (group) =>
          group.games?.length,
      ),
    );

  if (!hasPlayoffGames) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>
          No NFL playoff bracket available.
        </Text>
      </View>
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={
            isDark
              ? Colors.white
              : Colors.black
          }
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >
        <View style={styles.canvas}>
          <RoundLabel
            title="WILD CARD"
            x={getColCenter(
              COLS.AFC_R1,
            )}
            isDark={isDark}
          />

          <RoundLabel
            title="DIVISIONAL ROUND"
            x={getColCenter(
              COLS.AFC_R2,
            )}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE CHAMPIONSHIP"
            x={getColCenter(
              COLS.AFC_R3,
            )}
            isDark={isDark}
          />

          <RoundLabel
            title="SUPER BOWL"
            x={getColCenter(
              COLS.FINALS,
            )}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE CHAMPIONSHIP"
            x={getColCenter(
              COLS.NFC_R3,
            )}
            isDark={isDark}
          />

          <RoundLabel
            title="DIVISIONAL ROUND"
            x={getColCenter(
              COLS.NFC_R2,
            )}
            isDark={isDark}
          />

          <RoundLabel
            title="WILD CARD"
            x={getColCenter(
              COLS.NFC_R1,
            )}
            isDark={isDark}
          />

          <ConnectorLayer
            isDark={isDark}
            connections={afcConnections}
          />

          <ConnectorLayer
            isDark={isDark}
            connections={nfcConnections}
          />

          <Image
            source={NFLPlayoffsLogo}
            style={styles.playoffsLogo}
          />

          <Text
            style={[
              styles.sideLabel,
              styles.afcLabel,
            ]}
          >
            AFC
          </Text>

          <Text
            style={[
              styles.sideLabel,
              styles.nfcLabel,
            ]}
          >
            NFC
          </Text>

          {afcWildCard.map(
            (game, index) =>
              AFC_R1[index] ? (
                <MatchupCard
                  key={`afc-wild-card-${game.id}`}
                  game={game}
                  layout={AFC_R1[index]}
                  isDark={isDark}
                />
              ) : null,
          )}

          {afcDivisional.map(
            (game, index) =>
              AFC_R2[index] ? (
                <MatchupCard
                  key={`afc-divisional-${game.id}`}
                  game={game}
                  layout={AFC_R2[index]}
                  isDark={isDark}
                />
              ) : null,
          )}

          {afcConference ? (
            <MatchupCard
              key={`afc-conference-${afcConference.id}`}
              game={afcConference}
              layout={AFC_R3}
              isDark={isDark}
            />
          ) : null}

          {nfcWildCard.map(
            (game, index) =>
              NFC_R1[index] ? (
                <MatchupCard
                  key={`nfc-wild-card-${game.id}`}
                  game={game}
                  layout={NFC_R1[index]}
                  isDark={isDark}
                />
              ) : null,
          )}

          {nfcDivisional.map(
            (game, index) =>
              NFC_R2[index] ? (
                <MatchupCard
                  key={`nfc-divisional-${game.id}`}
                  game={game}
                  layout={NFC_R2[index]}
                  isDark={isDark}
                />
              ) : null,
          )}

          {nfcConference ? (
            <MatchupCard
              key={`nfc-conference-${nfcConference.id}`}
              game={nfcConference}
              layout={NFC_R3}
              isDark={isDark}
            />
          ) : null}

          {superBowlGame ? (
            <MatchupCard
              key={`super-bowl-${superBowlGame.id}`}
              game={superBowlGame}
              layout={FINALS_LAYOUT}
              isDark={isDark}
              finals
            />
          ) : null}
        </View>
      </ScrollView>
    </ScrollView>
  );
}