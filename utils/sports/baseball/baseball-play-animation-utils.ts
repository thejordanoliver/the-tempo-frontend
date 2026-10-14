import type {
  BaseballBaseRunner,
  BaseballPlay,
  BaseballPlayCoordinate,
} from "@/hooks/BaseballHooks/useBaseballGameDetails";

export type BaseballBase = "home" | "first" | "second" | "third";

export type BaseballBaseOccupants = {
  first: string | null;
  second: string | null;
  third: string | null;
};

export type BaseballRunnerMovement = {
  athleteId: string;
  from: BaseballBase;
  to: BaseballBase;
  isOut: boolean;
};

export type BaseballPlayAnimation = {
  key: string;
  kind: "hit" | "pitch";
  actionPlay: BaseballPlay;
  coordinate: BaseballPlayCoordinate;
  trajectory: string | null;
  runnerMovements: BaseballRunnerMovement[];
};

const BASE_ORDER: BaseballBase[] = ["home", "first", "second", "third"];

const SUMMARY_PLAY_TYPES = new Set(["end-batterpitcher", "play-result"]);

const HIT_DESTINATIONS: Record<string, BaseballBase> = {
  "bunt-single": "first",
  double: "second",
  single: "first",
  triple: "third",
};

const OUT_PLAY_TYPES = new Set([
  "bunt-ground-out",
  "double-play",
  "fielders-choice-out",
  "fly-out",
  "force-out",
  "ground-out",
  "line-out",
  "pop-out",
  "strikeout",
  "strikeout-double-play",
]);

