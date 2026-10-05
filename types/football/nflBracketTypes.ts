import type { BracketApiResponse } from "types/football/football";

export type PlayoffGame = BracketApiResponse["games"][number];
export type PlayoffTeam = PlayoffGame["home"];
export type Conference = "AFC" | "NFC";

export type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ConnectorTarget = {
  source?: CardLayout;
  target?: CardLayout;
};
