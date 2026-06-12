import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type TeamStats = {
  // ================= Passing =================
  completionPct: number;
  completions: number;
  interceptionPct: number;
  interceptions: number;
  longPassing: number;
  netPassingYards: number;
  netPassingYardsPerGame: number;
  passingAttempts: number;
  passingTouchdownPct: number;
  passingTouchdowns: number;
  QBRating: number;
  sacks: number;
  sackYardsLost: number;
  yardsPerPassAttempt: number;
  passingYards: number;
  passingFumblesLost: number;
  passingYardsPerGame: number;
  completionAttempts: number;
  sacksYardsLost: number;

  // ================= Rushing =================
  rushingAttempts: number;
  rushingYards: number;
  yardsPerRushAttempt: number;
  longRushing: number;
  rushingBigPlays: number;
  rushingTouchdowns: number;
  rushingYardsPerGame: number;
  rushingFumbles: number;
  rushingFumblesLost: number;
  rushingFirstDowns: number;

  // ================= Receiving =================
  receptions: number;
  receivingTargets: number;
  receivingYards: number;
  receivingTouchdowns: number;
  longReception: number;
  receivingBigPlays: number;
  receivingYardsPerGame: number;
  receivingFumbles: number;
  receivingFumblesLost: number;
  receivingYardsAfterCatch: number;
  receivingFirstDowns: number;
  yardsPerReception: number;

  // ================= First Downs / Efficiency =================
  firstDowns: number;
  firstDownsRushing: number;
  firstDownsPassing: number;
  firstDownsPenalty: number;
  thirdDownConvs: number;
  thirdDownAttempts: number;
  thirdDownConvPct: number;
  fourthDownConvs: number;
  fourthDownAttempts: number;
  fourthDownConvPct: number;
  totalPenalties: number;
  totalPenaltyYards: number;
  possessionTimeSeconds: number;
  redzoneFieldGoalPct: number;
  redzoneScoringPct: number;
  redzoneEfficiencyPct: number;
  redzoneTouchdownPct: number;
  totalTakeaways: number;
  totalGiveaways: number;
  turnOverDifferential: number;
  fumblesLost: number;
  thirdDownEff: number;
  fourthDownEff: number;
  totalPenaltiesYards: number;

  // ================= Defensive =================
  soloTackles: number;
  assistTackles: number;
  totalTackles: number;
  sackYards: number;
  stuffs: number;
  passesDefended: number;
  avgInterceptionYards: number;
  longInterception: number;
  miscTouchdowns: number;
  kicksBlocked: number;
  tacklesForLoss: number;

  // ================= Interceptions =================
  interceptionYards: number;
  interceptionTouchdowns: number;
  totalInterceptionsYards: number;

  // ================= Fumbles =================
  fumbles: number;
  fumblesForced: number;
  fumblesRecovered: number;
  fumblesTouchdowns: number;
  gamesPlayed: number;
  fumblesAndLost: number;

  // ================= Returns =================
  kickReturns: number;
  kickReturnYards: number;
  yardsPerKickReturn: number;
  longKickReturn: number;
  kickReturnTouchdowns: number;
  puntReturns: number;
  puntReturnYards: number;
  yardsPerPuntReturn: number;
  longPuntReturn: number;
  puntReturnTouchdowns: number;
  puntReturnFairCatches: number;
  kickReturnFumblesLost: number;
  puntReturnFumblesLost: number;
  totalPuntReturnsYards: number;

  // ================= Kicking =================
  fieldGoalsMade: number;
  fieldGoalAttempts: number;
  fieldGoalPct: number;
  longFieldGoalMade: number;
  fieldGoalAttempts1_19: number;
  fieldGoalAttempts20_29: number;
  fieldGoalAttempts30_39: number;
  fieldGoalAttempts40_49: number;
  fieldGoalAttempts50: number;
  extraPointsMade: number;
  extraPointAttempts: number;
  extraPointPct: number;
  fieldGoalsMade1_19: number;
  fieldGoalsMade20_29: number;
  fieldGoalsMade30_39: number;
  fieldGoalsMade40_49: number;
  fieldGoalsMade50: number;
  totalKickingPoints: number;
  touchbackPct: number;
  avgKickoffReturnYards: number;
  kickoffReturnYards: number;
  kickoffReturns: number;
  totalKickoffYards: number;
  totalGoalsVsAttemps: number;

  // ================= Punting =================
  punts: number;
  puntYards: number;
  longPunt: number;
  grossAvgPuntYards: number;
  netAvgPuntYards: number;
  puntsBlocked: number;
  puntsInside20: number;
  touchbacks: number;
  fairCatches: number;
  avgPuntReturnYards: number;
  totalPuntsYards: number;

  // ================= Scoring / Totals =================
  teamGamesPlayed: number;
  yardsPerGame: number;
  totalYards: number;
  totalOffensivePlays: number;
  totalPointsPerGame: number;
  totalPoints: number;
  totalTouchdowns: number;
  returnTouchdowns: number;
  fieldGoals: number;
  kickExtraPoints: number;
  totalTwoPointConvs: number;
};

