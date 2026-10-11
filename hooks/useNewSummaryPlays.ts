import { useState } from "react";

/** Track the full feed so pagination, tab changes, and score corrections stay still. */
export function useNewSummaryPlays(
  plays: readonly { id: string }[],
  scope: string,
  selectedPeriod: string,
): ReadonlySet<string> {
  const ids = plays.map((play) => play.id);
  const key = JSON.stringify(ids);
  const [snapshot, setSnapshot] = useState(() => ({
    scope, key, selectedPeriod, seen: new Set(ids), entering: new Set<string>(),
  }));

  if (snapshot.scope !== scope || snapshot.key !== key || snapshot.selectedPeriod !== selectedPeriod) {
    const reset = snapshot.scope !== scope;
    const entering = !reset && snapshot.seen.size > 0 && snapshot.selectedPeriod === selectedPeriod
      ? new Set(ids.filter((id) => !snapshot.seen.has(id)))
      : new Set<string>();
    setSnapshot({ scope, key, selectedPeriod,
      seen: reset ? new Set(ids) : new Set([...snapshot.seen, ...ids]), entering });
    return entering;
  }
  return snapshot.entering;
}
