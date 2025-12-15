// mocks/bracketData.ts

import { BracketData, BracketTeam } from "types/cfb";
import { teams } from "constants/teamsCFB";
import { ImageSourcePropType } from "react-native";

// Local lookup: no import of getCFBTeam
const findTeam = (value: string | number) => {
  const v = String(value).toLowerCase();

  return (
    teams.find(
      (t) =>
        String(t.id) === v ||
        String(t.espnID) === v ||
        t.code?.toLowerCase() === v ||
        t.name?.toLowerCase() === v ||
        t.fullName?.toLowerCase() === v
    ) || null
  );
};

/**
 * Builds a BracketTeam using the local teams array.
 */
const team = (code: string, seed: number): BracketTeam => {
  const t = findTeam(code);

  if (!t) {
    console.warn(`CFB team not found for: ${code}`);
    return {
      id: code,
      code,
      name: code,
      seed,
      logo: require("../assets/images/placeholder.png"),
    };
  }

  return {
    id: t.code ?? String(t.id),
    code: t.code ?? code,
    name: t.fullName ?? t.name ?? t.code ?? code,
    fullName: t.fullName,
    shortName: t.shortName,
    seed,
    logo: (t.logo ?? require("../assets/images/placeholder.png")) as ImageSourcePropType,
    logoLight: (t.logoLight ?? t.logo) as ImageSourcePropType,
  };
};


export const bracketData: BracketData = {
  first: {
    title: "First Round",
    games: [
      { id: "fr1", round: "first", top: team("JMU", 12), bottom: team("OREGON", 5) },
      { id: "fr2", round: "first", top: team("ALA", 9), bottom: team("OU", 8) },
      { id: "fr3", round: "first", top: team("TULANE", 11), bottom: team("MISS", 6) },
      { id: "fr4", round: "first", top: team("MIAMI", 10), bottom: team("TA&M", 7) },
    ],
  },

  quarterfinal: {
    title: "Quarterfinals",
    games: [
      { id: "qf1", round: "quarterfinal", top: null, bottom: team("TTU", 4) },
      { id: "qf2", round: "quarterfinal", top: null, bottom: team("INDIANA", 1) },
      { id: "qf3", round: "quarterfinal", top: null, bottom: team("UGA", 3) },
      { id: "qf4", round: "quarterfinal", top: null, bottom: team("OSU", 2) },
    ],
  },

  semifinal: {
    title: "Semifinals",
    games: [
      { id: "sf1", round: "semifinal", top: null, bottom: null },
      { id: "sf2", round: "semifinal", top: null, bottom: null },
    ],
  },

  championship: {
    title: "National Championship",
    games: [
      { id: "nc", round: "championship", top: null, bottom: null },
    ],
  },
};
