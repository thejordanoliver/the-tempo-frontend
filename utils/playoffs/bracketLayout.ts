import type {
  PlayoffByeTeam,
  PlayoffMatchup,
  PlayoffRound,
} from "types/playoffs";

export const BRACKET_CARD_WIDTH = 216;
export const BRACKET_CARD_HEIGHT = 140;
export const BRACKET_COLUMN_GAP = 36;
export const BRACKET_HEADER_HEIGHT = 48;
export const BRACKET_ROW_GAP = 20;

export type BracketSide = "left" | "right" | "center";

export interface BracketNode {
  key: string;
  roundIndex: number;
  side: BracketSide;
  x: number;
  y: number;
  matchup?: PlayoffMatchup;
  bye?: PlayoffByeTeam;
  nextKey: string | null;
}

export function getBracketColumnX(roundIndex: number) {
  return roundIndex * (BRACKET_CARD_WIDTH + BRACKET_COLUMN_GAP);
}

function createNode(
  key: string,
  roundIndex: number,
  content: Pick<BracketNode, "matchup" | "bye">,
): BracketNode {
  return {
    key,
    roundIndex,
    side: "left",
    x: getBracketColumnX(roundIndex),
    y: 0,
    nextKey: null,
    ...content,
  };
}

function createColumns(rounds: PlayoffRound[]): BracketNode[][] {
  return rounds.map((round, roundIndex) => {
    const matchups = round.matchups.map((matchup, index) =>
      createNode(`${roundIndex}:matchup:${matchup.id ?? index}`, roundIndex, {
        matchup,
      }),
    );
    const byes = (round.byeTeams ?? [])
      .filter((team): team is PlayoffByeTeam => team != null)
      .map((bye, index) =>
        createNode(`${roundIndex}:bye:${bye.alt_id ?? index}`, roundIndex, {
          bye,
        }),
      );
    return [...matchups, ...byes];
  });
}

/** Only explicit links to the adjacent round create a connection. */
function connectColumns(columns: BracketNode[][]) {
  const incoming = new Map<string, BracketNode[]>();
  columns.forEach((nodes, roundIndex) => {
    const nextRound = columns[roundIndex + 1] ?? [];
    const targets = new Map<string, BracketNode>();
    for (const target of nextRound) {
      if (target.matchup?.id) targets.set(target.matchup.id, target);
    }

    for (const node of nodes) {
      const nextId = node.matchup?.nextSeriesId ?? node.bye?.nextSeriesId;
      const target = nextId ? targets.get(nextId) : undefined;
      if (!target) continue;

      node.nextKey = target.key;
      const sources = incoming.get(target.key) ?? [];
      sources.push(node);
      incoming.set(target.key, sources);
    }
  });
  return incoming;
}

function getConferenceSide(
  league: string | null | undefined,
): BracketSide | undefined {
  if (["AL", "AFC", "EAST", "EASTERN"].includes(league?.toUpperCase() ?? ""))
    return "left";
  if (["NL", "NFC", "WEST", "WESTERN"].includes(league?.toUpperCase() ?? ""))
    return "right";
  return undefined;
}

/** Follow known advancement backward; conference labels also work before pairings exist. */
function assignSides(columns: BracketNode[][]) {
  const finalIndex = columns.length - 1;
  const byKey = new Map(columns.flat().map((node) => [node.key, node]));
  for (let index = finalIndex; index >= 0; index--) {
    columns[index].forEach((node, slot) => {
      if (index === finalIndex) {
        node.side = "center";
        return;
      }
      const targetSide = node.nextKey
        ? byKey.get(node.nextKey)?.side
        : undefined;
      const inheritedSide = targetSide === "center" ? undefined : targetSide;
      node.side =
        getConferenceSide(node.matchup?.league) ??
        inheritedSide ??
        (slot < Math.ceil(columns[index].length / 2) ? "left" : "right");
    });
  }
}

/** Each branch gets its own rows, with later matchups centered over their sources. */
function positionColumns(
  columns: BracketNode[][],
  incoming: Map<string, BracketNode[]>,
) {
  const positioned = new Set<string>();
  const nextRow = { left: 0, right: 0, center: 0 };

  function positionNode(node: BracketNode): number {
    if (positioned.has(node.key)) return node.y;
    const sources = incoming.get(node.key) ?? [];
    if (sources.length === 0) {
      node.y = nextRow[node.side] * (BRACKET_CARD_HEIGHT + BRACKET_ROW_GAP);
      nextRow[node.side] += 1;
    } else {
      const positions = sources.map(positionNode);
      node.y = positions.reduce((sum, y) => sum + y, 0) / positions.length;
    }
    positioned.add(node.key);
    return node.y;
  }
  const nodes = columns.flat();
  for (const column of [...columns].reverse()) {
    column.filter((node) => node.side !== "center").forEach(positionNode);
  }

  const branchHeight = (side: BracketSide) =>
    nodes
      .filter((node) => node.side === side)
      .reduce(
        (bottom, node) => Math.max(bottom, node.y + BRACKET_CARD_HEIGHT),
        BRACKET_CARD_HEIGHT,
      );
  const finals = nodes.filter((node) => node.side === "center");
  const finalsHeight =
    Math.max(1, finals.length) * (BRACKET_CARD_HEIGHT + BRACKET_ROW_GAP) -
    BRACKET_ROW_GAP;
  const height = Math.max(
    branchHeight("left"),
    branchHeight("right"),
    finalsHeight,
  );

  for (const side of ["left", "right"] as const) {
    const offset = (height - branchHeight(side)) / 2;
    nodes
      .filter((node) => node.side === side)
      .forEach((node) => {
        node.y += offset;
      });
  }
  finals.forEach((node, index) => {
    node.y = ((index + 0.5) * height) / finals.length - BRACKET_CARD_HEIGHT / 2;
  });
  return height;
}

export function getBracketLayout(input: PlayoffRound[]) {
  const rounds = [...input].sort((a, b) => a.order - b.order);
  const columns = createColumns(rounds);
  const incoming = connectColumns(columns);
  assignSides(columns);
  const contentHeight = positionColumns(columns, incoming);
  const finalIndex = Math.max(0, rounds.length - 1);
  const nodes = columns.flat();

  for (const node of nodes) {
    const column =
      node.side === "right"
        ? finalIndex * 2 - node.roundIndex
        : node.roundIndex;
    node.x = getBracketColumnX(column);
  }

  const headers = rounds.flatMap((round, index) => {
    if (index === finalIndex)
      return [
        { key: `${round.id}:center`, round, x: getBracketColumnX(index) },
      ];
    return [
      { key: `${round.id}:left`, round, x: getBracketColumnX(index) },
      {
        key: `${round.id}:right`,
        round,
        x: getBracketColumnX(finalIndex * 2 - index),
      },
    ];
  });

  return {
    rounds,
    headers,
    nodes,
    width: getBracketColumnX(finalIndex * 2) + BRACKET_CARD_WIDTH,
    height: contentHeight + BRACKET_HEADER_HEIGHT,
  };
}
