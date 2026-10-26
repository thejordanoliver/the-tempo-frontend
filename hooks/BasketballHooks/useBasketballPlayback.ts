import { useCallback, useMemo, useState } from "react";
import type { Play } from "./useBasketballGameDetails";
import {
  basketballEventKey,
  basketballHistorySelection,
  relevantBasketballEvents,
} from "utils/sports/basketball/basketballEvents";

const EMPTY_PLAYS: Play[] = [];

/** Latest-event policy: one displayed event, no animation backlog or per-frame React state. */
export function useBasketballPlayback(
  plays: readonly Play[] = EMPTY_PLAYS,
  lastPlay?: Play | null,
  scope = "",
) {
  const events = useMemo(
    () => relevantBasketballEvents(plays, lastPlay),
    [plays, lastPlay],
  );
  const [selection, setSelection] = useState<{
    scope: string;
    key: string | null;
  } | null>(null);
  const key = selection?.scope === scope ? selection.key : null;
  const selected = useMemo(
    () => basketballHistorySelection(events, key),
    [events, key],
  );
  const select = useCallback(
    (key: string | null) => setSelection({ scope, key }),
    [scope],
  );
  const previous = useCallback(() => {
    const next = events[selected.index + 1];
    if (next) select(basketballEventKey(next));
  }, [events, selected.index, select]);
  const next = useCallback(() => {
    if (selected.index <= 1) select(null);
    else select(basketballEventKey(events[selected.index - 1]));
  }, [events, selected.index, select]);
  const latest = useCallback(() => select(null), [select]);
  return {
    events,
    ...selected,
    previous,
    next,
    latest,
    hasPrevious: selected.index < events.length - 1,
    hasNext: !selected.followingLatest,
    animationKey: selected.play
      ? `${scope}:${basketballEventKey(selected.play)}`
      : `${scope}:empty`,
  };
}
