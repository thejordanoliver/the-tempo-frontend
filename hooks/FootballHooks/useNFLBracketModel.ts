import type {
  CardLayout,
  ConnectorTarget,
} from "@/types/football/nflBracketTypes";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  COLS,
  FINALS_HEIGHT,
  FINALS_WIDTH,
  WILD_CARD_TO_DIVISIONAL,
  centerY,
  getCenteredX,
  getX,
} from "@/utils/nflBracketLayout";
import {
  findNextRoundIndex,
  getConference,
  getGamesByWeek,
  getRoundConferenceGames,
  orderWildCardGamesForBracket,
} from "@/utils/nflBracketUtils";
import { useMemo } from "react";
import { BYE_CARD_HEIGHT } from "styles/PlayoffStyles/ByeTeamCardStyles";
import type { BracketApiResponse } from "types/football/football";
import {
  selectNFLByeTeam,
  selectNFLSuperBowl,
} from "utils/nflPlayoffSelection";

export function useNFLBracketModel(bracket: BracketApiResponse | null) {
  const wildCardGames = useMemo(() => getGamesByWeek(bracket, 1), [bracket]);

  const divisionalGames = useMemo(() => getGamesByWeek(bracket, 2), [bracket]);

  const conferenceGames = useMemo(() => getGamesByWeek(bracket, 3), [bracket]);

  const superBowlGame = useMemo(() => selectNFLSuperBowl(bracket), [bracket]);

  /* ---------------- AFC DATA ---------------- */

  const rawAfcWildCard = useMemo(
    () => getRoundConferenceGames(wildCardGames, "AFC", 3),
    [wildCardGames],
  );

  const afcDivisional = useMemo(
    () => getRoundConferenceGames(divisionalGames, "AFC", 2),
    [divisionalGames],
  );

  const afcWildCard = useMemo(
    () => orderWildCardGamesForBracket(rawAfcWildCard, afcDivisional),
    [rawAfcWildCard, afcDivisional],
  );

  const afcConference = useMemo(
    () => conferenceGames.find((game) => getConference(game) === "AFC") ?? null,
    [conferenceGames],
  );

  /* ---------------- NFC DATA ---------------- */

  const rawNfcWildCard = useMemo(
    () => getRoundConferenceGames(wildCardGames, "NFC", 3),
    [wildCardGames],
  );

  const nfcDivisional = useMemo(
    () => getRoundConferenceGames(divisionalGames, "NFC", 2),
    [divisionalGames],
  );

  const nfcWildCard = useMemo(
    () => orderWildCardGamesForBracket(rawNfcWildCard, nfcDivisional),
    [rawNfcWildCard, nfcDivisional],
  );

  const nfcConference = useMemo(
    () => conferenceGames.find((game) => getConference(game) === "NFC") ?? null,
    [conferenceGames],
  );

  /* ---------------- CARD LAYOUTS ---------------- */

  const afcByeTeam = selectNFLByeTeam(rawAfcWildCard, afcDivisional);
  const nfcByeTeam = selectNFLByeTeam(rawNfcWildCard, nfcDivisional);
  const AFC_BYE = useMemo(
    () => ({
      x: getX(COLS.AFC_R1),
      y: 50,
      width: CARD_WIDTH,
      height: BYE_CARD_HEIGHT,
    }),
    [],
  );
  const NFC_BYE = { ...AFC_BYE, x: getX(COLS.NFC_R1) };

  const AFC_R1 = useMemo(() => {
    const startingY = 120;
    const gap = 170;

    return Array.from({ length: 3 }, (_, index) => ({
      x: getX(COLS.AFC_R1),
      y: startingY + index * gap,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }));
  }, []);

  const NFC_R1 = useMemo(
    () =>
      AFC_R1.map((layout) => ({
        ...layout,
        x: getX(COLS.NFC_R1),
      })),
    [AFC_R1],
  );

  const AFC_R2 = useMemo(
    () => [
      {
        x: getCenteredX(COLS.AFC_R2, CARD_WIDTH),
        y: (centerY(AFC_BYE) + centerY(AFC_R1[0])) / 2 - CARD_HEIGHT / 2,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
      {
        x: getCenteredX(COLS.AFC_R2, CARD_WIDTH),
        y: (AFC_R1[1].y + AFC_R1[2].y) / 2,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    ],
    [AFC_R1, AFC_BYE],
  );

  const NFC_R2 = useMemo(
    () =>
      AFC_R2.map((layout) => ({
        ...layout,
        x: getCenteredX(COLS.NFC_R2, CARD_WIDTH),
      })),
    [AFC_R2],
  );

  const AFC_R3 = useMemo(
    () => ({
      x: getCenteredX(COLS.AFC_R3, CARD_WIDTH),
      y: (AFC_R2[0].y + AFC_R2[1].y) / 2,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }),
    [AFC_R2],
  );

  const NFC_R3 = useMemo(
    () => ({
      ...AFC_R3,
      x: getCenteredX(COLS.NFC_R3, CARD_WIDTH),
    }),
    [AFC_R3],
  );

  const FINALS_LAYOUT = useMemo<CardLayout>(
    () => ({
      x: getCenteredX(COLS.FINALS, FINALS_WIDTH),

      y: (centerY(AFC_R3) + centerY(NFC_R3)) / 2 - FINALS_HEIGHT / 2,

      width: FINALS_WIDTH,
      height: FINALS_HEIGHT,
    }),
    [AFC_R3, NFC_R3],
  );

  /* ---------------- AFC CONNECTIONS ---------------- */

  const afcConnections = useMemo(() => {
    const connections: ConnectorTarget[] = [];

    afcWildCard.forEach((game, index) => {
      const matchedTargetIndex = findNextRoundIndex(game, afcDivisional);

      const targetIndex = matchedTargetIndex ?? WILD_CARD_TO_DIVISIONAL[index];

      const sourceLayout = AFC_R1[index];

      const targetLayout =
        targetIndex !== undefined ? AFC_R2[targetIndex] : undefined;

      if (sourceLayout && targetLayout) {
        connections.push({
          source: sourceLayout,
          target: targetLayout,
        });
      }
    });

    afcDivisional.forEach((_, index) => {
      const sourceLayout = AFC_R2[index];

      if (afcConference && sourceLayout) {
        connections.push({
          source: sourceLayout,
          target: AFC_R3,
        });
      }
    });

    if (afcConference) {
      connections.push({
        source: AFC_R3,
        target: FINALS_LAYOUT,
      });
    }

    return connections;
  }, [
    afcWildCard,
    afcDivisional,
    afcConference,
    AFC_R1,
    AFC_R2,
    AFC_R3,
    FINALS_LAYOUT,
  ]);

  /* ---------------- NFC CONNECTIONS ---------------- */

  const nfcConnections = useMemo(() => {
    const connections: ConnectorTarget[] = [];

    nfcWildCard.forEach((game, index) => {
      const matchedTargetIndex = findNextRoundIndex(game, nfcDivisional);

      const targetIndex = matchedTargetIndex ?? WILD_CARD_TO_DIVISIONAL[index];

      const sourceLayout = NFC_R1[index];

      const targetLayout =
        targetIndex !== undefined ? NFC_R2[targetIndex] : undefined;

      if (sourceLayout && targetLayout) {
        connections.push({
          source: sourceLayout,
          target: targetLayout,
        });
      }
    });

    nfcDivisional.forEach((_, index) => {
      const sourceLayout = NFC_R2[index];

      if (nfcConference && sourceLayout) {
        connections.push({
          source: sourceLayout,
          target: NFC_R3,
        });
      }
    });

    if (nfcConference) {
      connections.push({
        source: NFC_R3,
        target: FINALS_LAYOUT,
      });
    }

    return connections;
  }, [
    nfcWildCard,
    nfcDivisional,
    nfcConference,
    NFC_R1,
    NFC_R2,
    NFC_R3,
    FINALS_LAYOUT,
  ]);

  return {
    afcWildCard,
    afcDivisional,
    afcConference,
    nfcWildCard,
    nfcDivisional,
    nfcConference,
    superBowlGame,
    afcByeTeam,
    nfcByeTeam,
    AFC_BYE,
    NFC_BYE,
    AFC_R1,
    NFC_R1,
    AFC_R2,
    NFC_R2,
    AFC_R3,
    NFC_R3,
    FINALS_LAYOUT,
    afcConnections,
    nfcConnections,
  };
}
