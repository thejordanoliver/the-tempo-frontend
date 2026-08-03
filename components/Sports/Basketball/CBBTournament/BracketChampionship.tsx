import React, { memo, useMemo } from "react";
import { Image, Text, View } from "react-native";

import { BracketMatchup } from "./BracketMatchup";
import { getBracketTeamLogoSource } from "./BracketTeamRow";
import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketCardLayout,
  BracketGame,
  BracketTeam,
  TournamentBracketCompetition,
} from "./tournamentBracket.types";
import {
  getBracketTeamDisplayName,
  getRenderableBracketTeam,
  getWinningTeam,
  isFinalBracketGame,
} from "./tournamentBracket.utils";

type ChampionshipItem = {
  id: string;
  layout: BracketCardLayout;
  render: () => React.ReactNode;
};

type BracketChampionshipProps = {
  semifinalGames: readonly BracketGame[];
  championshipGame: BracketGame | null;
  semifinalLayouts: readonly BracketCardLayout[];
  championshipLayout: BracketCardLayout;
  columnHeight: number;
  isDark: boolean;
  competition: TournamentBracketCompetition;
  tournamentName: string;
  season: number;
  allGamesById?: ReadonlyMap<string, BracketGame>;
  onGamePress?: (game: BracketGame) => void;
};

function getChampionScoreText(
  team: BracketTeam,
  championshipGame: BracketGame,
) {
  const topTeam = getRenderableBracketTeam(championshipGame.topTeam);
  const bottomTeam = getRenderableBracketTeam(championshipGame.bottomTeam);
  const championScore =
    team.score === null ||
    team.score === undefined ||
    team.score === "" ||
    !Number.isFinite(Number(team.score))
      ? null
      : String(team.score);
  const opponent =
    topTeam?.id === team.id || topTeam?.espnId === team.espnId
      ? bottomTeam
      : topTeam;
  const opponentScore =
    opponent?.score === null ||
    opponent?.score === undefined ||
    opponent?.score === "" ||
    !Number.isFinite(Number(opponent?.score))
      ? null
      : String(opponent?.score);

  return championScore && opponentScore
    ? `${championScore}-${opponentScore}`
    : championScore;
}

function BracketChampionshipComponent({
  semifinalGames,
  championshipGame,
  semifinalLayouts,
  championshipLayout,
  columnHeight,
  isDark,
  competition,
  tournamentName,
  season,
  allGamesById,
  onGamePress,
}: BracketChampionshipProps) {
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const champion =
    championshipGame && isFinalBracketGame(championshipGame)
      ? getWinningTeam(championshipGame)
      : null;
  const championLogo = useMemo(
    () =>
      champion
        ? getBracketTeamLogoSource(champion, competition, isDark)
        : null,
    [champion, competition, isDark],
  );
  const championScoreText =
    champion && championshipGame
      ? getChampionScoreText(champion, championshipGame)
      : null;
  const centerColumnLabel = semifinalGames[0]?.roundLabel ?? "Final Four";

  const items = useMemo<ChampionshipItem[]>(() => {
    const semifinalItems: ChampionshipItem[] = [];

    semifinalGames.forEach((game, index) => {
      const layout = semifinalLayouts[index];
      if (!layout) return;

      semifinalItems.push({
        id: game.id,
        layout,
        render: () => (
          <BracketMatchup
            game={game}
            side="center"
            competition={competition}
            allGamesById={allGamesById}
            onPress={onGamePress}
            style={{
              width: layout.width,
              height: layout.height,
            }}
          />
        ),
      });
    });

    const championshipItem: ChampionshipItem[] = championshipGame
      ? [
          {
            id: championshipGame.id,
            layout: championshipLayout,
            render: () => (
              <BracketMatchup
                game={championshipGame}
                side="center"
                competition={competition}
                allGamesById={allGamesById}
                onPress={onGamePress}
                style={{
                  width: championshipLayout.width,
                  height: championshipLayout.height,
                }}
              />
            ),
          },
        ]
      : [];

    return [...semifinalItems, ...championshipItem].sort(
      (first, second) => first.layout.y - second.layout.y,
    );
  }, [
    allGamesById,
    championshipGame,
    championshipLayout,
    competition,
    onGamePress,
    semifinalGames,
    semifinalLayouts,
  ]);

  let previousBottom = 0;

  return (
    <View style={[styles.championshipColumn, { height: columnHeight }]}>
      <Text numberOfLines={1} style={styles.championshipLabel} selectable>
        {centerColumnLabel}
      </Text>

      {champion && championLogo && championshipGame ? (
        <View
          pointerEvents="none"
          style={[
            styles.championPanelOverlay,
            {
              top: championshipLayout.y + championshipLayout.height + 14,
            },
          ]}
        >
          <View
            style={styles.championPanel}
            accessibilityLabel={`${getBracketTeamDisplayName(
              champion,
            )} ${season} national champion`}
          >
            <Text style={styles.championLabel} selectable>
              National Champion
            </Text>
            <Image
              source={championLogo}
              style={styles.championLogo}
              resizeMode="contain"
            />
            <Text numberOfLines={1} style={styles.championName} selectable>
              {champion.seed ? `${champion.seed} ` : ""}
              {getBracketTeamDisplayName(champion)}
            </Text>
            <Text numberOfLines={1} style={styles.championMeta} selectable>
              {tournamentName}{" "}
              {championScoreText
                ? `Final ${championScoreText}`
                : String(season)}
            </Text>
          </View>
        </View>
      ) : null}

      {items.map((item) => {
        const spacerHeight = Math.max(0, item.layout.y - previousBottom);
        previousBottom = item.layout.y + item.layout.height;

        return (
          <React.Fragment key={item.id}>
            {spacerHeight > 0 ? (
              <View style={{ height: spacerHeight }} />
            ) : null}
            {item.render()}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export const BracketChampionship = memo(BracketChampionshipComponent);
