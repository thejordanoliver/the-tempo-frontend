import { teams } from "constants/teams";
import { teams as mlbTeams } from "constants/teamsMLB";
import { MLBGame } from "types/mlb";
import { Game } from "../types/types";

const getTeamByName = (name: string) =>
  teams.find((t) => t.name === name) ?? teams[0];

const getTeam = (id: number) =>
  mlbTeams.find((t) => t.id === id) ?? mlbTeams[0];

export const mockGames: Game[] = [
  {
    id: 101,
    date: new Date().toISOString(),
    time: "7:30 PM ET",
    status: {
      short: 1,
      long: "Scheduled",
      halftime: false,
    },
    home: getTeamByName("Lakers"),
    away: getTeamByName("Warriors"),
    homeScore: 0,
    awayScore: 0,
    periods: { current: 0, total: 4, endOfPeriod: false },
    venue: { name: "Crypto.com Arena", city: "Los Angeles", state: "CA" },
  },
  {
    id: 102,
    date: new Date().toISOString(),
    time: "8:00 PM ET",
    status: {
      short: 2,
      long: "In Progress",
      halftime: false,
      clock: "3:42",
    },
    home: getTeamByName("Mavericks"),
    away: getTeamByName("Nuggets"),
    homeScore: 88,
    awayScore: 84,
    periods: { current: 3, total: 4, endOfPeriod: false },
    venue: { name: "American Airlines Center", city: "Dallas", state: "TX" },
  },
  {
    id: 103,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    time: "Final",
    status: {
      short: 3,
      long: "Final",
      halftime: false,
    },
    home: getTeamByName("Pacers"),
    away: getTeamByName("Rockets"),
    homeScore: 112,
    awayScore: 104,
    periods: { current: 4, total: 4, endOfPeriod: true },
    venue: { name: "Gainbridge Fieldhouse", city: "Indianapolis", state: "IN" },
  },
];

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
    date: {
      utc: new Date(Date.now() + 1000 * 60 * 60 * 6).toLocaleString(),
      time: "7:05 PM",
      timestamp: Math.floor(Date.now() / 1000) + 21600,
      timezone: "UTC",
    },
    status: {
      long: "Scheduled",
      short: "NS",
      clock: null,
    },
    teams: {
      home: getTeam(17), // Yankees
      away: getTeam(21), // Red Sox
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
    id: 2002,
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
    date: {
      utc: new Date().toISOString(),
      time: "8:10 PM",
      timestamp: Math.floor(Date.now() / 1000),
      timezone: "UTC",
    },
    status: {
      long: "Top 5",
      short: "LIVE",
      clock: "Top 5th",
    },
    teams: {
      home: getTeam(2), // Diamondbacks
      away: getTeam(10), // Rockies
    },
    scores: {
      home: {
        hits: 7,
        errors: 1,
        innings: {
          1: 1,
          2: 0,
          3: 2,
          4: 0,
          5: null,
        },
        total: 3,
      },
      away: {
        hits: 5,
        errors: 0,
        innings: {
          1: 0,
          2: 1,
          3: 0,
          4: 1,
          5: null,
        },
        total: 2,
      },
    },
  },

  // --- Final Game ---
  {
    id: 2003,
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
    date: {
      utc: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      time: "10:15 PM",
      timestamp: Math.floor(Date.now() / 1000) - 86400,
      timezone: "UTC",
    },
    status: {
      long: "Final",
      short: "FT",
      clock: null,
    },
    teams: {
      home: getTeam(26), // A's
      away: getTeam(4), // Cubs
    },
    scores: {
      home: {
        hits: 9,
        errors: 1,
        innings: {
          1: 0,
          2: 1,
          3: 0,
          4: 0,
          5: 3,
          6: 0,
          7: 1,
          8: 2,
          9: null,
        },
        total: 7,
      },
      away: {
        hits: 6,
        errors: 2,
        innings: {
          1: 1,
          2: 0,
          3: 0,
          4: 1,
          5: 0,
          6: 0,
          7: 1,
          8: 0,
          9: null,
        },
        total: 3,
      },
    },
  },
];
