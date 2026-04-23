import NFLPlayoffsLogo from "assets/Football/NFL_Logos/NFLPlayoffsLogo.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { nflPlayoffBracketStyles } from "styles/NFLPlayoffBracketStyles";
import type {
  Matchup,
  NFLPlayoffBracket,
  NFLPlayoffTeam,
} from "types/football";

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
};

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const getX = (col: number) => col * (COL_WIDTH + COL_GAP);
export const CANVAS_WIDTH = getX(COLS.NFC_R1) + CARD_WIDTH;
export const CANVAS_HEIGHT = 840;

export const SIDE_LABEL_TOP = CANVAS_HEIGHT / 2 - 22;

export const getColCenter = (col: number) => getX(col) + CARD_WIDTH / 2;

export const getCenteredX = (col: number, width: number) =>
  getColCenter(col) - width / 2;

const TeamRow = ({
  team,
  score,
  status,
  isDark,
}: {
  team?: NFLPlayoffTeam;
  score: number | null;
  status: "winner" | "loser" | "tied";
  isDark: boolean;
}) => {
  const styles = nflPlayoffBracketStyles(isDark);
  const teamId = team?.id ?? 0;
  const teamLogo = getNFLTeamLogo(teamId, isDark);
  const teamData = getNFLTeam(teamId);
  const teamName = teamData?.code ?? "TBD";

  const eliminated = !team || status === "loser" ? 0.5 : 1;

  return (
    <View style={styles.teamRow}>
      <Text style={[styles.seedText, { opacity: eliminated }]}>
        {team?.seed ?? "-"}
      </Text>

      <Image
        source={teamLogo}
        style={[styles.teamLogo, { opacity: eliminated }]}
        resizeMode="contain"
      />

      <Text
        numberOfLines={1}
        style={[styles.teamCode, { opacity: eliminated }]}
      >
        {teamName}
      </Text>

      {score !== null && (
        <View style={styles.winsBadge}>
          <Text style={[styles.score, { opacity: eliminated }]}>{score}</Text>
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
  matchup: Matchup;
  layout: CardLayout;
  isDark: boolean;
  finals?: boolean;
}) => {
  const styles = nflPlayoffBracketStyles(isDark);
  const game = matchup.games?.[0];

  const topTeam = matchup.teams.top;
  const bottomTeam = matchup.teams.bottom;

  const getScoreForTeam = (teamId: number) => {
    if (!game) return null;

    if (game.teams.home.id === teamId) return game.scores.home.total;
    if (game.teams.away.id === teamId) return game.scores.away.total;

    return null;
  };

  const topScore = getScoreForTeam(topTeam.id);
  const bottomScore = getScoreForTeam(bottomTeam.id);

  const winnerId = matchup.winner;

  const getStatus = (id: number): "winner" | "loser" | "tied" => {
    if (!winnerId) return "tied";
    return id === winnerId ? "winner" : "loser";
  };

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
        team={topTeam}
        score={topScore}
        status={getStatus(topTeam.id)}
        isDark={isDark}
      />
      <View style={styles.divider} />
      <TeamRow
        team={bottomTeam}
        score={bottomScore}
        status={getStatus(bottomTeam.id)}
        isDark={isDark}
      />
    </View>
  );
};

const centerY = (l?: CardLayout) => (l ? l.y + l.height / 2 : 0);

const SLOT_36 = 0;
const SLOT_27 = 1;
const SLOT_45 = 2;
const R1_SLOT_COUNT = 3;

const SLOT_TO_R2: Record<number, 0 | 1> = {
  [SLOT_36]: 0,
  [SLOT_27]: 1,
  [SLOT_45]: 1,
};

const getR1Slot = (m: Matchup): number | null => {
  const a = m.teams.top.seed;
  const b = m.teams.bottom.seed;
  if (a == null || b == null) return null;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (lo === 3 && hi === 6) return SLOT_36;
  if (lo === 2 && hi === 7) return SLOT_27;
  if (lo === 4 && hi === 5) return SLOT_45;
  return null;
};

const assignR1Slots = (wildCard: Matchup[]): (Matchup | undefined)[] => {
  const slots: (Matchup | undefined)[] = Array.from({ length: R1_SLOT_COUNT });
  const leftover: Matchup[] = [];

  wildCard.forEach((m) => {
    const slot = getR1Slot(m);
    if (slot !== null && slots[slot] === undefined) {
      slots[slot] = m;
    } else {
      leftover.push(m);
    }
  });

  // Fill any unfilled slots with leftover matchups (rare fallback).
  for (let i = 0; i < slots.length && leftover.length > 0; i++) {
    if (slots[i] === undefined) slots[i] = leftover.shift();
  }
  return slots;
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
  const styles = nflPlayoffBracketStyles(isDark);

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

const ConnectorLayer = ({
  isDark,
  r1Slots,
  r2,
  r3,
  finals,
}: {
  isDark: boolean;
  r1Slots: (CardLayout | undefined)[];
  r2: CardLayout[];
  r3: CardLayout;
  finals: CardLayout;
}) => {
  const lineColor = isDark ? Colors.darkGray : Colors.lightGray;
  const styles = nflPlayoffBracketStyles(isDark);

  const connectOneToOne = (key: string, src?: CardLayout, tgt?: CardLayout) => {
    if (!src || !tgt) return null;

    const srcRight = src.x + src.width;
    const srcLeft = src.x;

    const tgtRight = tgt.x + tgt.width;
    const tgtLeft = tgt.x;

    const isRightToLeft = src.x > tgt.x;

    const x1 = isRightToLeft ? srcLeft : srcRight;
    const x2 = isRightToLeft ? tgtRight : tgtLeft;

    const y1 = centerY(src);
    const y2 = centerY(tgt);
    const midX = (x1 + x2) / 2;

    return (
      <View key={key}>
        {/* horizontal from source */}
        <View
          style={[
            styles.connectorH,
            {
              left: Math.min(x1, midX),
              top: y1,
              width: Math.abs(midX - x1),
              backgroundColor: lineColor,
            },
          ]}
        />

        {/* vertical */}
        <View
          style={[
            styles.connectorV,
            {
              left: midX,
              top: Math.min(y1, y2),
              height: Math.abs(y1 - y2),
              backgroundColor: lineColor,
            },
          ]}
        />

        {/* horizontal to target */}
        <View
          style={[
            styles.connectorH,
            {
              left: Math.min(midX, x2),
              top: y2,
              width: Math.abs(x2 - midX),
              backgroundColor: lineColor,
            },
          ]}
        />
      </View>
    );
  };
  const connectors = useMemo(
    () => (
      <>
        {r1Slots.map((l, slot) =>
          connectOneToOne(`r1-${slot}`, l, r2[SLOT_TO_R2[slot]]),
        )}
        {r2.map((l, i) => connectOneToOne(`r2-${i}`, l, r3))}
        {connectOneToOne("r3-finals", r3, finals)}
      </>
    ),
    [r1Slots, r2, r3, finals],
  );
  return <>{connectors}</>;
};

export function NFLPlayoffBracket({
  bracket,
  loading,
  error,
  refreshing,
  onRefresh,
}: {
  bracket: NFLPlayoffBracket | null;
  loading: boolean;
  error: string | null;
  refreshing: any;
  onRefresh: any;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => nflPlayoffBracketStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  // R1 slot positions (canonical: slot 0 = top/3-6, slot 1 = mid/2-7, slot 2 = bottom/4-5).
  const AFC_R1_SLOTS = useMemo(() => {
    const startY = 120;
    const gap = 170;
    return Array.from({ length: R1_SLOT_COUNT }).map((_, i) => ({
      x: getX(COLS.AFC_R1),
      y: startY + i * gap,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }));
  }, []);

  const NFC_R1_SLOTS = useMemo(
    () => AFC_R1_SLOTS.map((l) => ({ ...l, x: getX(COLS.NFC_R1) })),
    [AFC_R1_SLOTS],
  );

  const AFC_R2 = useMemo(
    () => [
      {
        x: getCenteredX(COLS.AFC_R2, CARD_WIDTH),
        y: AFC_R1_SLOTS[SLOT_36].y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
      {
        x: getCenteredX(COLS.AFC_R2, CARD_WIDTH),
        y: (AFC_R1_SLOTS[SLOT_27].y + AFC_R1_SLOTS[SLOT_45].y) / 2,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    ],
    [AFC_R1_SLOTS],
  );

  const NFC_R2 = useMemo(
    () =>
      AFC_R2.map((l) => ({ ...l, x: getCenteredX(COLS.NFC_R2, CARD_WIDTH) })),
    [AFC_R2],
  );

  const AFC_R3 = useMemo(
    () => ({
      x: getCenteredX(COLS.AFC_R3, CARD_WIDTH),
      y: (AFC_R2[0].y + AFC_R2[1].y) / 2,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }),
    [AFC_R2],
  );

  const NFC_R3 = useMemo(
    () => ({ ...AFC_R3, x: getCenteredX(COLS.NFC_R3, CARD_WIDTH) }),
    [AFC_R3],
  );

  const FINALS_LAYOUT: CardLayout = {
    x: getCenteredX(COLS.FINALS, FINALS_WIDTH),
    y:
      (AFC_R3.y + AFC_R3.height / 2 + (NFC_R3.y + NFC_R3.height / 2)) / 2 -
      FINALS_HEIGHT / 2,
    width: FINALS_WIDTH,
    height: FINALS_HEIGHT,
  };

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  if (!bracket) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No NFL playoff bracket available.</Text>
      </View>
    );
  }

  // Assign each wildcard matchup to its canonical R1 slot by seeds.
  const afcR1BySlot = assignR1Slots(bracket.afc.wildCard);
  const nfcR1BySlot = assignR1Slots(bracket.nfc.wildCard);

  // For the connector layer, only pass layouts for slots that actually have a matchup.
  const afcR1LayoutsForConnectors = afcR1BySlot.map((m, i) =>
    m ? AFC_R1_SLOTS[i] : undefined,
  );
  const nfcR1LayoutsForConnectors = nfcR1BySlot.map((m, i) =>
    m ? NFC_R1_SLOTS[i] : undefined,
  );

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
        <View style={styles.canvas}>
          <RoundLabel
            title="WILD CARD"
            x={getColCenter(COLS.AFC_R1)}
            isDark={isDark}
          />

          <RoundLabel
            title="DIVISIONAL ROUND"
            x={getColCenter(COLS.AFC_R2)}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE CHAMPIONSHIP"
            x={getColCenter(COLS.AFC_R3)}
            isDark={isDark}
          />

          <RoundLabel
            title="SUPER BOWL"
            x={getColCenter(COLS.FINALS)}
            isDark={isDark}
          />

          <RoundLabel
            title="CONFERENCE CHAMPIONSHIP"
            x={getColCenter(COLS.NFC_R3)}
            isDark={isDark}
          />

          <RoundLabel
            title="DIVISIONAL ROUND"
            x={getColCenter(COLS.NFC_R2)}
            isDark={isDark}
          />

          <RoundLabel
            title="WILD CARD"
            x={getColCenter(COLS.NFC_R1)}
            isDark={isDark}
          />

          <ConnectorLayer
            isDark={isDark}
            r1Slots={afcR1LayoutsForConnectors}
            r2={AFC_R2}
            r3={AFC_R3}
            finals={FINALS_LAYOUT}
          />
          <ConnectorLayer
            isDark={isDark}
            r1Slots={nfcR1LayoutsForConnectors}
            r2={NFC_R2}
            r3={NFC_R3}
            finals={FINALS_LAYOUT}
          />

          <Image source={NFLPlayoffsLogo} style={styles.playoffsLogo} />
          <Text style={[styles.sideLabel, styles.afcLabel]}>AFC</Text>
          <Text style={[styles.sideLabel, styles.nfcLabel]}>NFC</Text>

          {afcR1BySlot.map((m, slot) =>
            m ? (
              <MatchupCard
                key={`afc-r1-${slot}`}
                matchup={m}
                layout={AFC_R1_SLOTS[slot]}
                isDark={isDark}
              />
            ) : null,
          )}

          {bracket.afc.divisional.map((m, i) => (
            <MatchupCard
              key={`afc-r2-${i}`}
              matchup={m}
              layout={AFC_R2[i]}
              isDark={isDark}
            />
          ))}

          {bracket.afc.conference.map((m, i) => (
            <MatchupCard
              key={`afc-r3-${i}`}
              matchup={m}
              layout={AFC_R3}
              isDark={isDark}
            />
          ))}

          {nfcR1BySlot.map((m, slot) =>
            m ? (
              <MatchupCard
                key={`nfc-r1-${slot}`}
                matchup={m}
                layout={NFC_R1_SLOTS[slot]}
                isDark={isDark}
              />
            ) : null,
          )}

          {bracket.nfc.divisional.map((m, i) => (
            <MatchupCard
              key={`nfc-r2-${i}`}
              matchup={m}
              layout={NFC_R2[i]}
              isDark={isDark}
            />
          ))}

          {bracket.nfc.conference.map((m, i) => (
            <MatchupCard
              key={`nfc-r3-${i}`}
              matchup={m}
              layout={NFC_R3}
              isDark={isDark}
            />
          ))}

          {bracket.superBowl?.[0] && (
            <MatchupCard
              matchup={bracket.superBowl[0]}
              layout={FINALS_LAYOUT}
              isDark={isDark}
              finals
            />
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
