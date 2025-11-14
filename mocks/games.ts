import { teams } from "constants/teams";
import { Game } from "../types/types";
import { PlayObject } from "hooks/NFLHooks/useNFLGamePossession";

const getTeamByName = (name: string) =>
  teams.find((t) => t.name === name) ?? teams[0];

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

