type PeriodPlay = {
  period?: { number?: number | string | null; displayValue?: string | null; type?: string | null } | null;
};
export type SummaryPeriodTab = { label: string; number: number | null };

export function getGameSummaryPeriods(plays: readonly PeriodPlay[], regulationLabels: readonly string[]): SummaryPeriodTab[] {
  const periods = [...new Set(plays.map(play => Number(play.period?.number)))]
    .filter(number => Number.isInteger(number) && number > 0)
    .sort((a, b) => a - b);
  return [{ label: "All", number: null }, ...periods.map(number => {
    const shootout = plays.some(play => Number(play.period?.number) === number &&
      /shootout|^so$/i.test(play.period?.displayValue ?? play.period?.type ?? ""));
    const overtime = number - regulationLabels.length;
    return { number, label: shootout ? "SO" : regulationLabels[number - 1] ?? (overtime === 1 ? "OT" : `${overtime}OT`) };
  })];
}

export function filterGameSummaryPeriod<T extends PeriodPlay>(plays: readonly T[], label: string, tabs: readonly SummaryPeriodTab[]): T[] {
  const period = tabs.find(tab => tab.label === label)?.number;
  return period == null ? [...plays] : plays.filter(play => Number(play.period?.number) === period);
}