type StatItem = {
  name: string;
  displayName?: string;
  shortDisplayName?: string;
  description?: string;
  abbreviation?: string;
  value?: string | number | null;
  displayValue?: string;
};

type StatGroup = {
  name?: string;
  stats?: StatItem[];
};

type TeamStatsApiResponse = {
  team?: {
    id?: string | number;
    name?: string;
    abbreviation?: string;
    logo?: string;
    recordSummary?: string;
    standingSummary?: string;
  };
  season?: {
    year?: string | number;
    type?: string | number;
    name?: string;
    displayName?: string;
  };
  stats?: Record<string, StatGroup | undefined>;
};

type StatStore = {
  values: Record<string, number | undefined>;
  displays: Record<string, string | undefined>;
};

type BuiltStatMaps = {
  all: StatStore;
  groups: Record<string, StatStore | undefined>;
};

const createStatStore = (): StatStore => ({
  values: {},
  displays: {},
});

const normalizeKey = (key: string): string =>
  key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const toNumber = (value: string | number | null | undefined): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map(Number);

    if (parts.every(Number.isFinite)) {
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  const cleaned = trimmed.replace(/,/g, "").replace(/%/g, "");

  if (/^[+-]?\d+(\.\d+)?$/.test(cleaned)) {
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const format = (num: number, digits = 1): number => {
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(digits));
};

const safeDivide = (num: number, den: number): number => {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return 0;
  return num / den;
};

const normalizePercent = (value: number): number => {
  if (!Number.isFinite(value) || value === 0) return 0;
  return format(value > 0 && value <= 1 ? value * 100 : value);
};

const calcPct = (made: number, attempts: number): number =>
  attempts > 0 ? format((made / attempts) * 100) : 0;

const setStoreValue = (
  store: StatStore,
  key: string | undefined,
  value: number,
  displayValue?: string,
) => {
  if (!key) return;

  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) return;

  if (store.values[normalizedKey] === undefined) {
    store.values[normalizedKey] = value;
  }

  if (displayValue && store.displays[normalizedKey] === undefined) {
    store.displays[normalizedKey] = displayValue;
  }
};

const addStatToStore = (store: StatStore, stat: StatItem) => {
  const value =
    stat.value !== null && stat.value !== undefined
      ? toNumber(stat.value)
      : toNumber(stat.displayValue);

  setStoreValue(store, stat.name, value, stat.displayValue);
  setStoreValue(store, stat.displayName, value, stat.displayValue);
  setStoreValue(store, stat.shortDisplayName, value, stat.displayValue);
  setStoreValue(store, stat.abbreviation, value, stat.displayValue);
};

const buildStatMaps = (response?: TeamStatsApiResponse): BuiltStatMaps => {
  const maps: BuiltStatMaps = {
    all: createStatStore(),
    groups: {},
  };

  Object.entries(response?.stats ?? {}).forEach(([groupName, group]) => {
    const groupKey = normalizeKey(groupName);
    const groupStore = maps.groups[groupKey] ?? createStatStore();
    maps.groups[groupKey] = groupStore;

    (group?.stats ?? []).forEach((stat) => {
      addStatToStore(maps.all, stat);
      addStatToStore(groupStore, stat);
    });
  });

  return maps;
};

const findValueInStore = (
  store: StatStore | undefined,
  aliases: string[],
): number | undefined => {
  if (!store) return undefined;

  for (const alias of aliases) {
    const value = store.values[normalizeKey(alias)];
    if (value !== undefined) return value;
  }

  return undefined;
};

