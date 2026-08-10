import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import {
  getCBBTeam,
  getCBBTeamByESPNId,
  getCBBTeamLogo,
} from "constants/teamsCBB";
import {
  getWCBBTeamLogo,
  getWCBBTeamLogoFromGameTeam,
  resolveWCBBTeamFromGameTeam,
} from "constants/teamsWCBB";
import React, { memo, useMemo } from "react";
import type { ImageSourcePropType, StyleProp, TextStyle } from "react-native";
import { Image, Text, View } from "react-native";

import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketGame,
  BracketTeam,
  TournamentBracketCompetition,
} from "./tournamentBracket.types";
import {
  getBracketTeamDisplayName,
  getPlaceholderTeamLabel,
  getRenderableBracketTeam,
} from "./tournamentBracket.utils";

type BracketTeamRowProps = {
  game: BracketGame;
  team: BracketTeam | null;
  position: "top" | "bottom";
  isDark: boolean;
  competition: TournamentBracketCompetition;
  allGamesById?: ReadonlyMap<string, BracketGame>;
  isWinner?: boolean;
  isLoser?: boolean;
};

export const getBracketTeamLogoSource = (
  team: BracketTeam | null,
  competition: TournamentBracketCompetition,
  isDark: boolean,
): ImageSourcePropType => {
  const displayTeam = getRenderableBracketTeam(team);
  if (!displayTeam) return PlaceholderLogo;

  const isWCBB = competition === "WCBB";
  if (isWCBB) {
    const localTeam = resolveWCBBTeamFromGameTeam(displayTeam);

    if (localTeam) {
      return getWCBBTeamLogo(localTeam, isDark);
    }

    return getWCBBTeamLogoFromGameTeam(displayTeam, isDark);
  }

  const teamByLocalId = getCBBTeam(displayTeam.id, false);

  const teamByEspnId =
    displayTeam.espnId != null
      ? getCBBTeamByESPNId(displayTeam.espnId)
      : undefined;
  const teamByIdAsEspn =
    displayTeam.id != null ? getCBBTeamByESPNId(displayTeam.id) : undefined;
  const localTeam = teamByLocalId ?? teamByEspnId ?? teamByIdAsEspn;
  const localId = localTeam?.id;

  return getCBBTeamLogo(localId ?? displayTeam.id, isDark, false);
};

const getScoreText = (team: BracketTeam | null) => {
  const displayTeam = getRenderableBracketTeam(team);
  if (
    !displayTeam ||
    displayTeam.score === null ||
    displayTeam.score === undefined ||
    displayTeam.score === ""
  ) {
    return "";
  }

  const score = Number(displayTeam.score);

  return Number.isFinite(score) ? String(displayTeam.score) : "";
};

function BracketTeamRowComponent({
  game,
  team,
  position,
  isDark,
  competition,
  allGamesById,
  isWinner = false,
  isLoser = false,
}: BracketTeamRowProps) {
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const displayTeam = getRenderableBracketTeam(team);
  const logoSource = useMemo(
    () => getBracketTeamLogoSource(displayTeam, competition, isDark),
    [competition, displayTeam, isDark],
  );
  const name = displayTeam
    ? getBracketTeamDisplayName(displayTeam)
    : allGamesById
      ? getPlaceholderTeamLabel(game, position, allGamesById)
      : getPlaceholderTeamLabel(game, position);
  const seedText =
    displayTeam?.seed !== null && displayTeam?.seed !== undefined
      ? String(displayTeam.seed)
      : "";
  const scoreText = getScoreText(displayTeam);
  const recordText = displayTeam?.record?.trim() || null;
  const textStyle: StyleProp<TextStyle> = [
    styles.teamName,
    !displayTeam ? styles.placeholderName : null,
    isWinner ? styles.winnerText : null,
    isLoser ? styles.loserText : null,
  ];
  const scoreStyle: StyleProp<TextStyle> = [
    styles.teamScore,
    isWinner ? styles.winnerText : null,
    isLoser ? styles.loserText : null,
  ];

  return (
    <View style={styles.teamRow}>
      <Text style={styles.seedText} selectable>
        {seedText}
      </Text>
      <Image source={logoSource} style={styles.teamLogo} resizeMode="contain" />
      <View style={styles.teamNameWrap}>
        <Text numberOfLines={1} style={textStyle} selectable>
          {name}
        </Text>
        {recordText ? (
          <Text numberOfLines={1} style={styles.teamRecord} selectable>
            {recordText}
          </Text>
        ) : null}
      </View>
      <Text numberOfLines={1} style={scoreStyle} selectable>
        {scoreText}
      </Text>
    </View>
  );
}

export const BracketTeamRow = memo(BracketTeamRowComponent);
