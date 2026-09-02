import { Colors } from "constants/styles";
import React, { memo, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import { CARD_HEIGHT, CARD_WIDTH, CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";
import { BracketChampionship } from "./BracketChampionship";
import { BracketConnectors } from "./BracketConnectors";
import { BracketRegion } from "./BracketRegion";
import { OpeningRoundSection } from "./OpeningRoundSection";
import type {
  BracketCardLayout,
  BracketConnectionLayout,
  BracketGame,
  BracketLayoutConfig,
  BracketPathConnectionLayout,
  BracketRegion as BracketRegionData,
  BracketRegionLayout,
  TournamentBracketData,
  TournamentRound,
} from "./tournamentBracket.types";
import {
  BRACKET_LAYOUT,
  REGIONAL_ROUNDS,
  REGIONAL_ROUND_BASE_COUNTS,
  getBracketRegionPlacement,
  getRegionalGameCenterY,
  getRegionalRoundBaseSlots,
  getTournamentSourceGameIds,
  groupGamesByRound,
  orderFinalFourGamesForChampionship,
} from "./tournamentBracket.utils";

type TournamentBracketCanvasProps = {
  tournament: TournamentBracketData;
  isDark: boolean;
  allGamesById: ReadonlyMap<string, BracketGame>;
  onGamePress?: (game: BracketGame) => void;
};

type RegionSlot = "leftTop" | "leftBottom" | "rightTop" | "rightBottom";

type PositionedChampion = {
  game: BracketGame;
  layout: BracketCardLayout;
  side: "left" | "right";
  slot: RegionSlot;
};

type BracketBoardLayout = {
  width: number;
  height: number;
  regionWidth: number;
  topBandHeight: number;
  bottomBandHeight: number;
  regionLayouts: Partial<Record<RegionSlot, BracketRegionLayout>>;
  semifinalGames: BracketGame[];
  semifinalLayouts: BracketCardLayout[];
  championshipLayout: BracketCardLayout;
  regionalConnections: BracketConnectionLayout[];
  centerConnections: BracketPathConnectionLayout[];
  championshipConnection: {
    sourceLayouts: readonly [BracketCardLayout, BracketCardLayout];
    targetLayout: BracketCardLayout;
  } | null;
};

const getRoundIndex = (round: TournamentRound) =>
  Math.max(0, REGIONAL_ROUNDS.indexOf(round));

const getCardCenterY = (layout: BracketCardLayout) =>
  layout.y + layout.height / 2;

const getNumericSlot = (game: BracketGame, fallbackSlot: number): number => {
  const value = game.bracketSlot ?? game.gameOrder ?? fallbackSlot;
  const slot = Number(value);

  return Number.isFinite(slot) && slot > 0 ? slot : fallbackSlot;
};

const getRegionWidth = (config: BracketLayoutConfig) =>
  REGIONAL_ROUNDS.length * config.roundColumnWidth +
  (REGIONAL_ROUNDS.length - 1) * config.horizontalRoundGap;

const getCardX = (
  side: "left" | "right",
  round: TournamentRound,
  config: BracketLayoutConfig,
) => {
  const chronologicalIndex = getRoundIndex(round);
  const visualIndex =
    side === "right"
      ? REGIONAL_ROUNDS.length - 1 - chronologicalIndex
      : chronologicalIndex;

  return (
    visualIndex * (config.roundColumnWidth + config.horizontalRoundGap) +
    (config.roundColumnWidth - CARD_WIDTH) / 2
  );
};

const getRegionBaseSlotCount = (
  region: BracketRegionData | null | undefined,
) => {
  if (!region) return REGIONAL_ROUND_BASE_COUNTS.ROUND_OF_64;

  const groupedGames = groupGamesByRound(region.games);

  return REGIONAL_ROUNDS.reduce((maxSlots, round) => {
    const baseSlotsPerGame = getRegionalRoundBaseSlots(round);
    const roundGames = groupedGames[round];
    const largestSlot = roundGames.reduce((slotMax, game, index) => {
      const slot = getNumericSlot(game, index + 1);
      return Math.max(slotMax, slot);
    }, roundGames.length);

    return Math.max(maxSlots, largestSlot * baseSlotsPerGame);
  }, REGIONAL_ROUND_BASE_COUNTS.ROUND_OF_64);
};

const getRegionContentHeight = (
  region: BracketRegionData | null | undefined,
  config: BracketLayoutConfig,
) => {
  const baseSlotCount = getRegionBaseSlotCount(region);

  return (
    baseSlotCount * CARD_HEIGHT +
    Math.max(0, baseSlotCount - 1) * config.baseVerticalGap
  );
};

const getRegionHeight = (
  region: BracketRegionData | null | undefined,
  config: BracketLayoutConfig,
) =>
  config.regionHeaderHeight +
  config.roundTitleHeight +
  getRegionContentHeight(region, config);

const getSourceLayouts = (
  sourceGames: readonly BracketGame[],
  targetGame: BracketGame,
  allPreviousLayouts: ReadonlyMap<string, BracketCardLayout>,
) => {
  return getTournamentSourceGameIds(targetGame, sourceGames)
    .map((sourceId) => allPreviousLayouts.get(sourceId) ?? null)
    .filter((layout): layout is BracketCardLayout => Boolean(layout));
};

const getFallbackCardLayout = (
  round: TournamentRound,
  game: BracketGame,
  index: number,
  side: "left" | "right",
  config: BracketLayoutConfig,
) => {
  const slot = getNumericSlot(game, index + 1);
  const centerY = getRegionalGameCenterY(round, slot, config);

  return {
    x: getCardX(side, round, config),
    y: centerY - CARD_HEIGHT / 2,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  };
};

const createRegionLayout = ({
  region,
  slot,
  x,
  y,
  config,
}: {
  region: BracketRegionData;
  slot: RegionSlot;
  x: number;
  y: number;
  config: BracketLayoutConfig;
}): BracketRegionLayout => {
  const side = slot.startsWith("left") ? "left" : "right";
  const groupedGames = groupGamesByRound(region.games);
  const contentHeight = getRegionContentHeight(region, config);
  const localGameLayouts = new Map<string, BracketCardLayout>();
  const globalGameLayouts = new Map<string, BracketCardLayout>();
  const roundLayouts = {} as BracketRegionLayout["roundLayouts"];
  const globalRoundLayouts = {} as BracketRegionLayout["globalRoundLayouts"];

  REGIONAL_ROUNDS.forEach((round, roundIndex) => {
    const sourceRound = REGIONAL_ROUNDS[roundIndex - 1];
    const sourceGames = sourceRound ? groupedGames[sourceRound] : [];
    roundLayouts[round] = groupedGames[round].map((game, index) => {
      const fallbackLayout = getFallbackCardLayout(
        round,
        game,
        index,
        side,
        config,
      );
      const sourceCardLayouts =
        roundIndex > 0
          ? getSourceLayouts(sourceGames, game, localGameLayouts)
          : [];
      const layout =
        sourceCardLayouts.length >= 2
          ? {
              ...fallbackLayout,
              y:
                (getCardCenterY(sourceCardLayouts[0]) +
                  getCardCenterY(sourceCardLayouts[1])) /
                  2 -
                CARD_HEIGHT / 2,
            }
          : fallbackLayout;
      const globalLayout = {
        ...layout,
        x: x + layout.x,
        y: y + config.regionHeaderHeight + config.roundTitleHeight + layout.y,
      };

      localGameLayouts.set(game.id, layout);
      globalGameLayouts.set(game.id, globalLayout);

      return layout;
    });

    globalRoundLayouts[round] = groupedGames[round]
      .map((game) => globalGameLayouts.get(game.id))
      .filter((layout): layout is BracketCardLayout => Boolean(layout));
  });

  const championGame = groupedGames.ELITE_8[0] ?? null;

  return {
    region: {
      ...region,
      side,
      verticalPosition: slot.endsWith("Top") ? "top" : "bottom",
    },
    x,
    y,
    width: getRegionWidth(config),
    height: getRegionHeight(region, config),
    contentHeight,
    side,
    roundLayouts,
    globalRoundLayouts,
    gameLayouts: globalGameLayouts,
    championLayout: championGame
      ? (globalGameLayouts.get(championGame.id) ?? null)
      : null,
  };
};

const getRegionChampion = (
  slot: RegionSlot,
  regionLayout?: BracketRegionLayout,
): PositionedChampion | null => {
  if (!regionLayout?.championLayout) return null;

  const championGame = groupGamesByRound(regionLayout.region.games).ELITE_8[0];
  if (!championGame) return null;

  return {
    game: championGame,
    layout: regionLayout.championLayout,
    side: regionLayout.side,
    slot,
  };
};

const createRegionalConnections = (
  regionLayout: BracketRegionLayout,
): BracketConnectionLayout[] => {
  const groupedGames = groupGamesByRound(regionLayout.region.games);
  const direction = regionLayout.side === "left" ? "forward" : "reverse";

  return REGIONAL_ROUNDS.slice(0, -1).flatMap((round, roundIndex) => {
    const nextRound = REGIONAL_ROUNDS[roundIndex + 1];
    const sourceGames = groupedGames[round];
    const targetGames = groupedGames[nextRound];
    const targetLayouts = regionLayout.globalRoundLayouts[nextRound] ?? [];

    return targetGames
      .map((targetGame, targetIndex) => {
        const targetLayout = targetLayouts[targetIndex];
        const sources = getSourceLayouts(
          sourceGames,
          targetGame,
          regionLayout.gameLayouts,
        );

        if (!targetLayout || sources.length < 2) return null;

        return {
          id: `${regionLayout.region.id}-${round}-${targetGame.id}`,
          direction,
          sourceLayouts: [sources[0], sources[1]] as const,
          targetLayout,
        };
      })
      .filter((connection): connection is BracketConnectionLayout =>
        Boolean(connection),
      );
  });
};

const buildBoardLayout = (
  tournament: TournamentBracketData,
  config: BracketLayoutConfig,
): BracketBoardLayout => {
  const placement = getBracketRegionPlacement(tournament.regions);
  const regionWidth = getRegionWidth(config);
  const centerWidth = config.centerColumnWidth;
  const leftX = 0;
  const centerX = regionWidth + config.centerGap;
  const rightX = centerX + centerWidth + config.centerGap;
  const defaultRegionHeight = getRegionHeight(null, config);
  const topBandHeight = Math.max(
    defaultRegionHeight,
    getRegionHeight(placement.leftTop, config),
    getRegionHeight(placement.rightTop, config),
  );
  const hasBottomBand = Boolean(
    placement.leftBottom ||
    placement.rightBottom ||
    tournament.finalFourGames.length > 1,
  );
  const bottomBandHeight = hasBottomBand
    ? Math.max(
        defaultRegionHeight,
        getRegionHeight(placement.leftBottom, config),
        getRegionHeight(placement.rightBottom, config),
      )
    : 0;
  const bottomY = hasBottomBand ? topBandHeight + config.regionGap : 0;
  const height =
    topBandHeight + (hasBottomBand ? config.regionGap + bottomBandHeight : 0);
  const width = regionWidth * 2 + centerWidth + config.centerGap * 2;
  const regionLayouts: Partial<Record<RegionSlot, BracketRegionLayout>> = {};

  if (placement.leftTop) {
    regionLayouts.leftTop = createRegionLayout({
      region: placement.leftTop,
      slot: "leftTop",
      x: leftX,
      y: 0,
      config,
    });
  }

  if (placement.rightTop) {
    regionLayouts.rightTop = createRegionLayout({
      region: placement.rightTop,
      slot: "rightTop",
      x: rightX,
      y: 0,
      config,
    });
  }

  if (placement.leftBottom) {
    regionLayouts.leftBottom = createRegionLayout({
      region: placement.leftBottom,
      slot: "leftBottom",
      x: leftX,
      y: bottomY,
      config,
    });
  }

  if (placement.rightBottom) {
    regionLayouts.rightBottom = createRegionLayout({
      region: placement.rightBottom,
      slot: "rightBottom",
      x: rightX,
      y: bottomY,
      config,
    });
  }

  const champions = (
    [
      ["leftTop", regionLayouts.leftTop],
      ["rightTop", regionLayouts.rightTop],
      ["leftBottom", regionLayouts.leftBottom],
      ["rightBottom", regionLayouts.rightBottom],
    ] as const
  )
    .map(([slot, regionLayout]) => getRegionChampion(slot, regionLayout))
    .filter((champion): champion is PositionedChampion => Boolean(champion));
  const championByGameId = new Map(
    champions.map((champion) => [champion.game.id, champion] as const),
  );
  const championGames = champions.map((champion) => champion.game);
  const semifinalGames = orderFinalFourGamesForChampionship(
    tournament.finalFourGames,
    tournament.championshipGame,
  );
  const centerCardWidth = Math.min(
    config.centerColumnWidth,
    CARD_WIDTH + 22,
  );
  const centerCardX = centerX + (centerWidth - centerCardWidth) / 2;
  const semifinalLayouts = semifinalGames.map((_, index) => {
    const semifinalCenterY =
      index === 0
        ? topBandHeight / 2
        : bottomY + Math.max(1, bottomBandHeight) / 2;

    return {
      x: centerCardX,
      y: semifinalCenterY - CARD_HEIGHT / 2,
      width: centerCardWidth,
      height: CARD_HEIGHT,
    };
  });
  const semifinalLayoutByGameId = new Map(
    semifinalGames.map((game, index) => [game.id, semifinalLayouts[index]]),
  );
  const championshipSourceLayouts = tournament.championshipGame
    ? getTournamentSourceGameIds(tournament.championshipGame, semifinalGames)
        .map((sourceId) => semifinalLayoutByGameId.get(sourceId))
        .filter((cardLayout): cardLayout is BracketCardLayout =>
          Boolean(cardLayout),
        )
    : [];
  const championshipCenterY =
    championshipSourceLayouts.length > 0
      ? championshipSourceLayouts.reduce(
          (sum, cardLayout) => sum + getCardCenterY(cardLayout),
          0,
        ) / championshipSourceLayouts.length
      : height / 2;
  const championshipHeight = CARD_HEIGHT + 10;
  const championshipLayout = {
    x: centerCardX,
    y: championshipCenterY - championshipHeight / 2,
    width: centerCardWidth,
    height: championshipHeight,
  };
  const regionalConnections = Object.values(regionLayouts).flatMap(
    (regionLayout) =>
      regionLayout ? createRegionalConnections(regionLayout) : [],
  );
  const centerConnections = semifinalGames.flatMap((game, semifinalIndex) => {
    const sources = getTournamentSourceGameIds(game, championGames)
      .map((sourceId) => championByGameId.get(sourceId))
      .filter((champion): champion is PositionedChampion => Boolean(champion));
    const targetLayout = semifinalLayouts[semifinalIndex];

    if (!targetLayout) return [];

    return sources.map((source) => ({
      id: `center-${game.id}-${source.game.id}`,
      direction:
        source.side === "left" ? ("forward" as const) : ("reverse" as const),
      sourceLayout: source.layout,
      targetLayout,
    }));
  });
  const championshipConnection =
    championshipSourceLayouts.length === 2 && tournament.championshipGame
      ? {
          sourceLayouts: [
            championshipSourceLayouts[0],
            championshipSourceLayouts[1],
          ] as const,
          targetLayout: championshipLayout,
        }
      : null;

  return {
    width,
    height,
    regionWidth,
    topBandHeight,
    bottomBandHeight,
    regionLayouts,
    semifinalGames,
    semifinalLayouts,
    championshipLayout,
    regionalConnections,
    centerConnections,
    championshipConnection,
  };
};

function TournamentBracketCanvasComponent({
  tournament,
  isDark,
  allGamesById,
  onGamePress,
}: TournamentBracketCanvasProps) {
  const { width: viewportWidth } = useWindowDimensions();
  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);
  const layout = useMemo(
    () => buildBoardLayout(tournament, BRACKET_LAYOUT),
    [tournament],
  );
  const lineColor = isDark
    ? Colors.transparentDarkGray
    : Colors.transparentLightGray;
  const contentWidth = Math.max(viewportWidth, layout.width + 32);
  const hasBottomBand = layout.bottomBandHeight > 0;

  return (
    <View style={{ width: contentWidth, alignItems: "center" }}>
      <OpeningRoundSection
        label={tournament.openingRoundLabel ?? "First Four"}
        games={tournament.openingRoundGames}
        isDark={isDark}
        competition={tournament.competition}
        regions={tournament.regions}
        allGamesById={allGamesById}
        onGamePress={onGamePress}
        width={layout.width}
      />

      <View
        style={[
          styles.bracketBoard,
          {
            width: layout.width,
            height: layout.height,
          },
        ]}
      >
        <BracketConnectors
          width={layout.width}
          height={layout.height}
          connections={layout.regionalConnections}
          pathConnections={layout.centerConnections}
          championshipConnection={layout.championshipConnection}
          lineColor={lineColor}
          lineWidth={BRACKET_LAYOUT.connectorLineWidth}
        />

        <View style={styles.bracketColumns}>
          <View
            style={[
              styles.sideRegionStack,
              {
                width: layout.regionWidth,
                height: layout.height,
              },
            ]}
          >
            <View style={{ height: layout.topBandHeight }}>
              {layout.regionLayouts.leftTop ? (
                <BracketRegion
                  layout={layout.regionLayouts.leftTop}
                  isDark={isDark}
                  competition={tournament.competition}
                  allGamesById={allGamesById}
                  onGamePress={onGamePress}
                />
              ) : null}
            </View>

            {hasBottomBand ? (
              <View style={{ height: BRACKET_LAYOUT.regionGap }} />
            ) : null}

            {hasBottomBand ? (
              <View style={{ height: layout.bottomBandHeight }}>
                {layout.regionLayouts.leftBottom ? (
                  <BracketRegion
                    layout={layout.regionLayouts.leftBottom}
                    isDark={isDark}
                    competition={tournament.competition}
                    allGamesById={allGamesById}
                    onGamePress={onGamePress}
                  />
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={{ width: BRACKET_LAYOUT.centerGap }} />

          <BracketChampionship
            semifinalGames={layout.semifinalGames}
            championshipGame={tournament.championshipGame}
            semifinalLayouts={layout.semifinalLayouts}
            championshipLayout={layout.championshipLayout}
            columnHeight={layout.height}
            isDark={isDark}
            competition={tournament.competition}
            tournamentName={tournament.tournamentName}
            season={tournament.season}
            allGamesById={allGamesById}
            onGamePress={onGamePress}
          />

          <View style={{ width: BRACKET_LAYOUT.centerGap }} />

          <View
            style={[
              styles.sideRegionStack,
              {
                width: layout.regionWidth,
                height: layout.height,
              },
            ]}
          >
            <View style={{ height: layout.topBandHeight }}>
              {layout.regionLayouts.rightTop ? (
                <BracketRegion
                  layout={layout.regionLayouts.rightTop}
                  isDark={isDark}
                  competition={tournament.competition}
                  allGamesById={allGamesById}
                  onGamePress={onGamePress}
                />
              ) : null}
            </View>

            {hasBottomBand ? (
              <View style={{ height: BRACKET_LAYOUT.regionGap }} />
            ) : null}

            {hasBottomBand ? (
              <View style={{ height: layout.bottomBandHeight }}>
                {layout.regionLayouts.rightBottom ? (
                  <BracketRegion
                    layout={layout.regionLayouts.rightBottom}
                    isDark={isDark}
                    competition={tournament.competition}
                    allGamesById={allGamesById}
                    onGamePress={onGamePress}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

export const TournamentBracketCanvas = memo(TournamentBracketCanvasComponent);
