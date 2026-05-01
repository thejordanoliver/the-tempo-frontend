import { getMLBTeam } from "constants/teamsMLB";
import { MLBGame } from "types/baseball";

export const mockMLBGames: MLBGame[] = [
  // --- Scheduled Game ---
  {
    id: 2001,
    league: {
      id: 1,
      name: "MLB",
      type: "League",
      logo: "https://media.api-sports.io/baseball/leagues/1.png",
      season: 2025,
    },
    country: {
      id: 1,
      name: "USA",
      code: "US",
      flag: "https://media.api-sports.io/flags/us.svg",
    },
    date: "7:05 PM",
    timestamp: Math.floor(Date.now() / 1000) + 21600,

    status: {
      long: "Scheduled",
      short: "NS",
      clock: null,
    },
    teams: {
      home: getMLBTeam(17),  // Yankees
      away: getMLBTeam(21), // Red Sox
    },
    scores: {
      home: {
        hits: 0,
        errors: 0,
        innings: {},
        total: 0,
      },
      away: {
        hits: 0,
        errors: 0,
        innings: {},
        total: 0,
      },
    },
  },

  // --- In Progress Game ---
  {
    id: 2001,
    league: {
      id: 1,
      name: "MLB",
      type: "League",
      logo: "https://media.api-sports.io/baseball/leagues/1.png",
      season: 2025,
    },
    country: {
      id: 1,
      name: "USA",
      code: "US",
      flag: "https://media.api-sports.io/flags/us.svg",
    },
    date: "7:05 PM",
    timestamp: Math.floor(Date.now() / 1000) + 21600,

    status: {
      long: "Scheduled",
      short: "NS",
      clock: null,
    },
    teams: {
      home: getMLBTeam(17),  // Yankees
      away: getMLBTeam(21), // Red Sox
    },
    scores: {
      home: {
        hits: 0,
        errors: 0,
        innings: {},
        total: 0,
      },
      away: {
        hits: 0,
        errors: 0,
        innings: {},
        total: 0,
      },
    },
  },


  // --- Final Game ---
  {
    id: 2001,
    league: {
      id: 1,
      name: "MLB",
      type: "League",
      logo: "https://media.api-sports.io/baseball/leagues/1.png",
      season: 2025,
    },
    country: {
      id: 1,
      name: "USA",
      code: "US",
      flag: "https://media.api-sports.io/flags/us.svg",
    },
    date: "7:05 PM",
    timestamp: Math.floor(Date.now() / 1000) + 21600,

    status: {
      long: "Scheduled",
      short: "NS",
      clock: null,
    },
    teams: {
      home: getMLBTeam(17),  // Yankees
      away: getMLBTeam(21), // Red Sox
    },
    scores: {
      home: {
        hits: 0,
        errors: 0,
        innings: {},
        total: 0,
      },
      away: {
        hits: 0,
        errors: 0,
        innings: {},
        total: 0,
      },
    },
  },

];
