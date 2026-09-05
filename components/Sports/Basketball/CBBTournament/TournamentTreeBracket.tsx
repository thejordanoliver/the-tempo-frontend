// components/Sports/Basketball/TournamentBracket/TournamentTreeBracket.tsx

import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { Colors, globalStyles } from "@/constants/styles";
import { getCBBTeamLogo } from "@/constants/teamsCBB";
import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
  type TournamentGame,
  type TournamentRegion,
  type TournamentTeam,
  useTournamentBracket,
} from "@/hooks/BasketballHooks/useTournamentBracket";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CBBTournamentBracketStyles,
} from "@/styles/PlayoffStyles/CBBTournamentBracketStyles";
import React, { useMemo, useRef } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  BRACKET_LAYOUT,
  type DisplayTeamPair,
  getFinalFourDisplayTeams,
  getRegionalDisplayTeams,
  getSourceGameDisplayTeams,
  REGIONAL_SLOT_SEED_GROUPS,
  type RegionalRoundCode,
} from "utils/tournamentBracket.utils";

type TournamentTreeBracketProps = {
  season: number;
  league?: string;
};

type TeamRowProps = {
  team: TournamentTeam | null;
  winner: boolean;
  gameHasWinner: boolean;
  isDark: boolean;
  league: string;
};

type MatchupCardProps = {
  game?: TournamentGame | null;
  displayTeams?: DisplayTeamPair;
  isDark: boolean;
  championship?: boolean;
  league: string;
};

type RegionBracketProps = {
  region: TournamentRegion;
  isDark: boolean;
  league: string;
  direction: "ltr" | "rtl";
};

type FirstFourProps = {
  games: TournamentGame[];
  isDark: boolean;
  league: string;
};

type NationalStageProps = {
  regions: TournamentRegion[];
  finalFourGames: TournamentGame[];
  championshipGame: TournamentGame | null;
  isDark: boolean;
  league: string;
};

type ConnectorPairProps = {
  sourceYs: readonly number[];
  destinationYs: readonly number[];
  sourceColumnIndex: number;
  destinationColumnIndex: number;
  color: string;
  direction: "ltr" | "rtl";
};

type RegionalRoundSlots = Record<
  RegionalRoundCode,
  (TournamentGame | undefined)[]
>;

const REGIONAL_ROUNDS: readonly RegionalRoundCode[] = [
  "ROUND_OF_64",
  "ROUND_OF_32",
  "SWEET_16",
  "ELITE_8",
];

const ROUND_LABELS: Record<RegionalRoundCode, string> = {
  ROUND_OF_64: "1st Round",
  ROUND_OF_32: "2nd Round",
  SWEET_16: "Sweet 16",
  ELITE_8: "Elite Eight",
};

const BASE_MATCHUP_GAP = 40;

const makeFirstRoundYs = (): number[] =>
  Array.from(
    { length: REGIONAL_SLOT_SEED_GROUPS.ROUND_OF_64.length },
    (_, index) => index * (CARD_HEIGHT + BASE_MATCHUP_GAP),
  );

const centerBetween = (firstY: number, secondY: number): number => {
  const firstCenter = firstY + CARD_HEIGHT / 2;
  const secondCenter = secondY + CARD_HEIGHT / 2;

  return (firstCenter + secondCenter) / 2 - CARD_HEIGHT / 2;
};

const makeNextRoundYs = (sourceYs: readonly number[]): number[] => {
  const result: number[] = [];

  for (let index = 0; index < sourceYs.length; index += 2) {
    const firstY = sourceYs[index];
    const secondY = sourceYs[index + 1];

    if (firstY === undefined || secondY === undefined) {
      continue;
    }

    result.push(centerBetween(firstY, secondY));
  }

  return result;
};

const ROUND_OF_64_Y = makeFirstRoundYs();
const ROUND_OF_32_Y = makeNextRoundYs(ROUND_OF_64_Y);
const SWEET_16_Y = makeNextRoundYs(ROUND_OF_32_Y);
const ELITE_8_Y = makeNextRoundYs(SWEET_16_Y);

const ROUND_Y: Record<RegionalRoundCode, number[]> = {
  ROUND_OF_64: ROUND_OF_64_Y,
  ROUND_OF_32: ROUND_OF_32_Y,
  SWEET_16: SWEET_16_Y,
  ELITE_8: ELITE_8_Y,
};

const REGION_BODY_HEIGHT =
  ROUND_OF_64_Y[ROUND_OF_64_Y.length - 1] + CARD_HEIGHT;

const REGION_ROUNDS_WIDTH =
  BRACKET_LAYOUT.roundColumnWidth * REGIONAL_ROUNDS.length +
  BRACKET_LAYOUT.horizontalRoundGap * (REGIONAL_ROUNDS.length - 1);