const findDisplayInStore = (
  store: StatStore | undefined,
  aliases: string[],
): string | undefined => {
  if (!store) return undefined;

  for (const alias of aliases) {
    const value = store.displays[normalizeKey(alias)];
    if (value !== undefined) return value;
  }

  return undefined;
};

const getStat = (
  maps: BuiltStatMaps,
  aliases: string[],
  groups?: string[],
): number => {
  for (const group of groups ?? []) {
    const groupValue = findValueInStore(
      maps.groups[normalizeKey(group)],
      aliases,
    );
    if (groupValue !== undefined) return groupValue;
  }

  return findValueInStore(maps.all, aliases) ?? 0;
};

const getStatDisplay = (
  maps: BuiltStatMaps,
  aliases: string[],
  groups?: string[],
): string | undefined => {
  for (const group of groups ?? []) {
    const groupValue = findDisplayInStore(
      maps.groups[normalizeKey(group)],
      aliases,
    );
    if (groupValue !== undefined) return groupValue;
  }

  return findDisplayInStore(maps.all, aliases);
};

const getStatPair = (
  maps: BuiltStatMaps,
  aliases: string[],
  groups?: string[],
): { first: number; second: number } | null => {
  const displayValue = getStatDisplay(maps, aliases, groups);
  if (!displayValue) return null;

  const match = displayValue
    .replace(/,/g, "")
    .match(/(-?\d+(?:\.\d+)?)\s*(?:-|\/|of)\s*(-?\d+(?:\.\d+)?)/i);

  if (!match) return null;

  const first = Number(match[1]);
  const second = Number(match[2]);

  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

  return { first, second };
};

