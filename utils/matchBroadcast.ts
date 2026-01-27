// utils/matchBroadcast.ts

type SimpleTeam = {
  name: string;
};

type SimpleGame = {
  date: string | Date; // <--- allow Date
  home: SimpleTeam;
  away: SimpleTeam;
};

type Broadcast = {
  name?: string;
  shortName?: string;
  names?: string[];
};

type BroadcastEntry = {
  gameId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  name: string;
  status: string;
  broadcasts: {
    market: any;
    type?: any;
    name?: string;
    network?: string | null;
  }[];
};

export function normalizeTeamName(name: string): string {
  return name?.toLowerCase().replace(/[^a-z]/g, "");
}

export function matchBroadcastToGame(
  game: SimpleGame,
  broadcastData?: BroadcastEntry[]
) {
  if (!Array.isArray(broadcastData)) return null;

  const gameDate = (
    game.date instanceof Date ? game.date.toISOString() : game.date
  ).split("T")[0];
  const awayName = normalizeTeamName(game.away.name);
  const homeName = normalizeTeamName(game.home.name);

  return broadcastData.find((b) => {
    const dateMatch = b.date === gameDate;
    const homeMatch = normalizeTeamName(b.homeTeam) === homeName;
    const awayMatch = normalizeTeamName(b.awayTeam) === awayName;

    return dateMatch && homeMatch && awayMatch;
  });
}

export function getBroadcastDisplay(broadcasts?: string[]) {
  if (!broadcasts?.length) return "";

  const allNames = broadcasts
    .map((n) => n.toLowerCase())
    .filter(Boolean);

  const networkMap: [string, string][] = [
    ["espn2", "ESPN2"],
    ["espn3", "ESPN3"],
    ["espn+", "ESPN+"],
    ["espnu", "ESPNU"],
    ["sec network", "SECN"],
    ["secn+", "SECN+"],
    ["acc network", "ACCN"],
    ["abc", "ABC"],
    ["tnt", "TNT"],
    ["btn", "BTN"],
    ["tbs", "TBS"],
    ["fox sports", "FS1"],
    ["fs1", "FS1"],
    ["fox", "FOX"],
    ["cbs", "CBS"],
    ["peacock", "Peacock"],
    ["nbc", "NBC"],
    ["netflix", "Netflix"],
    ["prime video", "Prime"],
    ["amazon", "Prime"],
    ["nba league pass", "NBA League Pass"],
    ["nba tv", "NBA TV"],
    ["hbo max", "MAX"],
    ["max", "MAX"],
    ["espn", "ESPN"],
  ];

  // special combos
  if (allNames.some(n => n.includes("abc")) && allNames.some(n => n.includes("espn")))
    return "ABC/ESPN";
  if (allNames.some(n => n.includes("nbc")) && allNames.some(n => n.includes("peacock")))
    return "NBC/Peacock";
  if (allNames.some(n => n.includes("tnt")) && allNames.some(n => n.includes("max")))
    return "TNT/MAX";

  for (const [key, value] of networkMap) {
    if (allNames.some((n) => n.includes(key))) {
      return value;
    }
  }

  // fallback
  const first = broadcasts[0];
  return first ? first.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}