const CARD_LEFT_IN_COLUMN = Math.max(
  0,
  (BRACKET_LAYOUT.roundColumnWidth - CARD_WIDTH) / 2,
);

const REGION_BLOCK_HEIGHT =
  BRACKET_LAYOUT.regionHeaderHeight + REGION_BODY_HEIGHT;
const QUADRANT_VERTICAL_GAP = 72;
const CENTER_STAGE_GAP = 40;
const FINAL_STAGE_WIDTH = 680;
const FINAL_STAGE_HEIGHT = 360;
const FINAL_FOUR_Y = 16;
const QUADRANT_BOARD_WIDTH =
  REGION_ROUNDS_WIDTH * 2 + FINAL_STAGE_WIDTH + CENTER_STAGE_GAP * 2;
const QUADRANT_BOARD_HEIGHT = REGION_BLOCK_HEIGHT * 2 + QUADRANT_VERTICAL_GAP;

const getRoundColumnX = (columnIndex: number): number =>
  columnIndex *
  (BRACKET_LAYOUT.roundColumnWidth + BRACKET_LAYOUT.horizontalRoundGap);

const getGameTimestamp = (game: TournamentGame): number => {
  if (!game.date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = Date.parse(game.date);

  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
};

const sortGamesByDate = (games: readonly TournamentGame[]): TournamentGame[] =>
  [...games].sort((firstGame, secondGame) => {
    const dateDifference =
      getGameTimestamp(firstGame) - getGameTimestamp(secondGame);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return firstGame.id.localeCompare(secondGame.id);
  });

const getTeamName = (team: TournamentTeam | null): string =>
  team?.code || team?.shortName || team?.name || "TBD";
const getChampionName = (team: TournamentTeam | null): string =>
  team?.shortName || team?.name || "TBD";

const getGameSeeds = (game: TournamentGame): number[] =>
  [game.homeTeam?.seed, game.awayTeam?.seed].filter(
    (seed): seed is number => typeof seed === "number" && Number.isFinite(seed),
  );

const getSeedSlotIndex = (
  game: TournamentGame,
  round: RegionalRoundCode,
): number | null => {
  const seeds = getGameSeeds(game);

  if (seeds.length === 0) {
    return null;
  }

  const groups = REGIONAL_SLOT_SEED_GROUPS[round];

  const matchingIndexes = groups.reduce<number[]>(
    (indexes, seedGroup, index) => {
      if (seeds.every((seed) => seedGroup.includes(seed))) {
        indexes.push(index);
      }

      return indexes;
    },
    [],
  );

  return matchingIndexes.length === 1 ? matchingIndexes[0] : null;
};

const placeRoundGames = (
  games: readonly TournamentGame[],
  round: RegionalRoundCode,
): (TournamentGame | undefined)[] => {
  const slotCount = REGIONAL_SLOT_SEED_GROUPS[round].length;
  const slots = Array<TournamentGame | undefined>(slotCount).fill(undefined);
  const unresolved: TournamentGame[] = [];

  for (const game of sortGamesByDate(games)) {
    const slotIndex = getSeedSlotIndex(game, round);

    if (
      slotIndex !== null &&
      slotIndex >= 0 &&
      slotIndex < slotCount &&
      !slots[slotIndex]
    ) {
      slots[slotIndex] = game;
      continue;
    }

    unresolved.push(game);
  }

  /**
   * A future or partially populated bracket can temporarily be missing seeds.
   * Keep those games visible without disturbing any matchup already placed
   * from seed-path data.
   */
  for (const game of unresolved) {
    const emptyIndex = slots.findIndex((slot) => slot === undefined);

    if (emptyIndex === -1) {
      break;
    }

    slots[emptyIndex] = game;
  }

  return slots;
};

const buildRegionRoundSlots = (
  region: TournamentRegion,
): RegionalRoundSlots => ({
  ROUND_OF_64: placeRoundGames(
    region.games.filter((game) => game.round === "ROUND_OF_64"),
    "ROUND_OF_64",
  ),
  ROUND_OF_32: placeRoundGames(
    region.games.filter((game) => game.round === "ROUND_OF_32"),
    "ROUND_OF_32",
  ),
  SWEET_16: placeRoundGames(
    region.games.filter((game) => game.round === "SWEET_16"),
    "SWEET_16",
  ),
  ELITE_8: placeRoundGames(
    region.games.filter((game) => game.round === "ELITE_8"),
    "ELITE_8",
  ),
});

const isTeamWinner = (
  game: TournamentGame,
  team: TournamentTeam | null,
): boolean => {
  if (!team) {
    return false;
  }

  if (game.winnerTeamId) {
    return game.winnerTeamId === team.id;
  }

  return team.winner === true;
};

const gameHasWinner = (game: TournamentGame): boolean =>
  Boolean(
    game.winnerTeamId ||
    game.homeTeam?.winner === true ||
    game.awayTeam?.winner === true,
  );

const getWinnerTeam = (game: TournamentGame | null): TournamentTeam | null => {
  if (!game) {
    return null;
  }

  if (isTeamWinner(game, game.homeTeam)) {
    return game.homeTeam;
  }

  if (isTeamWinner(game, game.awayTeam)) {
    return game.awayTeam;
  }

  return null;
};

const getStatusLabel = (game: TournamentGame): string => {
  if (game.statusText?.trim()) {
    return game.statusText;
  }

  if (game.status === "live" || game.status === "in") {
    return "Live";
  }

  if (game.status === "post" || game.status === "final") {
    return "Final";
  }

  if (!game.date) {
    return "TBD";
  }

  const date = new Date(game.date);

  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

/**
 * Get the appropriate team logo based on league (Men's or Women's CBB)
 */
const getTeamLogo = (
  teamId: string | undefined,
  league: string,
  isDark: boolean,
) => {
  if (league === "wcbb") {
    return getWCBBTeamLogo(teamId, isDark);
  }

  return getCBBTeamLogo(teamId, isDark);
};

function TeamRow({
  team,
  winner,
  gameHasWinner: hasWinner,
  isDark,
  league,
}: TeamRowProps) {
  const styles = CBBTournamentBracketStyles(isDark);
  const isPlaceholder = team === null;

  const teamLogo = getTeamLogo(team?.id, league, isDark);

  return (
    <View
      style={[
        styles.teamRow,
        hasWinner && !winner && !isPlaceholder ? styles.loserText : undefined,
      ]}
    >
      <View style={styles.teamInfo}>
        {team?.seed !== null && team?.seed !== undefined ? (
          <View style={styles.seedContainer}>
            <Text style={styles.seedText}>{team.seed}</Text>
          </View>
        ) : (
          <View style={styles.seedPlaceholder} />
        )}

        <Image source={teamLogo} style={styles.teamLogo} resizeMode="contain" />

        <View style={styles.teamNameWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.teamName,
              isPlaceholder ? styles.placeholderName : undefined,
              winner ? styles.winnerText : undefined,
            ]}
          >
            {getTeamName(team)}
          </Text>
        </View>
      </View>

      <Text style={[styles.score, winner ? styles.winnerText : undefined]}>
        {team?.score ?? ""}
      </Text>
    </View>
  );
}

function MatchupCard({
  game,
  displayTeams,
  isDark,
  championship = false,
  league,
}: MatchupCardProps) {
  const styles = CBBTournamentBracketStyles(isDark);

  if (!game) {
    return (
      <View
        style={[
          styles.matchupCard,
          styles.matchupCardCompact,
          championship ? styles.championshipCard : undefined,
          styles.cardDisabled,
          { width: CARD_WIDTH, height: CARD_HEIGHT },
        ]}
      >
        <TeamRow
          team={null}
          winner={false}
          gameHasWinner={false}
          isDark={isDark}
          league={league}
        />

        <View style={styles.divider} />

        <TeamRow
          team={null}
          winner={false}
          gameHasWinner={false}
          isDark={isDark}
          league={league}
        />
      </View>
    );
  }

  const hasWinner = gameHasWinner(game);
  const isLive = game.status === "live" || game.status === "in";
  const teams = displayTeams ?? [game.homeTeam, game.awayTeam];

  return (
    <View
      style={[
        styles.matchupCard,
        styles.matchupCardCompact,
        championship ? styles.championshipCard : undefined,
        { width: CARD_WIDTH, height: CARD_HEIGHT },
      ]}
    >
      <TeamRow
        team={teams[0]}
        winner={isTeamWinner(game, teams[0])}
        gameHasWinner={hasWinner}
        isDark={isDark}
        league={league}
      />

      <View style={styles.divider} />

      <TeamRow
        team={teams[1]}
        winner={isTeamWinner(game, teams[1])}
        gameHasWinner={hasWinner}
        isDark={isDark}
        league={league}
      />

      <View style={styles.cardFooter}>
        <Text
          numberOfLines={1}
          style={[styles.statusText, isLive ? styles.liveText : undefined]}
        >
          {getStatusLabel(game)}
        </Text>

        {game.broadcast ? (
          <Text numberOfLines={1} style={styles.broadcastText}>
            {game.broadcast}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ConnectorPair({
  sourceYs,
  destinationYs,
  sourceColumnIndex,
  destinationColumnIndex,
  color,
  direction,
}: ConnectorPairProps) {
  const sourceColumnX = getRoundColumnX(sourceColumnIndex);
  const destinationColumnX = getRoundColumnX(destinationColumnIndex);

  const sourceX =
    sourceColumnX +
    CARD_LEFT_IN_COLUMN +
    (direction === "ltr" ? CARD_WIDTH : 0);
  const destinationX =
    destinationColumnX +
    CARD_LEFT_IN_COLUMN +
    (direction === "rtl" ? CARD_WIDTH : 0);
  const elbowX = sourceX + (destinationX - sourceX) / 2;

  return (
    <>
      {destinationYs.map((destinationY, destinationIndex) => {
        const firstSourceY = sourceYs[destinationIndex * 2];
        const secondSourceY = sourceYs[destinationIndex * 2 + 1];

        if (firstSourceY === undefined || secondSourceY === undefined) {
          return null;
        }

        const firstCenterY = firstSourceY + CARD_HEIGHT / 2;
        const secondCenterY = secondSourceY + CARD_HEIGHT / 2;
        const destinationCenterY = destinationY + CARD_HEIGHT / 2;

        return (
          <React.Fragment key={`connector-${destinationIndex}`}>
            <Path
              d={`M ${sourceX} ${firstCenterY} H ${elbowX} V ${destinationCenterY} H ${destinationX}`}
              fill="none"
              stroke={color}
              strokeWidth={1}
            />

            <Path
              d={`M ${sourceX} ${secondCenterY} H ${elbowX} V ${destinationCenterY} H ${destinationX}`}
              fill="none"
              stroke={color}
              strokeWidth={1}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

function RegionBracket({
  region,
  isDark,
  league,
  direction,
}: RegionBracketProps) {
  const styles = CBBTournamentBracketStyles(isDark);
  const connectorColor = isDark ? Colors.darkGray : Colors.lightGray;

  const roundGames = useMemo(() => buildRegionRoundSlots(region), [region]);
  const displayedRounds =
    direction === "ltr" ? REGIONAL_ROUNDS : [...REGIONAL_ROUNDS].reverse();
  const getVisualColumnIndex = (roundIndex: number) =>
    direction === "ltr" ? roundIndex : REGIONAL_ROUNDS.length - 1 - roundIndex;

  return (
    <View style={styles.regionContainer}>
      <View
        style={{
          height: BRACKET_LAYOUT.regionHeaderHeight,
          alignItems: direction === "ltr" ? "flex-start" : "flex-end",
          justifyContent: "center",
          paddingHorizontal: CARD_LEFT_IN_COLUMN,
        }}
      >
        <Text style={styles.regionTitle}>{region.name} Region</Text>
      </View>

      <View
        style={[
          styles.regionRounds,
          {
            position: "relative",
            width: REGION_ROUNDS_WIDTH,
            height: REGION_BODY_HEIGHT,
          },
        ]}
      >
        <Svg
          pointerEvents="none"
          width={REGION_ROUNDS_WIDTH}
          height={REGION_BODY_HEIGHT}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          <ConnectorPair
            sourceYs={ROUND_OF_64_Y}
            destinationYs={ROUND_OF_32_Y}
            sourceColumnIndex={getVisualColumnIndex(0)}
            destinationColumnIndex={getVisualColumnIndex(1)}
            color={connectorColor}
            direction={direction}
          />

          <ConnectorPair
            sourceYs={ROUND_OF_32_Y}
            destinationYs={SWEET_16_Y}
            sourceColumnIndex={getVisualColumnIndex(1)}
            destinationColumnIndex={getVisualColumnIndex(2)}
            color={connectorColor}
            direction={direction}
          />

          <ConnectorPair
            sourceYs={SWEET_16_Y}
            destinationYs={ELITE_8_Y}
            sourceColumnIndex={getVisualColumnIndex(2)}
            destinationColumnIndex={getVisualColumnIndex(3)}
            color={connectorColor}
            direction={direction}
          />
        </Svg>

        {displayedRounds.map((round) => {
          const games = roundGames[round];
          const yPositions = ROUND_Y[round];

          return (
            <View
              key={round}
              style={[
                styles.roundColumn,
                {
                  position: "relative",
                  height: REGION_BODY_HEIGHT,
                  zIndex: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.roundMatchups,
                  {
                    position: "relative",
                    height: REGION_BODY_HEIGHT,
                  },
                ]}
              >
                {yPositions.map((yPosition, index) => (
                  <View
                    key={`${round}-${index}`}
                    style={{
                      position: "absolute",
                      top: yPosition,
                      left: CARD_LEFT_IN_COLUMN,
                    }}
                  >
                    <MatchupCard
                      game={games[index]}
                      displayTeams={
                        games[index]
                          ? getRegionalDisplayTeams(games[index], round, index)
                          : undefined
                      }
                      isDark={isDark}
                      league={league}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function BracketRoundHeader({ isDark }: { isDark: boolean }) {
  const styles = CBBTournamentBracketStyles(isDark);
  const centerStageX = REGION_ROUNDS_WIDTH + CENTER_STAGE_GAP;
  const rightRegionX = centerStageX + FINAL_STAGE_WIDTH + CENTER_STAGE_GAP;
  const championshipX = centerStageX + (FINAL_STAGE_WIDTH - CARD_WIDTH) / 2;

  const renderRegionalHeaders = (
    rounds: readonly RegionalRoundCode[],
    left: number,
  ) => (
    <View
      style={{
        position: "absolute",
        left,
        top: 0,
        width: REGION_ROUNDS_WIDTH,
        height: BRACKET_LAYOUT.roundTitleHeight,
        flexDirection: "row",
        gap: BRACKET_LAYOUT.horizontalRoundGap,
      }}
    >
      {rounds.map((round) => (
        <Text
          key={`${left}-${round}`}
          style={[
            styles.roundLabel,
            { width: BRACKET_LAYOUT.roundColumnWidth },
          ]}
        >
          {ROUND_LABELS[round]}
        </Text>
      ))}
    </View>
  );

  return (
    <View
      style={{
        position: "relative",
        width: QUADRANT_BOARD_WIDTH,
        height: BRACKET_LAYOUT.roundTitleHeight,
      }}
    >
      {renderRegionalHeaders(REGIONAL_ROUNDS, 0)}
      {renderRegionalHeaders([...REGIONAL_ROUNDS].reverse(), rightRegionX)}

      <Text
        style={[
          styles.roundLabel,
          { position: "absolute", left: centerStageX, width: CARD_WIDTH },
        ]}
      >
        Final Four
      </Text>
      <Text
        style={[
          styles.roundLabel,
          { position: "absolute", left: championshipX, width: CARD_WIDTH },
        ]}
      >
        Championship
      </Text>
      <Text
        style={[
          styles.roundLabel,
          {
            position: "absolute",
            left: centerStageX + FINAL_STAGE_WIDTH - CARD_WIDTH,
            width: CARD_WIDTH,
          },
        ]}
      >
        Final Four
      </Text>
    </View>
  );
}

function FirstFour({ games, isDark, league }: FirstFourProps) {
  const styles = CBBTournamentBracketStyles(isDark);

  const orderedGames = useMemo(
    () =>
      [...games].sort((firstGame, secondGame) => {
        const firstRegion = firstGame.regionName ?? "";
        const secondRegion = secondGame.regionName ?? "";

        if (firstRegion !== secondRegion) {
          return firstRegion.localeCompare(secondRegion);
        }

        const firstSeed =
          firstGame.homeTeam?.seed ??
          firstGame.awayTeam?.seed ??
          Number.MAX_SAFE_INTEGER;
        const secondSeed =
          secondGame.homeTeam?.seed ??
          secondGame.awayTeam?.seed ??
          Number.MAX_SAFE_INTEGER;

        if (firstSeed !== secondSeed) {
          return firstSeed - secondSeed;
        }

        return getGameTimestamp(firstGame) - getGameTimestamp(secondGame);
      }),
    [games],
  );

  if (orderedGames.length === 0) {
    return null;
  }

  return (
    <View style={styles.openingSection}>
      <View style={styles.openingHeaderRow}>
        <Text style={styles.openingTitle}>First Four</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.openingGamesRow,
          { gap: 16, paddingHorizontal: 2 },
        ]}
      >
        {orderedGames.map((game) => {
          const seed = game.homeTeam?.seed ?? game.awayTeam?.seed ?? null;

          return (
            <View key={game.id} style={styles.openingCardWrap}>
              <MatchupCard game={game} isDark={isDark} league={league} />

              <Text style={styles.advanceText}>
                {game.regionName ?? "First Four"}
                {seed !== null ? ` • No. ${seed} seed` : ""}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const getRegionalChampionOrder = (
  regions: readonly TournamentRegion[],
): ReadonlyMap<string, number> => {
  const championOrderByTeamId = new Map<string, number>();

  for (const region of regions) {
    const eliteEightGame = region.games.find(
      (game) => game.round === "ELITE_8",
    );
    const champion = getWinnerTeam(eliteEightGame ?? null);

    if (champion) {
      championOrderByTeamId.set(champion.id, region.order);
    }
  }

  return championOrderByTeamId;
};

const getFinalFourGameRegionOrder = (
  game: TournamentGame,
  regionalChampionOrderByTeamId: ReadonlyMap<string, number>,
): number =>
  Math.min(
    regionalChampionOrderByTeamId.get(game.homeTeam?.id ?? "") ??
      Number.MAX_SAFE_INTEGER,
    regionalChampionOrderByTeamId.get(game.awayTeam?.id ?? "") ??
      Number.MAX_SAFE_INTEGER,
  );

const getOrderedFinalFourGames = (
  finalFourGames: readonly TournamentGame[],
  regionalChampionOrderByTeamId: ReadonlyMap<string, number>,
): TournamentGame[] =>
  sortGamesByDate(finalFourGames).sort((firstGame, secondGame) => {
    const regionDifference =
      getFinalFourGameRegionOrder(firstGame, regionalChampionOrderByTeamId) -
      getFinalFourGameRegionOrder(secondGame, regionalChampionOrderByTeamId);

    return regionDifference;
  });

const getRegionForTeam = (
  regions: readonly TournamentRegion[],
  team: TournamentTeam | null,
): TournamentRegion | null => {
  if (!team) {
    return null;
  }

  return (
    regions.find((region) =>
      region.games.some(
        (game) =>
          game.homeTeam?.id === team.id || game.awayTeam?.id === team.id,
      ),
    ) ?? null
  );
};

const getFinalFourRegionLayout = (
  regions: readonly TournamentRegion[],
  orderedFinalFourGames: readonly TournamentGame[],
  regionalChampionOrderByTeamId: ReadonlyMap<string, number>,
): TournamentRegion[] => {
  const fallbackRegions = [...regions]
    .sort((firstRegion, secondRegion) => firstRegion.order - secondRegion.order)
    .slice(0, 4);
  const semifinalRegionPairs = orderedFinalFourGames.slice(0, 2).map((game) => {
    const pair: TournamentRegion[] = [];
    const displayTeams = getFinalFourDisplayTeams(
      game,
      regionalChampionOrderByTeamId,
    );

    for (const team of displayTeams) {
      const region = getRegionForTeam(regions, team);

      if (region && !pair.some((candidate) => candidate.id === region.id)) {
        pair.push(region);
      }
    }

    return pair;
  });

  while (semifinalRegionPairs.length < 2) {
    semifinalRegionPairs.push([]);
  }

  const assignedRegionIds = new Set(
    semifinalRegionPairs.flat().map((region) => region.id),
  );
  const unassignedRegions = fallbackRegions.filter(
    (region) => !assignedRegionIds.has(region.id),
  );

  for (const pair of semifinalRegionPairs) {
    while (pair.length < 2 && unassignedRegions.length > 0) {
      const fallbackRegion = unassignedRegions.shift();

      if (fallbackRegion) {
        pair.push(fallbackRegion);
      }
    }
  }

  return semifinalRegionPairs.flat().slice(0, 4);
};

function NationalStage({
  regions,
  finalFourGames,
  championshipGame,
  isDark,
  league,
}: NationalStageProps) {
  const styles = CBBTournamentBracketStyles(isDark);
  const connectorColor = isDark ? Colors.darkGray : Colors.lightGray;

  const regionalChampionOrderByTeamId = useMemo(
    () => getRegionalChampionOrder(regions),
    [regions],
  );

  const orderedFinalFour = useMemo(
    () =>
      getOrderedFinalFourGames(finalFourGames, regionalChampionOrderByTeamId),
    [finalFourGames, regionalChampionOrderByTeamId],
  );

  const semifinalOne = orderedFinalFour[0];
  const semifinalTwo = orderedFinalFour[1];
  const champion = getWinnerTeam(championshipGame);
  const semifinalOneDisplayTeams = semifinalOne
    ? getFinalFourDisplayTeams(semifinalOne, regionalChampionOrderByTeamId)
    : undefined;
  const semifinalTwoDisplayTeams = semifinalTwo
    ? getFinalFourDisplayTeams(semifinalTwo, regionalChampionOrderByTeamId)
    : undefined;
  const championshipDisplayTeams = championshipGame
    ? getSourceGameDisplayTeams(championshipGame, semifinalOne, semifinalTwo)
    : undefined;

  const semifinalOneX = 0;
  const semifinalTwoX = FINAL_STAGE_WIDTH - CARD_WIDTH;
  const championshipX = (FINAL_STAGE_WIDTH - CARD_WIDTH) / 2;
  const championPanelWidth = CARD_WIDTH + 22;
  const championPanelX = (FINAL_STAGE_WIDTH - championPanelWidth) / 2;
  const championPanelY = FINAL_FOUR_Y + CARD_HEIGHT + 48;

  const championLogoSource = champion
    ? getTeamLogo(champion.id, league, isDark)
    : null;

  return (
    <View
      style={[
        styles.bracketBoard,
        {
          width: FINAL_STAGE_WIDTH,
          height: FINAL_STAGE_HEIGHT,
        },
      ]}
    >
      <Svg
        pointerEvents="none"
        width={FINAL_STAGE_WIDTH}
        height={FINAL_STAGE_HEIGHT}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Path
          d={`M ${semifinalOneX + CARD_WIDTH} ${
            FINAL_FOUR_Y + CARD_HEIGHT / 2
          } H ${championshipX}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />

        <Path
          d={`M ${semifinalTwoX} ${
            FINAL_FOUR_Y + CARD_HEIGHT / 2
          } H ${championshipX + CARD_WIDTH}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />

        <Path
          d={`M ${championshipX + CARD_WIDTH / 2} ${
            FINAL_FOUR_Y + CARD_HEIGHT
          } V ${championPanelY}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={2}
        />
      </Svg>

      <View
        style={{
          position: "absolute",
          top: FINAL_FOUR_Y,
          left: semifinalOneX,
        }}
      >
        <MatchupCard
          game={semifinalOne}
          displayTeams={semifinalOneDisplayTeams}
          isDark={isDark}
          league={league}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: FINAL_FOUR_Y,
          left: semifinalTwoX,
        }}
      >
        <MatchupCard
          game={semifinalTwo}
          displayTeams={semifinalTwoDisplayTeams}
          isDark={isDark}
          league={league}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: FINAL_FOUR_Y,
          left: championshipX,
        }}
      >
        <MatchupCard
          game={championshipGame}
          displayTeams={championshipDisplayTeams}
          isDark={isDark}
          championship
          league={league}
        />
      </View>

      <View
        style={[
          styles.championPanelOverlay,
          {
            top: championPanelY,
            left: championPanelX,
            right: undefined,
            width: championPanelWidth,
          },
        ]}
      >
        <View style={styles.championPanel}>
          {championLogoSource && (
            <Image
              source={championLogoSource}
              style={styles.championLogo}
              resizeMode="contain"
            />
          )}

          <Text style={styles.championLabel}>Champion</Text>

          <Text numberOfLines={1} style={styles.championName}>
            {getChampionName(champion)}
          </Text>

          {champion?.seed !== null && champion?.seed !== undefined ? (
            <Text style={styles.championMeta}>
              {`No. ${champion.seed} seed`}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function TournamentQuadrant({
  regions,
  finalFourGames,
  championshipGame,
  isDark,
  league,
}: NationalStageProps) {
  const styles = CBBTournamentBracketStyles(isDark);
  const connectorColor = isDark ? Colors.darkGray : Colors.lightGray;
  const regionalChampionOrderByTeamId = useMemo(
    () => getRegionalChampionOrder(regions),
    [regions],
  );
  const orderedFinalFour = useMemo(
    () =>
      getOrderedFinalFourGames(finalFourGames, regionalChampionOrderByTeamId),
    [finalFourGames, regionalChampionOrderByTeamId],
  );
  const orderedRegions = useMemo(
    () =>
      getFinalFourRegionLayout(
        regions,
        orderedFinalFour,
        regionalChampionOrderByTeamId,
      ),
    [regions, orderedFinalFour, regionalChampionOrderByTeamId],
  );
  const centerStageX = REGION_ROUNDS_WIDTH + CENTER_STAGE_GAP;
  const rightRegionX = centerStageX + FINAL_STAGE_WIDTH + CENTER_STAGE_GAP;
  const bottomRegionY = REGION_BLOCK_HEIGHT + QUADRANT_VERTICAL_GAP;
  const centerStageY = (QUADRANT_BOARD_HEIGHT - FINAL_STAGE_HEIGHT) / 2;
  const regionalWinnerCenterY =
    BRACKET_LAYOUT.regionHeaderHeight + ELITE_8_Y[0] + CARD_HEIGHT / 2;
  const leftRegionWinnerX =
    getRoundColumnX(REGIONAL_ROUNDS.length - 1) +
    CARD_LEFT_IN_COLUMN +
    CARD_WIDTH;
  const rightRegionWinnerX = rightRegionX + CARD_LEFT_IN_COLUMN;
  const leftFinalFourX = centerStageX;
  const rightFinalFourX = centerStageX + FINAL_STAGE_WIDTH;
  const finalFourTopTeamY = centerStageY + FINAL_FOUR_Y + CARD_HEIGHT * 0.3;
  const finalFourBottomTeamY = centerStageY + FINAL_FOUR_Y + CARD_HEIGHT * 0.7;
  const leftConnectorElbowX =
    leftRegionWinnerX + (leftFinalFourX - leftRegionWinnerX) / 2;
  const rightConnectorElbowX =
    rightFinalFourX + (rightRegionWinnerX - rightFinalFourX) / 2;

  const regionPositions = [
    { left: 0, top: 0, direction: "ltr" as const },
    { left: 0, top: bottomRegionY, direction: "ltr" as const },
    { left: rightRegionX, top: 0, direction: "rtl" as const },
    { left: rightRegionX, top: bottomRegionY, direction: "rtl" as const },
  ];

  return (
    <View
      style={[
        styles.bracketBoard,
        {
          width: QUADRANT_BOARD_WIDTH,
          height: QUADRANT_BOARD_HEIGHT,
        },
      ]}
    >
      <Svg
        pointerEvents="none"
        width={QUADRANT_BOARD_WIDTH}
        height={QUADRANT_BOARD_HEIGHT}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      >
        <Path
          d={`M ${leftRegionWinnerX} ${regionalWinnerCenterY} H ${leftConnectorElbowX} V ${finalFourTopTeamY} H ${leftFinalFourX}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />
        <Path
          d={`M ${leftRegionWinnerX} ${
            bottomRegionY + regionalWinnerCenterY
          } H ${leftConnectorElbowX} V ${finalFourBottomTeamY} H ${leftFinalFourX}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />
        <Path
          d={`M ${rightRegionWinnerX} ${regionalWinnerCenterY} H ${rightConnectorElbowX} V ${finalFourTopTeamY} H ${rightFinalFourX}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />
        <Path
          d={`M ${rightRegionWinnerX} ${
            bottomRegionY + regionalWinnerCenterY
          } H ${rightConnectorElbowX} V ${finalFourBottomTeamY} H ${rightFinalFourX}`}
          fill="none"
          stroke={connectorColor}
          strokeWidth={1}
        />
      </Svg>

      {orderedRegions.map((region, index) => {
        const position = regionPositions[index];

        return (
          <View
            key={region.id}
            style={{
              position: "absolute",
              left: position.left,
              top: position.top,
              zIndex: 1,
            }}
          >
            <RegionBracket
              region={region}
              isDark={isDark}
              league={league}
              direction={position.direction}
            />
          </View>
        );
      })}

      <View
        style={{
          position: "absolute",
          left: centerStageX,
          top: centerStageY,
          zIndex: 1,
        }}
      >
        <NationalStage
          regions={regions}
          finalFourGames={finalFourGames}
          championshipGame={championshipGame}
          isDark={isDark}
          league={league}
        />
      </View>
    </View>
  );
}

export default function TournamentTreeBracket({
  season,
  league = "cbb",
}: TournamentTreeBracketProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = CBBTournamentBracketStyles(isDark);
  const global = globalStyles(isDark);
  const roundHeaderScrollRef = useRef<ScrollView>(null);

  const {
    tournamentName,
    regions,
    openingRoundGames,
    finalFourGames,
    championshipGame,

    loading,
    error,
    refresh,
  } = useTournamentBracket(league, season);

  if (loading && regions.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error && regions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Tournament unavailable</Text>
        <Text style={styles.emptyBody}>{error}</Text>

        <Pressable onPress={() => void refresh()}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={regions.length > 0 ? [2] : undefined}
        contentContainerStyle={styles.verticalScrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.tournamentName}>{tournamentName}</Text>
        </View>

        <FirstFour games={openingRoundGames} isDark={isDark} league={league} />

        <View
          style={{
            height: regions.length > 0 ? BRACKET_LAYOUT.roundTitleHeight : 0,
            zIndex: 20,
            backgroundColor: isDark
              ? Colors.dark.background
              : Colors.light.background,
          }}
        >
          {regions.length > 0 ? (
            <ScrollView
              ref={roundHeaderScrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <BracketRoundHeader isDark={isDark} />
            </ScrollView>
          ) : null}
        </View>

        {regions.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            scrollEventThrottle={16}
            onScroll={(event) => {
              roundHeaderScrollRef.current?.scrollTo({
                x: event.nativeEvent.contentOffset.x,
                animated: false,
              });
            }}
            contentContainerStyle={[
              styles.horizontalScrollContent,
              { paddingHorizontal: 12 },
            ]}
          >
            <TournamentQuadrant
              regions={regions}
              finalFourGames={finalFourGames}
              championshipGame={championshipGame}
              isDark={isDark}
              league={league}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bracket data</Text>
            <Text style={styles.emptyBody}>
              No regional tournament games are available.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