function normalizePlayType(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function getRunnerId(runner?: BaseballBaseRunner | null): string | null {
  const id = runner?.athlete?.id;

  return id === null || id === undefined ? null : String(id);
}

function getBatterId(play: BaseballPlay): string | null {
  const batter = play.participants?.find(
    (participant) => normalizePlayType(participant.type) === "batter",
  );
  const id = batter?.athlete?.id;

  return id === null || id === undefined ? null : String(id);
}

export function getBaseballBaseOccupants(
  play?: BaseballPlay | null,
): BaseballBaseOccupants {
  return {
    first: getRunnerId(play?.onFirst),
    second: getRunnerId(play?.onSecond),
    third: getRunnerId(play?.onThird),
  };
}

function findOccupiedBase(
  occupants: BaseballBaseOccupants,
  athleteId: string,
): Exclude<BaseballBase, "home"> | null {
  if (occupants.first === athleteId) return "first";
  if (occupants.second === athleteId) return "second";
  if (occupants.third === athleteId) return "third";

  return null;
}

function getActivePlayIndex(plays: BaseballPlay[], activePlay: BaseballPlay) {
  const index = plays.findIndex((candidate) => candidate.id === activePlay.id);

  return index >= 0 ? index : plays.length - 1;
}

export function getActiveAtBatPlays(
  plays: BaseballPlay[],
  activePlay: BaseballPlay,
): BaseballPlay[] {
  if (!activePlay.atBatId) {
    return [activePlay];
  }

  const activeIndex = getActivePlayIndex(plays, activePlay);
  const atBatPlays = plays
    .slice(0, activeIndex + 1)
    .filter((candidate) => candidate.atBatId === activePlay.atBatId);

  return atBatPlays.length > 0 ? atBatPlays : [activePlay];
}

function getOutcomeType(atBatPlays: BaseballPlay[]) {
  for (let index = atBatPlays.length - 1; index >= 0; index -= 1) {
    const play = atBatPlays[index];
    const alternativeType = normalizePlayType(play.alternativeType?.type);

    if (alternativeType) {
      return alternativeType;
    }

    const type = normalizePlayType(play.type?.type);

    if (type && !SUMMARY_PLAY_TYPES.has(type)) {
      return type;
    }
  }

  return "";
}

function getNextBase(base: Exclude<BaseballBase, "home">): BaseballBase {
  const index = BASE_ORDER.indexOf(base);

  return BASE_ORDER[Math.min(index + 1, BASE_ORDER.length - 1)];
}

function getScoreDelta(startPlay: BaseballPlay, activePlay: BaseballPlay) {
  return Math.max(
    0,
    activePlay.awayScore +
      activePlay.homeScore -
      (startPlay.awayScore + startPlay.homeScore),
  );
}

function getRunnerMovements(
  atBatPlays: BaseballPlay[],
  activePlay: BaseballPlay,
): BaseballRunnerMovement[] {
  const startPlay = atBatPlays[0] ?? activePlay;
  const start = getBaseballBaseOccupants(startPlay);
  const end = getBaseballBaseOccupants(activePlay);
  const movements: BaseballRunnerMovement[] = [];
  const startRunners = (["third", "second", "first"] as const)
    .map((base) => ({ base, athleteId: start[base] }))
    .filter(
      (
        runner,
      ): runner is {
        base: Exclude<BaseballBase, "home">;
        athleteId: string;
      } => Boolean(runner.athleteId),
    );
  let remainingRuns = getScoreDelta(startPlay, activePlay);

  startRunners.forEach(({ base, athleteId }) => {
    const destination = findOccupiedBase(end, athleteId);

    if (destination && destination !== base) {
      movements.push({
        athleteId,
        from: base,
        to: destination,
        isOut: false,
      });
      return;
    }

    if (!destination && remainingRuns > 0) {
      movements.push({
        athleteId,
        from: base,
        to: "home",
        isOut: false,
      });
      remainingRuns -= 1;
      return;
    }

    if (!destination && (activePlay.outs ?? 0) > (startPlay.outs ?? 0)) {
      movements.push({
        athleteId,
        from: base,
        to: getNextBase(base),
        isOut: true,
      });
    }
  });

  const outcomeType = getOutcomeType(atBatPlays);
  const batterId =
    [...atBatPlays]
      .reverse()
      .map(getBatterId)
      .find((id): id is string => Boolean(id)) ?? `batter-${activePlay.atBatId}`;
  const batterDestination = findOccupiedBase(end, batterId);

  if (batterDestination) {
    movements.push({
      athleteId: batterId,
      from: "home",
      to: batterDestination,
      isOut: false,
    });
  } else if (outcomeType === "home-run") {
    movements.push({
      athleteId: batterId,
      from: "home",
      to: "home",
      isOut: false,
    });
  } else if (HIT_DESTINATIONS[outcomeType]) {
    movements.push({
      athleteId: batterId,
      from: "home",
      to: HIT_DESTINATIONS[outcomeType],
      isOut: false,
    });
  } else if (OUT_PLAY_TYPES.has(outcomeType)) {
    movements.push({
      athleteId: batterId,
      from: "home",
      to: "first",
      isOut: true,
    });
  }

  return movements;
}

export function resolveBaseballPlayAnimation(
  plays: BaseballPlay[],
  activePlay?: BaseballPlay | null,
): BaseballPlayAnimation | null {
  if (!activePlay) {
    return null;
  }

  const atBatPlays = getActiveAtBatPlays(plays, activePlay);
  const activeType = normalizePlayType(activePlay.type?.type);
  let actionPlay: BaseballPlay | null = null;

  if (activePlay.hitCoordinate) {
    actionPlay = activePlay;
  } else if (SUMMARY_PLAY_TYPES.has(activeType)) {
    actionPlay =
      [...atBatPlays].reverse().find((candidate) => candidate.hitCoordinate) ??
      null;
  }

  if (actionPlay?.hitCoordinate) {
    const runnerMovements = getRunnerMovements(atBatPlays, activePlay);
    const movementKey = runnerMovements
      .map(
        ({ athleteId, from, to, isOut }) =>
          `${athleteId}:${from}-${to}:${isOut ? "out" : "safe"}`,
      )
      .join("|");

    return {
      key: `${actionPlay.id}:${activePlay.id}:${movementKey}`,
      kind: "hit",
      actionPlay,
      coordinate: actionPlay.hitCoordinate,
      trajectory: actionPlay.trajectory ?? activePlay.trajectory ?? null,
      runnerMovements,
    };
  }

  if (activePlay.pitchCoordinate) {
    return {
      key: activePlay.id,
      kind: "pitch",
      actionPlay: activePlay,
      coordinate: activePlay.pitchCoordinate,
      trajectory: null,
      runnerMovements: [],
    };
  }

  return null;
}

export function mapEspnHitCoordinate(
  coordinate: BaseballPlayCoordinate,
  viewBoxWidth: number,
  viewBoxHeight: number,
) {
  const sourceCoordinateSize = 250;
  const x = Math.min(Math.max(coordinate.x, 0), sourceCoordinateSize);
  const y = Math.min(Math.max(coordinate.y, 0), sourceCoordinateSize);

  return {
    x: (x / sourceCoordinateSize) * viewBoxWidth,
    y: (y / sourceCoordinateSize) * viewBoxHeight,
  };
}