export function useTeamStats(teamId: string | number, league: string) {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [teamStatsLoading, setTeamStatsLoading] = useState<boolean>(true);
  const [teamStatsError, setTeamStatsError] = useState<Error | null>(null);

  const fetchTeamStats = useCallback(async () => {
    if (!teamId) {
      setTeamStats(null);
      setTeamStatsLoading(false);
      return;
    }

    setTeamStatsLoading(true);
    setTeamStatsError(null);

    try {
      const response = await apiClient.get<TeamStatsApiResponse>(
        `/api/team/stats/${league}/${teamId}`,
      );

      const statMaps = buildStatMaps(response.data);
      const get = (aliases: string | string[], groups?: string[]) =>
        getStat(statMaps, Array.isArray(aliases) ? aliases : [aliases], groups);

      const gamesPlayed = get(
        ["gamesPlayed", "teamGamesPlayed", "games"],
        ["gen", "off"],
      );
      const safeGames = gamesPlayed > 0 ? gamesPlayed : 1;

      const completionAttemptPair = getStatPair(
        statMaps,
        ["completionAttempts", "completionsAttempts", "passing"],
        ["off"],
      );
      const fieldGoalPair = getStatPair(
        statMaps,
        ["fieldGoals", "fieldGoalsMade", "fieldGoalAttempts"],
        ["gen", "off"],
      );
      const extraPointPair = getStatPair(
        statMaps,
        ["extraPoints", "extraPointsMade", "extraPointAttempts"],
        ["gen", "off"],
      );
      const penaltyPair = getStatPair(
        statMaps,
        ["totalPenaltiesYards", "penalties", "totalPenalties"],
        ["gen", "off"],
      );
      const fumblesPair = getStatPair(
        statMaps,
        ["fumblesAndLost", "fumblesLost", "fumbles"],
        ["gen", "off"],
      );

      const completions =
        get(
          ["completions", "passingCompletions", "passCompletions"],
          ["off"],
        ) ||
        completionAttemptPair?.first ||
        0;
      const passingAttempts =
        get(["passingAttempts", "passAttempts", "attempts"], ["off"]) ||
        completionAttemptPair?.second ||
        0;
      const passingYards = get(
        ["passingYards", "netPassingYards", "passYards"],
        ["off"],
      );
      const passingTouchdowns = get(
        ["passingTouchdowns", "passTouchdowns", "passingTD", "passingTDs"],
        ["off"],
      );
      const interceptions = get(
        [
          "interceptions",
          "passingInterceptions",
          "interceptionsThrown",
          "interceptionThrows",
        ],
        ["off"],
      );
      const sackYardsLost = get(
        ["sackYardsLost", "sacksYardsLost", "yardsLostToSacks"],
        ["off"],
      );
      const sacks = get(["sacks", "sacksAgainst", "timesSacked"], ["off"]);
      const netPassingYards =
        get(["netPassingYards", "netPassYards"], ["off"]) ||
        Math.max(passingYards - sackYardsLost, 0);

      const rushingAttempts = get(
        ["rushingAttempts", "rushAttempts", "carries"],
        ["off"],
      );
      const rushingYards = get(["rushingYards", "rushYards"], ["off"]);
      const rushingTouchdowns = get(
        ["rushingTouchdowns", "rushTouchdowns", "rushingTD", "rushingTDs"],
        ["off"],
      );

      const receptions =
        get(["receptions", "receivingReceptions"], ["off"]) || completions;
      const receivingTargets =
        get(["receivingTargets", "targets"], ["off"]) || passingAttempts;
      const receivingYards =
        get(["receivingYards", "receptionYards"], ["off"]) || passingYards;
      const receivingTouchdowns =
        get(["receivingTouchdowns", "receivingTD", "receivingTDs"], ["off"]) ||
        passingTouchdowns;

      const thirdDownConvs = get(
        ["thirdDownConvs", "thirdDownConversions"],
        ["gen", "off"],
      );
      const thirdDownAttempts = get(
        ["thirdDownAttempts", "thirdDownsAttempted"],
        ["gen", "off"],
      );
      const thirdDownConvPct =
        normalizePercent(
          get(
            ["thirdDownConvPct", "thirdDownConversionPct", "thirdDownPct"],
            ["gen", "off"],
          ),
        ) || calcPct(thirdDownConvs, thirdDownAttempts);

      const fourthDownConvs = get(
        ["fourthDownConvs", "fourthDownConversions"],
        ["gen", "off"],
      );
      const fourthDownAttempts = get(
        ["fourthDownAttempts", "fourthDownsAttempted"],
        ["gen", "off"],
      );
      const fourthDownConvPct =
        normalizePercent(
          get(
            ["fourthDownConvPct", "fourthDownConversionPct", "fourthDownPct"],
            ["gen", "off"],
          ),
        ) || calcPct(fourthDownConvs, fourthDownAttempts);

      const totalPenalties =
        get(["totalPenalties", "penalties"], ["gen", "off"]) ||
        penaltyPair?.first ||
        0;
      const totalPenaltyYards =
        get(["totalPenaltyYards", "penaltyYards"], ["gen", "off"]) ||
        penaltyPair?.second ||
        0;

      const firstDowns = get(["firstDowns", "totalFirstDowns"], ["gen", "off"]);
      const firstDownsRushing = get(
        ["firstDownsRushing", "rushingFirstDowns", "rushFirstDowns"],
        ["gen", "off"],
      );
      const firstDownsPassing = get(
        ["firstDownsPassing", "passingFirstDowns", "passFirstDowns"],
        ["gen", "off"],
      );
      const firstDownsPenalty = get(
        ["firstDownsPenalty", "penaltyFirstDowns"],
        ["gen", "off"],
      );

      const totalTakeaways = get(
        ["totalTakeaways", "takeaways", "turnoversForced"],
        ["gen", "def"],
      );
      const totalGiveaways = get(
        ["totalGiveaways", "giveaways", "turnovers"],
        ["gen", "off"],
      );
      const turnOverDifferential =
        get(
          ["turnOverDifferential", "turnoverDifferential", "turnoverMargin"],
          ["gen"],
        ) || totalTakeaways - totalGiveaways;

      const fumblesLost =
        get(["fumblesLost", "totalFumblesLost"], ["gen", "off"]) ||
        fumblesPair?.second ||
        0;
      const fumbles =
        get(["fumbles", "totalFumbles"], ["gen", "off"]) ||
        fumblesPair?.first ||
        0;

      const interceptionYards = get(
        ["interceptionYards", "interceptionsYards", "intYards"],
        ["def"],
      );
      const totalYards = get(
        ["totalYards", "netTotalYards", "offensiveYards"],
        ["gen", "off"],
      );
      const totalPoints = get(
        ["totalPoints", "points", "pointsFor"],
        ["gen", "off"],
      );
      const fieldGoalsMade =
        get(["fieldGoalsMade", "madeFieldGoals"], ["gen", "off"]) ||
        fieldGoalPair?.first ||
        0;
      const fieldGoalAttempts =
        get(["fieldGoalAttempts", "attemptedFieldGoals"], ["gen", "off"]) ||
        fieldGoalPair?.second ||
        0;
      const extraPointsMade =
        get(
          ["extraPointsMade", "madeExtraPoints", "kickExtraPoints"],
          ["gen", "off"],
        ) ||
        extraPointPair?.first ||
        0;
      const extraPointAttempts =
        get(["extraPointAttempts", "attemptedExtraPoints"], ["gen", "off"]) ||
        extraPointPair?.second ||
        0;

      const aggregated: TeamStats = {
        // ================= Passing =================
        completionPct:
          normalizePercent(
            get(
              ["completionPct", "completionPercentage", "completionPercent"],
              ["off"],
            ),
          ) || calcPct(completions, passingAttempts),
        completions,
        interceptionPct:
          normalizePercent(
            get(["interceptionPct", "interceptionPercentage"], ["off"]),
          ) || calcPct(interceptions, passingAttempts),
        interceptions,
        longPassing: get(["longPassing", "longPass", "passingLong"], ["off"]),
        netPassingYards,
        netPassingYardsPerGame:
          format(
            get(["netPassingYardsPerGame", "netPassYardsPerGame"], ["off"]),
          ) || format(safeDivide(netPassingYards, safeGames)),
        passingAttempts,
        passingTouchdownPct:
          normalizePercent(
            get(["passingTouchdownPct", "passingTouchdownPercentage"], ["off"]),
          ) || calcPct(passingTouchdowns, passingAttempts),
        passingTouchdowns,
        QBRating: format(
          get(
            ["QBRating", "qbr", "quarterbackRating", "passerRating"],
            ["off"],
          ),
        ),
        sacks,
        sackYardsLost,
        yardsPerPassAttempt:
          format(
            get(["yardsPerPassAttempt", "yardsPerPass", "ypa"], ["off"]),
          ) || format(safeDivide(passingYards, passingAttempts)),
        passingYards,
        passingFumblesLost: get(
          ["passingFumblesLost", "passFumblesLost"],
          ["off"],
        ),
        passingYardsPerGame:
          format(get(["passingYardsPerGame", "passYardsPerGame"], ["off"])) ||
          format(safeDivide(passingYards, safeGames)),
        completionAttempts:
          get(["completionAttempts"], ["off"]) || passingAttempts,
        sacksYardsLost:
          get(["sacksYardsLost", "sackYardsLost"], ["off"]) || sackYardsLost,

        // ================= Rushing =================
        rushingAttempts,
        rushingYards,
        yardsPerRushAttempt:
          format(
            get(["yardsPerRushAttempt", "yardsPerRush", "ypc"], ["off"]),
          ) || format(safeDivide(rushingYards, rushingAttempts)),
        longRushing: get(["longRushing", "longRush", "rushingLong"], ["off"]),
        rushingBigPlays: get(
          ["rushingBigPlays", "rushBigPlays", "rushing20Plus"],
          ["off"],
        ),
        rushingTouchdowns,
        rushingYardsPerGame:
          format(get(["rushingYardsPerGame", "rushYardsPerGame"], ["off"])) ||
          format(safeDivide(rushingYards, safeGames)),
        rushingFumbles: get(["rushingFumbles", "rushFumbles"], ["off"]),
        rushingFumblesLost: get(
          ["rushingFumblesLost", "rushFumblesLost"],
          ["off"],
        ),
        rushingFirstDowns: get(
          ["rushingFirstDowns", "rushFirstDowns", "firstDownsRushing"],
          ["off", "gen"],
        ),

        // ================= Receiving =================
        receptions,
        receivingTargets,
        receivingYards,
        receivingTouchdowns,
        longReception:
          get(["longReception", "longReceiving", "receivingLong"], ["off"]) ||
          get(["longPassing", "longPass"], ["off"]),
        receivingBigPlays: get(
          ["receivingBigPlays", "receiving20Plus"],
          ["off"],
        ),
        receivingYardsPerGame:
          format(get(["receivingYardsPerGame"], ["off"])) ||
          format(safeDivide(receivingYards, safeGames)),
        receivingFumbles: get(["receivingFumbles"], ["off"]),
        receivingFumblesLost: get(["receivingFumblesLost"], ["off"]),
        receivingYardsAfterCatch: get(
          ["receivingYardsAfterCatch", "yardsAfterCatch", "yac"],
          ["off"],
        ),
        receivingFirstDowns: get(
          ["receivingFirstDowns", "firstDownsReceiving"],
          ["off"],
        ),
        yardsPerReception:
          format(get(["yardsPerReception", "yardsPerCatch", "ypr"], ["off"])) ||
          format(safeDivide(receivingYards, receptions)),

        // ================= First Downs / Efficiency =================
        firstDowns,
        firstDownsRushing,
        firstDownsPassing,
        firstDownsPenalty,
        thirdDownConvs,
        thirdDownAttempts,
        thirdDownConvPct,
        fourthDownConvs,
        fourthDownAttempts,
        fourthDownConvPct,
        totalPenalties,
        totalPenaltyYards,
        possessionTimeSeconds: get(
          ["possessionTimeSeconds", "possessionTime", "timeOfPossession"],
          ["gen", "off"],
        ),
        redzoneFieldGoalPct: normalizePercent(
          get(["redzoneFieldGoalPct", "redZoneFieldGoalPct"], ["gen", "off"]),
        ),
        redzoneScoringPct: normalizePercent(
          get(["redzoneScoringPct", "redZoneScoringPct"], ["gen", "off"]),
        ),
        redzoneEfficiencyPct: normalizePercent(
          get(["redzoneEfficiencyPct", "redZoneEfficiencyPct"], ["gen", "off"]),
        ),
        redzoneTouchdownPct: normalizePercent(
          get(["redzoneTouchdownPct", "redZoneTouchdownPct"], ["gen", "off"]),
        ),
        totalTakeaways,
        totalGiveaways,
        turnOverDifferential,
        fumblesLost,
        thirdDownEff:
          get(["thirdDownEff", "thirdDownEfficiency"], ["gen", "off"]) ||
          thirdDownConvPct,
        fourthDownEff:
          get(["fourthDownEff", "fourthDownEfficiency"], ["gen", "off"]) ||
          fourthDownConvPct,
        totalPenaltiesYards:
          get(["totalPenaltiesYards", "penaltiesYards"], ["gen", "off"]) ||
          totalPenaltyYards,

        // ================= Defensive =================
        soloTackles: get(["soloTackles", "solo"], ["def"]),
        assistTackles: get(
          ["assistTackles", "assistedTackles", "assists"],
          ["def"],
        ),
        totalTackles: get(["totalTackles", "tackles"], ["def"]),
        sackYards: get(["sackYards", "sacksYards"], ["def"]),
        stuffs: get(["stuffs", "runStuffs"], ["def"]),
        passesDefended: get(["passesDefended", "passDeflections"], ["def"]),
        avgInterceptionYards:
          format(
            get(["avgInterceptionYards", "interceptionYardsAvg"], ["def"]),
          ) ||
          format(
            safeDivide(interceptionYards, get(["interceptions"], ["def"])),
          ),
        longInterception: get(["longInterception", "longInt"], ["def"]),
        miscTouchdowns: get(
          ["miscTouchdowns", "miscTD", "miscTDs"],
          ["def", "gen"],
        ),
        kicksBlocked: get(["kicksBlocked", "blockedKicks"], ["def", "gen"]),
        tacklesForLoss: get(["tacklesForLoss", "tfl"], ["def"]),

        // ================= Interceptions =================
        interceptionYards,
        interceptionTouchdowns: get(
          ["interceptionTouchdowns", "interceptionTD", "interceptionTDs"],
          ["def"],
        ),
        totalInterceptionsYards:
          get(["totalInterceptionsYards", "interceptionYards"], ["def"]) ||
          interceptionYards,

        // ================= Fumbles =================
        fumbles,
        fumblesForced: get(["fumblesForced", "forcedFumbles"], ["def"]),
        fumblesRecovered: get(
          ["fumblesRecovered", "recoveries"],
          ["def", "gen"],
        ),
        fumblesTouchdowns: get(
          ["fumblesTouchdowns", "fumbleTouchdowns", "fumbleTD", "fumbleTDs"],
          ["def", "gen"],
        ),
        gamesPlayed,
        fumblesAndLost: get(["fumblesAndLost"], ["gen", "off"]) || fumblesLost,

        // ================= Returns =================
        kickReturns: get(["kickReturns", "kickoffReturns"], ["gen", "off"]),
        kickReturnYards: get(
          ["kickReturnYards", "kickoffReturnYards"],
          ["gen", "off"],
        ),
        yardsPerKickReturn:
          format(
            get(
              ["yardsPerKickReturn", "yardsPerKickoffReturn"],
              ["gen", "off"],
            ),
          ) ||
          format(
            safeDivide(
              get(["kickReturnYards", "kickoffReturnYards"], ["gen", "off"]),
              get(["kickReturns", "kickoffReturns"], ["gen", "off"]),
            ),
          ),
        longKickReturn: get(
          ["longKickReturn", "longKickoffReturn"],
          ["gen", "off"],
        ),
        kickReturnTouchdowns: get(
          ["kickReturnTouchdowns", "kickoffReturnTouchdowns"],
          ["gen", "off"],
        ),
        puntReturns: get(["puntReturns"], ["gen", "off"]),
        puntReturnYards: get(["puntReturnYards"], ["gen", "off"]),
        yardsPerPuntReturn:
          format(get(["yardsPerPuntReturn"], ["gen", "off"])) ||
          format(
            safeDivide(
              get(["puntReturnYards"], ["gen", "off"]),
              get(["puntReturns"], ["gen", "off"]),
            ),
          ),
        longPuntReturn: get(["longPuntReturn"], ["gen", "off"]),
        puntReturnTouchdowns: get(["puntReturnTouchdowns"], ["gen", "off"]),
        puntReturnFairCatches: get(["puntReturnFairCatches"], ["gen", "off"]),
        kickReturnFumblesLost: get(["kickReturnFumblesLost"], ["gen", "off"]),
        puntReturnFumblesLost: get(["puntReturnFumblesLost"], ["gen", "off"]),
        totalPuntReturnsYards:
          get(["totalPuntReturnsYards"], ["gen", "off"]) ||
          get(["puntReturnYards"], ["gen", "off"]),

        // ================= Kicking =================
        fieldGoalsMade,
        fieldGoalAttempts,
        fieldGoalPct:
          normalizePercent(
            get(["fieldGoalPct", "fieldGoalPercentage"], ["gen", "off"]),
          ) || calcPct(fieldGoalsMade, fieldGoalAttempts),
        longFieldGoalMade: get(
          ["longFieldGoalMade", "longFieldGoal"],
          ["gen", "off"],
        ),
        fieldGoalAttempts1_19: get(
          ["fieldGoalAttempts1_19", "fgAttempts1_19"],
          ["gen", "off"],
        ),
        fieldGoalAttempts20_29: get(
          ["fieldGoalAttempts20_29", "fgAttempts20_29"],
          ["gen", "off"],
        ),
        fieldGoalAttempts30_39: get(
          ["fieldGoalAttempts30_39", "fgAttempts30_39"],
          ["gen", "off"],
        ),
        fieldGoalAttempts40_49: get(
          ["fieldGoalAttempts40_49", "fgAttempts40_49"],
          ["gen", "off"],
        ),
        fieldGoalAttempts50: get(
          ["fieldGoalAttempts50", "fgAttempts50"],
          ["gen", "off"],
        ),
        extraPointsMade,
        extraPointAttempts,
        extraPointPct:
          normalizePercent(
            get(["extraPointPct", "extraPointPercentage"], ["gen", "off"]),
          ) || calcPct(extraPointsMade, extraPointAttempts),
        fieldGoalsMade1_19: get(
          ["fieldGoalsMade1_19", "fgMade1_19"],
          ["gen", "off"],
        ),
        fieldGoalsMade20_29: get(
          ["fieldGoalsMade20_29", "fgMade20_29"],
          ["gen", "off"],
        ),
        fieldGoalsMade30_39: get(
          ["fieldGoalsMade30_39", "fgMade30_39"],
          ["gen", "off"],
        ),
        fieldGoalsMade40_49: get(
          ["fieldGoalsMade40_49", "fgMade40_49"],
          ["gen", "off"],
        ),
        fieldGoalsMade50: get(["fieldGoalsMade50", "fgMade50"], ["gen", "off"]),
        totalKickingPoints: get(
          ["totalKickingPoints", "kickingPoints"],
          ["gen", "off"],
        ),
        touchbackPct: normalizePercent(
          get(["touchbackPct", "touchbackPercentage"], ["gen", "off"]),
        ),
        avgKickoffReturnYards: format(
          get(
            ["avgKickoffReturnYards", "averageKickoffReturnYards"],
            ["gen", "off"],
          ),
        ),
        kickoffReturnYards: get(
          ["kickoffReturnYards", "kickReturnYards"],
          ["gen", "off"],
        ),
        kickoffReturns: get(["kickoffReturns", "kickReturns"], ["gen", "off"]),
        totalKickoffYards: get(
          ["totalKickoffYards", "kickoffYards"],
          ["gen", "off"],
        ),
        totalGoalsVsAttemps:
          get(
            ["totalGoalsVsAttemps", "totalGoalsVsAttempts"],
            ["gen", "off"],
          ) || fieldGoalAttempts,

        // ================= Punting =================
        punts: get(["punts"], ["gen", "off"]),
        puntYards: get(["puntYards", "puntingYards"], ["gen", "off"]),
        longPunt: get(["longPunt"], ["gen", "off"]),
        grossAvgPuntYards: format(
          get(["grossAvgPuntYards", "grossAveragePuntYards"], ["gen", "off"]),
        ),
        netAvgPuntYards: format(
          get(["netAvgPuntYards", "netAveragePuntYards"], ["gen", "off"]),
        ),
        puntsBlocked: get(["puntsBlocked", "blockedPunts"], ["gen", "off"]),
        puntsInside20: get(["puntsInside20", "inside20"], ["gen", "off"]),
        touchbacks: get(["touchbacks", "puntTouchbacks"], ["gen", "off"]),
        fairCatches: get(["fairCatches"], ["gen", "off"]),
        avgPuntReturnYards: format(
          get(["avgPuntReturnYards", "averagePuntReturnYards"], ["gen", "off"]),
        ),
        totalPuntsYards:
          get(["totalPuntsYards"], ["gen", "off"]) ||
          get(["puntYards", "puntingYards"], ["gen", "off"]),

        // ================= Scoring / Totals =================
        teamGamesPlayed:
          get(["teamGamesPlayed", "gamesPlayed"], ["gen", "off"]) ||
          gamesPlayed,
        yardsPerGame:
          format(get(["yardsPerGame", "totalYardsPerGame"], ["gen", "off"])) ||
          format(safeDivide(totalYards, safeGames)),
        totalYards,
        totalOffensivePlays: get(
          ["totalOffensivePlays", "offensivePlays", "plays"],
          ["gen", "off"],
        ),
        totalPointsPerGame:
          format(
            get(["totalPointsPerGame", "pointsPerGame"], ["gen", "off"]),
          ) || format(safeDivide(totalPoints, safeGames)),
        totalPoints,
        totalTouchdowns: get(["totalTouchdowns", "touchdowns"], ["gen", "off"]),
        returnTouchdowns: get(["returnTouchdowns"], ["gen", "off", "def"]),
        fieldGoals: get(["fieldGoals"], ["gen", "off"]) || fieldGoalsMade,
        kickExtraPoints:
          get(["kickExtraPoints"], ["gen", "off"]) || extraPointsMade,
        totalTwoPointConvs: get(
          ["totalTwoPointConvs", "twoPointConversions", "twoPointConvs"],
          ["gen", "off"],
        ),
      };

      setTeamStats(aggregated);
    } catch (err: any) {
      console.error("❌ Error fetching football team stats:", err?.message);

      setTeamStatsError(
        err instanceof Error ? err : new Error("Failed to load team stats"),
      );
      setTeamStats(null);
    } finally {
      setTeamStatsLoading(false);
    }
  }, [teamId, league]);

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  return {
    teamStats,
    teamStatsLoading,
    teamStatsError,
    refresh: fetchTeamStats,
  };
}
