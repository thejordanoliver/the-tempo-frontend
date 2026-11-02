import type { ExploreWidgetLeague } from "./widgets";

export type DeviceGameWidgetGame = {
  key: string;
  league: ExploreWidgetLeague;
  url: string;
  status: string;
  live: boolean;
  away: DeviceGameWidgetTeam;
  home: DeviceGameWidgetTeam;
};

export type DeviceGameWidgetTeam = {
  name: string;
  code: string;
  value: string;
  color: string;
};

export type DeviceGameWidgetConfiguration = {
  league: "all" | ExploreWidgetLeague;
};

export type DeviceGameWidgetProps = {
  games: DeviceGameWidgetGame[];
  title: string;
  message: string;
  url: string;
  updatedAt: number;
  updatedLabel: string;
  stale: boolean;
  colorScheme: "light" | "dark" | "system";
  fonts: { MEDIUM: string; SEMIBOLD: string; BOLD: string };
  palettes: Record<
    "light" | "dark",
    {
      background: string;
      text: string;
      secondary: string;
      live: string;
    }
  >;
};
