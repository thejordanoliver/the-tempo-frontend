import type {
  FootballDrives,
  PlayObject,
} from "hooks/FootballHooks/useFootballGameDetails";

export const footballSummaryPeriods = [
  "All",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "OT",
] as const;
export type FootballSummaryPeriod = (typeof footballSummaryPeriods)[number];
export type FootballSummaryPlay = PlayObject & { id: string };

/** Combine backend-normalized drive and live feeds, preserving stable row identities. */
export function collectFootballSummaryPlays(
  plays: readonly PlayObject[] = [],
  drives?: FootballDrives | null,
): FootballSummaryPlay[] {
  const rows = new Map<string, FootballSummaryPlay>();
  const add = (play: PlayObject, driveTeam?: PlayObject["team"]) => {
    const period = play.period ?? play.start?.period ?? play.end?.period;
    const clock = play.clock ?? play.start?.clock ?? play.end?.clock;
    const team = play.team ?? play.start?.team ?? play.end?.team ?? driveTeam;
    const text = play.text ?? play.shortText ?? play.description;
    if (
      !Number.isInteger(Number(period?.number)) ||
      Number(period?.number) <= 0 ||
      !text?.trim()
    )
      return;
    const id = String(
      play.id ??
        `summary:${JSON.stringify([period?.number, play.sequenceNumber ?? play.sequence, clock?.displayValue, team?.id, text])}`,
    );
    const previous = rows.get(id);
    rows.set(id, {
      ...previous,
      ...play,
      id,
      period,
      clock,
      team: team ?? previous?.team,
      text,
      awayScore: play.awayScore ?? previous?.awayScore,
      homeScore: play.homeScore ?? previous?.homeScore,
    });
  };
  for (const drive of [
    ...(drives?.previous ?? []),
    ...(drives?.current ?? []),
  ]) {
    for (const play of drive.plays ?? []) add(play, drive.team);
  }
  for (const play of plays) add(play);
  const seconds = (play: PlayObject) => {
    const [minutes, seconds] = (play.clock?.displayValue ?? "")
      .split(":")
      .map(Number);
    return Number.isFinite(minutes) && Number.isFinite(seconds)
      ? minutes * 60 + seconds
      : 0;
  };
  return [...rows.values()].sort((a, b) => {
    const period = Number(b.period?.number) - Number(a.period?.number);
    if (period) return period;
    const sequence =
      Number(b.sequenceNumber ?? b.sequence) -
      Number(a.sequenceNumber ?? a.sequence);
    if (Number.isFinite(sequence) && sequence !== 0) return sequence;
    return seconds(a) - seconds(b);
  });
}

export function filterFootballSummaryPlays(
  plays: FootballSummaryPlay[],
  period: FootballSummaryPeriod,
) {
  if (period === "All") return plays;
  if (period === "OT")
    return plays.filter((play) => Number(play.period?.number) > 4);
  return plays.filter(
    (play) => Number(play.period?.number) === Number(period[0]),
  );
}
