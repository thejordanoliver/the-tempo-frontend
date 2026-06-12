// components/Bracket/Bracket.tsx

import CFPLogoLight from "@/assets/College_Logos/Conference_Logos/CFPLight.png";
import CFPLogo from "@/assets/College_Logos/Conference_Logos/CFPLogo.png";
import cfpTrophy from "@/assets/College_Logos/Conference_Logos/cfptrophy.webp";
import ChampionTape from "assets/Placeholders/ChampionTape.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getCFBTeamLogo, getTeamByESPNId } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { BracketData } from "types/football";
import { GameCard } from "./GameCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 142;
const LABEL_WIDTH = 200;
const LABEL_TOP = 28;
const H_PAD = 16;
const CHAMPIONSHIP_HEIGHT = 178;
const CARD_WIDTH = 176;
const CANVAS_HEIGHT = 840;
const COL_WIDTH = 220;
const COL_GAP = 20;

const COLS = {
  FIRST_ROUND: 0,
  QUARTERFINALS: 1,
  SEMIFINALS: 2,
  CHAMPIONSHIP: 3,
};

type CardLayout = { x: number; y: number; width: number; height: number };

const getX = (col: number) => H_PAD + col * (COL_WIDTH + COL_GAP);
const getColCenter = (col: number) => getX(col) + COL_WIDTH / 2;
const getCenteredX = (col: number, width: number) =>
  getColCenter(col) - width / 2;
const centerY = (layout: CardLayout) => layout.y + layout.height / 2;
const rightX = (layout: CardLayout) => layout.x + layout.width;

const getCardCenter = (col: number) => {
  if (col === COLS.FIRST_ROUND) return getX(COLS.FIRST_ROUND) + CARD_WIDTH / 2;
  return getColCenter(col);
};

export const CANVAS_WIDTH = H_PAD + 4 * (COL_WIDTH + COL_GAP);

// ─── Card position layouts ────────────────────────────────────────────────────

const FIRST_ROUND_LAYOUTS: CardLayout[] = [
  { x: getX(COLS.FIRST_ROUND), y: 84, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.FIRST_ROUND), y: 254, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.FIRST_ROUND), y: 424, width: CARD_WIDTH, height: CARD_HEIGHT },
  { x: getX(COLS.FIRST_ROUND), y: 594, width: CARD_WIDTH, height: CARD_HEIGHT },
];

