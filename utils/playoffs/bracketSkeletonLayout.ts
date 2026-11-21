import type { PlayoffLeague } from "types/playoffs";
import { getBracketLayout, type BracketNode } from "./bracketLayout";
import { createPlaceholderRounds } from "./placeholderBracket";

export interface BracketSkeletonNode extends BracketNode {
  isBye: boolean;
}

/** Use the same league format and geometry for loading and undecided brackets. */
export function getBracketSkeletonLayout(league: PlayoffLeague) {
  const layout = getBracketLayout(createPlaceholderRounds(league));
  const nodes: BracketSkeletonNode[] = layout.nodes.map((node) => ({
    ...node,
    isBye: !!node.bye,
  }));
  return { ...layout, nodes, roundCount: layout.rounds.length };
}
