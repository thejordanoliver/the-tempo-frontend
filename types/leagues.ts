import { BaseballGame } from "./baseball";
import { BasketballGame } from "./basketball";
import { FootballGame } from "./football/football";
import { HockeyGame } from "./hockey";
import { MMAFight } from "./mma";
import { SoccerGame } from "./soccer";

export type LeagueCategory =
  | "NBA"
  | "WNBA"
  | "NFL"
  | "UFL"
  | "MLB"
  | "NHL"
  | "College Football"
  | "College Baseball"
  | "College Softball"
  | "Men's College Basketball"
  | "Women's College Basketball"
  | "NBA Summer League"
  | "MMA"
  | "English Premier League"
  | "UEFA Europa League"
  | "UEFA Champions League"
  | "German Bundesliga"
  | "MLS"
  | "FIFA World Cup"
  | "FIFA Women's World Cup"
  | "Favorites";

export type CombinedGamesSection =
  | { category: "NBA"; data: BasketballGame[] }
  | { category: "WNBA"; data: BasketballGame[] }
  | { category: "NFL"; data: FootballGame[] }
  | { category: "UFL"; data: FootballGame[] }
  | { category: "MLB"; data: BaseballGame[] }
  | { category: "NHL"; data: HockeyGame[] }
  | { category: "MLS"; data: SoccerGame[] }
  | { category: "UEFA Champions League"; data: SoccerGame[] }
  | { category: "UEFA Europa League"; data: SoccerGame[] }
  | { category: "English Premier League"; data: SoccerGame[] }
  | { category: "FIFA World Cup"; data: SoccerGame[] }
  | { category: "FIFA Women's World Cup"; data: SoccerGame[] }
  | { category: "German Bundesliga"; data: SoccerGame[] }
  | { category: "College Football"; data: FootballGame[] }
  | { category: "Men's College Basketball"; data: BasketballGame[] }
  | { category: "Women's College Basketball"; data: BasketballGame[] }
  | { category: "College Baseball"; data: BaseballGame[] }
  | { category: "College Softball"; data: BaseballGame[] }
  | { category: "NBA Summer League"; data: BasketballGame[] }
  | { category: "MMA"; data: MMAFight[] }
  | { category: "Favorites"; data: CombinedGame[] };

export type CombinedGame =
  | BasketballGame
  | FootballGame
  | BaseballGame
  | BasketballGame
  | HockeyGame
  | SoccerGame
  | MMAFight;

export type CombinedGamesListProps = {
  gamesByCategory: CombinedGamesSection[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  showHeaders?: boolean;
  ListHeaderComponent?: React.ReactNode;
  isDark: boolean;
  viewMode: string;
};