const QUARTERFINAL_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.QUARTERFINALS, CARD_WIDTH),
    y: 84,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  {
    x: getCenteredX(COLS.QUARTERFINALS, CARD_WIDTH),
    y: 254,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  {
    x: getCenteredX(COLS.QUARTERFINALS, CARD_WIDTH),
    y: 424,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  {
    x: getCenteredX(COLS.QUARTERFINALS, CARD_WIDTH),
    y: 594,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
];

const SEMIFINAL_LAYOUTS: CardLayout[] = [
  {
    x: getCenteredX(COLS.SEMIFINALS, CARD_WIDTH),
    y: 169,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  {
    x: getCenteredX(COLS.SEMIFINALS, CARD_WIDTH),
    y: 509,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
];

const CHAMPIONSHIP_LAYOUT: CardLayout = {
  x: getCenteredX(COLS.CHAMPIONSHIP, CARD_WIDTH),
  y: 321,
  width: CARD_WIDTH,
  height: CHAMPIONSHIP_HEIGHT,
};

// ─── Champion helper ──────────────────────────────────────────────────────────

function getChampion(bracket: BracketData | null) {
  if (!bracket) return null;

  const game = bracket.championship.games?.[0];
  if (!game || game.status !== "final") return null;

  const { top, bottom } = game;
  if (!top || !bottom) return null;

  return (game.topScore ?? 0) > (game.bottomScore ?? 0) ? top : bottom;
}
// ─── ConnectorLayer ───────────────────────────────────────────────────────────

const ConnectorLayer = React.memo(function ConnectorLayer({
  isDark,
}: {
  isDark: boolean;
}) {
  const lineColor = isDark ? Colors.darkGray : Colors.lightGray;
  const styles = bracketStyles;

  // Straight horizontal bridge: each source card feeds one target at the same Y.
  // Used for First Round → Quarterfinals.
  const renderOneToOne = (source: CardLayout[], target: CardLayout[]) =>
    source.map((layout, i) => {
      const tgt = target[i];
      if (!layout || !tgt) return null;
      return (
        <View
          key={`oto-${i}`}
          style={[
            styles.connectorH,
            {
              left: rightX(layout),
              top: centerY(layout),
              width: tgt.x - rightX(layout),
              backgroundColor: lineColor,
            },
          ]}
        />
      );
    });

  // V-shape merge: every two adjacent source cards funnel into one target.
  // Used for Quarterfinals → Semifinals and Semifinals → Championship.
  const renderPair = (source: CardLayout[], target: CardLayout[]) =>
    source.map((layout, i) => {
      const tgt = target[Math.floor(i / 2)];
      const next = source[i + 1];
      if (!layout || !tgt || !next || i % 2 !== 0) return null;
      const midX = rightX(layout) + (tgt.x - rightX(layout)) / 2;
      return (
        <View key={`pair-${i}`}>
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
          <View
            style={[
              styles.connectorH,
              {
                left: rightX(next),
                top: centerY(next),
                width: midX - rightX(next),
                backgroundColor: lineColor,
              },
            ]}
          />
          <View
            style={[
              styles.connectorV,
              {
                left: midX,
                top: centerY(layout),
                height: centerY(next) - centerY(layout),
                backgroundColor: lineColor,
              },
            ]}
          />
          <View
            style={[
              styles.connectorH,
              {
                left: midX,
                top: centerY(tgt),
                width: tgt.x - midX,
                backgroundColor: lineColor,
              },
            ]}
          />
        </View>
      );
    });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {renderOneToOne(FIRST_ROUND_LAYOUTS, QUARTERFINAL_LAYOUTS)}
      {renderPair(QUARTERFINAL_LAYOUTS, SEMIFINAL_LAYOUTS)}
      {renderPair(SEMIFINAL_LAYOUTS, [CHAMPIONSHIP_LAYOUT])}
    </View>
  );
});

// ─── Round Label ──────────────────────────────────────────────────────────────

const RoundLabel = ({
  title,
  col,
  isDark,
}: {
  title: string;
  col: number;
  isDark: boolean;
}) => {
  const styles = bracketStyles;
  return (
    <Text
      style={[
        styles.roundLabel,
        {
          top: LABEL_TOP,
          left: getCardCenter(col) - LABEL_WIDTH / 2,
          width: LABEL_WIDTH,
        },
      ]}
    >
      {title}
    </Text>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function CFBPlayoffBracket({
  bracket,
  error,
  loading,
  refreshing,
  onRefresh,
}: {
  bracket: BracketData | null;
  error: string | null;
  loading: boolean;
  refreshing: any;
  onRefresh: any;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = bracketStyles;
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const winner = useMemo(() => getChampion(bracket), [bracket]);
  const winnerTeam = getTeamByESPNId(winner?.espnId ?? 0);
  const winnerLogo = getCFBTeamLogo(winnerTeam?.id, isDark);
  const cfpLogo = useMemo(() => (isDark ? CFPLogoLight : CFPLogo), [isDark]);
  const champCenter = getCardCenter(COLS.CHAMPIONSHIP);

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
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View
          style={[
            styles.canvas,
            { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
          ]}
        >
          <RoundLabel
            title="FIRST ROUND"
            col={COLS.FIRST_ROUND}
            isDark={isDark}
          />
          <RoundLabel
            title="QUARTERFINALS"
            col={COLS.QUARTERFINALS}
            isDark={isDark}
          />
          <RoundLabel
            title="SEMIFINALS"
            col={COLS.SEMIFINALS}
            isDark={isDark}
          />

          <View
            style={[
              styles.champLabelRow,
              {
                top: LABEL_TOP,
                left: champCenter - LABEL_WIDTH / 2,
              },
            ]}
          >
            <Image
              source={cfpLogo}
              style={styles.cfpLogo}
              resizeMode="contain"
            />
            <Text style={styles.champLabelText}>{"NATIONAL CHAMPIONSHIP"}</Text>
          </View>

          <ConnectorLayer isDark={isDark} />

          {bracket?.first.games.map((game, i) => {
            const layout = FIRST_ROUND_LAYOUTS[i];
            if (!layout) return null;
            return (
              <View
                key={game?.id}
                style={{
                  position: "absolute",
                  left: layout.x,
                  top: layout.y,
                  width: layout.width,
                }}
              >
                <GameCard game={game} round={bracket.first.title} />
              </View>
            );
          })}

          {bracket?.quarterfinal.games.map((game, i) => {
            const layout = QUARTERFINAL_LAYOUTS[i];
            if (!layout) return null;
            return (
              <View
                key={game?.id}
                style={{
                  position: "absolute",
                  left: layout.x,
                  top: layout.y,
                  width: layout.width,
                }}
              >
                <GameCard game={game} round={bracket?.quarterfinal.title} />
              </View>
            );
          })}

          {bracket?.semifinal.games.map((game, i) => {
            const layout = SEMIFINAL_LAYOUTS[i];
            if (!layout) return null;
            return (
              <View
                key={game?.id}
                style={{
                  position: "absolute",
                  left: layout.x,
                  top: layout.y,
                  width: layout.width,
                }}
              >
                <GameCard game={game} round={bracket.semifinal.title} />
              </View>
            );
          })}

          {bracket?.championship.games[0] && (
            <View
              style={{
                position: "absolute",
                left: CHAMPIONSHIP_LAYOUT.x,
                top: CHAMPIONSHIP_LAYOUT.y,
                width: CHAMPIONSHIP_LAYOUT.width,
              }}
            >
              <GameCard
                game={bracket.championship.games[0]}
                round={bracket.championship.title}
              />
            </View>
          )}

          {winner?.id && (
            <>
              <Image source={ChampionTape} style={styles.championTape} />
              {winnerLogo && (
                <Image source={winnerLogo} style={styles.winnerLogo} />
              )}
              <Image source={cfpTrophy} style={styles.trophy} />
            </>
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const bracketStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  canvas: {
    position: "relative",
  },
  connectorH: {
    position: "absolute",
    height: 2,
  },
  connectorV: {
    position: "absolute",
    width: 2,
  },
  // position: "absolute" is required so that top/left props take effect
  roundLabel: {
    position: "absolute",
    fontFamily: Fonts.OSBOLD,
    fontSize: 18,
    color: Colors.midTone,
    textAlign: "center",
    textTransform: "uppercase",
  },
  champLabelRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  champLabelText: {
    fontFamily: Fonts.OSBOLD,
    fontSize: 18,
    color: Colors.midTone,
    textAlign: "center",
    textTransform: "uppercase",
    flexShrink: 1,
  },
  cfpLogo: {
    width: 22,
    height: 22,
    marginRight: 5,
  },
  trophy: {
    position: "absolute",
    height: 180,
    resizeMode: "contain",
    zIndex: -2,
    right: -160,
    top: 144,
  },
  winnerLogo: {
    position: "absolute",
    height: 200,
    resizeMode: "contain",
    transform: [{ rotate: "-12deg" }],
    zIndex: -10,
    right: -120,
    top: 90,
  },
  championTape: {
    position: "absolute",
    height: 35,
    resizeMode: "contain",
    transform: [{ rotate: "-4deg" }],
    zIndex: -1,
    right: -350,
    top: 270,
  },
});
