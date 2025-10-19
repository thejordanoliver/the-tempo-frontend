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

const gameDate = (game.date instanceof Date ? game.date.toISOString() : game.date).split("T")[0];
  const awayName = normalizeTeamName(game.away.name);
  const homeName = normalizeTeamName(game.home.name);

  return broadcastData.find((b) => {
    const dateMatch = b.date === gameDate;
    const homeMatch = normalizeTeamName(b.homeTeam) === homeName;
    const awayMatch = normalizeTeamName(b.awayTeam) === awayName;

    return dateMatch && homeMatch && awayMatch;
  });
}




export function getBroadcastDisplay(broadcasts: Broadcast[]) {
  if (!broadcasts?.length) return "";

  const allNames = broadcasts
    .map((b) =>
      Array.isArray(b.names) ? b.names.join("/") : b.name || b.shortName || ""
    )
    .filter(Boolean)
    .map((n) => n.toLowerCase());

  const networkMap: Record<string, string> = {
    espn: "ESPN",
    espn2: "ESPN2",
    espn3: "ESPN3",
    abc: "ABC",
    tnt: "TNT",
    tbs: "TBS",
    fox: "FOX",
    "fox sports": "FS1",
    fs1: "FS1",
    cbs: "CBS",
    nbcsn: "NBC",
    nbc: "NBC",
    "nfl network": "NFLN",
    "nfl net": "NFLN",
    "prime video": "Prime",
    amazon: "Prime",
    "nba tv": "NBA TV",
    "hbo max": "MAX",
  };

  // special cases
  const hasABC = allNames.some((n) => n.includes("abc"));
  const hasESPN = allNames.some((n) => n.includes("espn"));
  const hasTNT = allNames.some((n) => n.includes("tnt"));
  const hasHBOMax = allNames.some((n) => n.includes("hbo max") || n.includes("max"));

  if (hasABC && hasESPN) return "ABC/ESPN";
  if (hasTNT && hasHBOMax) return "TNT/MAX";

  // find first main network match
  for (const key in networkMap) {
    if (allNames.some((n) => n.includes(key))) {
      return networkMap[key];
    }
  }

  // fallback: first valid name (capitalized)
  const first = broadcasts[0]?.name || broadcasts[0]?.shortName || "";
  return first ? first.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}


