import BasketballGameCard from "@/components/Sports/Basketball/Games/BasketballGameCard";
import BasketballSquareGameCard from "@/components/Sports/Basketball/Games/BasketballSquareGameCard";
import BasketballStackedGameCard from "@/components/Sports/Basketball/Games/BasketballStackedGameCard";
import FootballGameCard from "@/components/Sports/Football/Games/FootballGameCard";
import FootballStackedGameCard from "@/components/Sports/Football/Games/FootballStackedGameCard";
import HockeyStackedGameCard from "@/components/Sports/Hockey/Games/HockeyStackedGameCard";
import TennisGameCard from "@/components/Sports/Tennis/Games/TennisGameCard";
import TennisSquareGameCard from "@/components/Sports/Tennis/Games/TennisSquareGameCard";
import TennisStackedGameCard from "@/components/Sports/Tennis/Games/TennisStackedGameCard";
import type { HomeLeagueId } from "@/constants/leagues";
import type { BaseballGame } from "@/types/baseball/baseball";
import type { BasketballGame } from "@/types/basketball/basketball";
import type { FootballGame } from "@/types/football/football";
import type { HockeyGame } from "@/types/hockey/hockey";
import type { HomeGameItem, HomeGameSection } from "@/types/leagues";
import type { SoccerGame } from "@/types/soccer/soccer";
import type { TennisMatch } from "@/types/tennis/tennis";
import type { VolleyballGame } from "@/types/volleyball/volleyball";
import { getHolidayLabel } from "@/utils/common/dateUtils";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import BaseballGamePreviewModal from "components/Sports/Baseball/GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "components/Sports/Baseball/Games/BaseballGameCard";
import BaseballSquareGameCard from "components/Sports/Baseball/Games/BaseballSquareGameCard";
import BaseballStackedGameCard from "components/Sports/Baseball/Games/BaseballStackedGameCard";
import RacingGameCard from "components/Sports/Racing/Games/RacingGameCard";
import RacingSquareGameCard from "components/Sports/Racing/Games/RacingSquareGameCard";
import RacingStackedGameCard from "components/Sports/Racing/Games/RacingStackedGameCard";
import VolleyballGameCard from "components/Sports/Volleyball/VolleyballGameCard";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import { SectionList, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { leagueGamesListStyles } from "styles/GamecardStyles/LeagueGamesListStyles";
import type { MMAFight } from "types/mma/mma";
import type { RacingEvent } from "types/racing/racing";
import { chunkIntoGridRows } from "utils/games/gameGrid";
import HeadingTwo from "../../Headings/HeadingTwo";
import SquareGameCardSkeleton from "../../Skeletons/GameCards/SquareGameCardSkeleton";
import HeaderSkeleton from "../../Skeletons/HeaderSkeleton";
import BasketballGamePreviewModal from "../../Sports/Basketball/GamePreview/BasketballGamePreviewModal";
import FootballGamePreviewModal from "../../Sports/Football/GamePreview/FootballGamePreviewModal";
import FootballSquareGameCard from "../../Sports/Football/Games/FootballSquareGameCard";
import HockeyGamePreviewModal from "../../Sports/Hockey/GamePreview/HockeyGamePreviewModal";
import HockeyGameCard from "../../Sports/Hockey/Games/HockeyGameCard";
import HockeyGameSquareCard from "../../Sports/Hockey/Games/HockeySqaureGameCard";
import MMAGamePreviewModal from "../../Sports/MMA/GamePreview/MMAGamePreviewModal";
import MMAGameCard from "../../Sports/MMA/Games/MMAGameCard";
import MMASquareGameCard from "../../Sports/MMA/Games/MMASquareGameCard";
import MMAStackedGameCard from "../../Sports/MMA/Games/MMAStackedGameCard";
import SoccerGamePreviewModal from "../../Sports/Soccer/GamePreview/SoccerGamePreviewModal";
import SoccerGameCard from "../../Sports/Soccer/Games/SoccerGameCard";
import SoccerSquareGameCard from "../../Sports/Soccer/Games/SoccerSquareGameCard";
import SoccerStackedGameCard from "../../Sports/Soccer/Games/SoccerStackedGameCard";
import TennisMatchPreviewModal from "../../Sports/Tennis/GamePreview/TennisMatchPreviewModal";
import ChampionshipGameCard from "./ChampionshipGameCard";

type ViewMode = "list" | "grid" | "stacked";
type LeagueGamesListProps = {
  sections: HomeGameSection[];
  loading: boolean;
  expectedCount?: number;
  showHeaders?: boolean;
  isDark: boolean;
  viewMode: ViewMode;
};

type GameCardProps = {
  item: HomeGameItem;
  viewMode: ViewMode;
  onPreview: (item: HomeGameItem) => void;
};

const styles = leagueGamesListStyles;
const LONG_PRESS_MS = 300;
const BASKETBALL_LEAGUES = new Set<HomeLeagueId>([
  "nba",
  "mcbb",
  "wcbb",
  "wnba",
  "gleague",
]);
const FOOTBALL_LEAGUES = new Set<HomeLeagueId>(["nfl", "cfb", "ufl"]);
const BASEBALL_LEAGUES = new Set<HomeLeagueId>(["mlb", "cb", "sb"]);
const HOCKEY_LEAGUES = new Set<HomeLeagueId>(["nhl", "mch", "wch"]);
const RACING_LEAGUES = new Set<HomeLeagueId>(["f1", "nascarpremier"]);
const SOCCER_LEAGUES = new Set<HomeLeagueId>([
  "mls",
  "msoc",
  "wsoc",
  "fifa",
  "fifaw",
  "bundesliga",
  "ligue1",
  "ligue2",
  "laliga",
  "champions",
  "europa",
  "leaguescup",
  "epl",
]);

const CHAMPIONSHIP_HEADLINES = [
  "NBA Finals",
  "WNBA Finals",
  "Super Bowl",
  "World Series",
  "Stanley Cup Final",
  "NBA Summer League - Final",
  "NCAA Men's Hockey National Championship",
  "NCAA Women's Ice Hockey Championship",
  "Men's College World Series Championship Final",
  "Women's College World Series Championship Finals",
  "College Football Playoff National Championship",
  "Men's Basketball Championship - National Championship",
  "Women's Basketball Championship - National Championship",
].map((headline) => headline.toLowerCase());

function basketballFlags(league: HomeLeagueId) {
  return {
    isNBA: league === "nba",
    isMCBB: league === "mcbb",
    isWCBB: league === "wcbb",
    isWNBA: league === "wnba",
    isGLEAGUE: league === "gleague",
  };
}
function footballFlags(league: HomeLeagueId) {
  return { isNFL: league === "nfl", isCFB: league === "cfb" };
}
function baseballFlags(league: HomeLeagueId) {
  return {
    isMLB: league === "mlb",
    isCB: league === "cb",
    isSB: league === "sb",
  };
}

function getGameDate({ game }: HomeGameItem): Date | null {
  const values: unknown[] = [
    "date" in game ? game.date : null,
    "startDate" in game ? game.startDate : null,
    "timestamp" in game ? game.timestamp : null,
  ];
  for (const value of values) {
    const date =
      value instanceof Date
        ? value
        : typeof value === "string" || typeof value === "number"
          ? new Date(value)
          : null;
    if (date && !Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function isChampionshipGame(item: HomeGameItem): boolean {
  const { league, game } = item;
  if (!league) return false;
  if (
    !BASKETBALL_LEAGUES.has(league) &&
    !FOOTBALL_LEAGUES.has(league) &&
    !BASEBALL_LEAGUES.has(league) &&
    league !== "nhl"
  )
    return false;
  const headline =
    "headline" in game ? String(game.headline ?? "").toLowerCase() : "";
  return CHAMPIONSHIP_HEADLINES.some((pattern) => headline.includes(pattern));
}

function getSectionTitle(section: HomeGameSection): string {
  switch (section.id) {
    case "nba":
    case "nfl": {
      const dates = section.data.map(getGameDate);
      const holidays = new Set(dates.map(getHolidayLabel));
      if (section.id === "nba") {
        return holidays.has("Christmas Day")
          ? "NBA Christmas Day"
          : section.title;
      }
      if (holidays.has("Thanksgiving Day")) return "NFL Thanksgiving Day";
      if (holidays.has("Christmas Day")) return "NFL Christmas Day";
      const hasNightGame = (weekday: number) =>
        dates.some(
          (date) =>
            date !== null && date.getDay() === weekday && date.getHours() >= 18,
        );
      if (hasNightGame(1)) return "Monday Night Football";
      if (hasNightGame(4)) return "Thursday Night Football";
      break;
    }
    case "wnba":
      if (
        section.data.some(
          ({ game }) => (game as BasketballGame).season?.type === 3,
        )
      )
        return "WNBA Playoffs";
      break;
    case "mlb":
      if (
        section.data.some(({ game }) => {
          const baseball = game as BaseballGame;
          return (
            baseball.season?.type === 3 &&
            !baseball.headline?.includes("World Series")
          );
        })
      )
        return "MLB Playoffs";
      break;
    case "cfb":
      if (
        section.data.some(({ game }) => {
          const football = game as FootballGame;
          return (
            football.season?.type === 3 &&
            football.headline?.includes("Playoff")
          );
        })
      )
        return "CFB Playoffs";
      if (section.data.some((item) => getGameDate(item)?.getDay() === 6))
        return "College Football Saturday";
      break;
  }
  return section.title;
}

const CARDS = {
  basketball: {
    list: BasketballGameCard,
    grid: BasketballSquareGameCard,
    stacked: BasketballStackedGameCard,
  },
  football: {
    list: FootballGameCard,
    grid: FootballSquareGameCard,
    stacked: FootballStackedGameCard,
  },
  baseball: {
    list: BaseballGameCard,
    grid: BaseballSquareGameCard,
    stacked: BaseballStackedGameCard,
  },
  hockey: {
    list: HockeyGameCard,
    grid: HockeyGameSquareCard,
    stacked: HockeyStackedGameCard,
  },
  soccer: {
    list: SoccerGameCard,
    grid: SoccerSquareGameCard,
    stacked: SoccerStackedGameCard,
  },
  racing: {
    list: RacingGameCard,
    grid: RacingSquareGameCard,
    stacked: RacingStackedGameCard,
  },
  mma: {
    list: MMAGameCard,
    grid: MMASquareGameCard,
    stacked: MMAStackedGameCard,
  },
  tennis: {
    list: TennisGameCard,
    grid: TennisSquareGameCard,
    stacked: TennisStackedGameCard,
  },
} as const;

function renderCard({ league, game }: HomeGameItem, mode: ViewMode): ReactNode {
  if (!league) return null;
  if (BASKETBALL_LEAGUES.has(league)) {
    const Card = CARDS.basketball[mode];
    return <Card game={game as BasketballGame} {...basketballFlags(league)} />;
  }
  if (FOOTBALL_LEAGUES.has(league)) {
    const Card = CARDS.football[mode];
    return <Card game={game as FootballGame} {...footballFlags(league)} />;
  }
  if (BASEBALL_LEAGUES.has(league)) {
    const Card = CARDS.baseball[mode];
    return <Card game={game as BaseballGame} {...baseballFlags(league)} />;
  }
  if (HOCKEY_LEAGUES.has(league)) {
    const Card = CARDS.hockey[mode];
    return <Card game={game as HockeyGame} />;
  }
  if (SOCCER_LEAGUES.has(league)) {
    const Card = CARDS.soccer[mode];
    return <Card game={game as SoccerGame} />;
  }
  if (RACING_LEAGUES.has(league)) {
    const Card = CARDS.racing[mode];
    return <Card game={game as RacingEvent} />;
  }
  switch (league) {
    case "ufc": {
      const Card = CARDS.mma[mode];
      return <Card game={game as MMAFight} />;
    }
    case "atp":
    case "wta": {
      const Card = CARDS.tennis[mode];
      return <Card match={game as TennisMatch} />;
    }
    case "mcvb":
    case "wcvb":
      return (
        <VolleyballGameCard
          game={game as VolleyballGame}
          compact={mode === "grid"}
        />
      );
    default:
      return null;
  }
}

function renderChampionshipCard(item: HomeGameItem): ReactNode {
  const { league, game } = item;
  if (!league) return null;
  if (BASKETBALL_LEAGUES.has(league))
    return (
      <ChampionshipGameCard
        game={game as BasketballGame}
        {...basketballFlags(league)}
      />
    );
  if (FOOTBALL_LEAGUES.has(league))
    return <ChampionshipGameCard game={game} {...footballFlags(league)} />;
  if (BASEBALL_LEAGUES.has(league))
    return <ChampionshipGameCard game={game} {...baseballFlags(league)} />;
  if (league === "nhl") return <ChampionshipGameCard game={game} isNHL />;

  return renderCard(item, "list");
}

const GameCard = memo(function GameCard({
  item,
  viewMode,
  onPreview,
  championship = false,
}: GameCardProps & { championship?: boolean }) {
  const child = championship
    ? renderChampionshipCard(item)
    : renderCard(item, viewMode);
  if (!child) return null;
  const content = (
    <View
      style={championship || viewMode === "grid" ? undefined : styles.listItem}
    >
      {child}
    </View>
  );
  if (
    RACING_LEAGUES.has(item.league) ||
    item.league === "mcvb" ||
    item.league === "wcvb"
  )
    return content;
  return (
    <LongPressGestureHandler
      minDurationMs={LONG_PRESS_MS}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.ACTIVE) onPreview(item);
      }}
    >
      {content}
    </LongPressGestureHandler>
  );
});

function GamePreview({
  item,
  onClose,
}: {
  item: HomeGameItem;
  onClose: () => void;
}) {
  const { league, game } = item;
  if (!league) return null;
  const common = { visible: true, onClose };
  if (BASKETBALL_LEAGUES.has(league))
    return (
      <BasketballGamePreviewModal
        {...common}
        game={game as BasketballGame}
        isMCBB={league === "mcbb"}
        isWCBB={league === "wcbb"}
        isWNBA={league === "wnba"}
        isSL={false}
        isGLEAGUE={league === "gleague"}
      />
    );
  if (FOOTBALL_LEAGUES.has(league))
    return (
      <FootballGamePreviewModal
        {...common}
        game={game as FootballGame}
        {...footballFlags(league)}
      />
    );
  if (BASEBALL_LEAGUES.has(league))
    return (
      <BaseballGamePreviewModal
        {...common}
        game={game as BaseballGame}
        {...baseballFlags(league)}
      />
    );
  if (HOCKEY_LEAGUES.has(league))
    return <HockeyGamePreviewModal {...common} game={game as HockeyGame} />;
  if (SOCCER_LEAGUES.has(league))
    return <SoccerGamePreviewModal {...common} game={game as SoccerGame} />;
  switch (league) {
    case "ufc":
      return <MMAGamePreviewModal {...common} game={game as MMAFight} />;
    case "atp":
    case "wta":
      return (
        <TennisMatchPreviewModal {...common} match={game as TennisMatch} />
      );
    default:
      return null;
  }
}

const SkeletonCards = memo(function SkeletonCards({
  count,
  viewMode,
}: {
  count: number;
  viewMode: ViewMode;
}) {
  const items = Array.from({ length: count }, (_, index) => index);
  if (viewMode === "grid")
    return (
      <View style={styles.skeletonGridWrapper}>
        {chunkIntoGridRows(items).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((item, columnIndex) => (
              <View key={columnIndex} style={styles.gridItem}>
                {item !== null && <SquareGameCardSkeleton />}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  const Skeleton =
    viewMode === "list" ? GameCardSkeleton : StackedGameCardSkeleton;
  return (
    <View style={styles.skeletonWrapper}>
      {items.map((index) => (
        <Skeleton key={index} />
      ))}
    </View>
  );
});

export default function LeagueGamesList({
  sections,
  loading,
  expectedCount,
  showHeaders = true,
  viewMode,
  isDark,
}: LeagueGamesListProps) {
  const { viewModeReady } = usePreferences();
  const [previewItem, setPreviewItem] = useState<HomeGameItem | null>(null);
  const { championshipGames, regularSections } = useMemo(() => {
    const championshipGames: HomeGameItem[] = [];
    const regularSections: HomeGameSection[] = [];
    for (const section of sections) {
      const data: HomeGameItem[] = [];
      for (const item of section.data) {
        if (!section.id.startsWith("general-") && isChampionshipGame(item))
          championshipGames.push(item);
        else data.push(item);
      }
      if (data.length)
        regularSections.push({
          ...section,
          data,
          title: getSectionTitle({ ...section, data }),
        });
    }
    return { championshipGames, regularSections };
  }, [sections]);
  const gridSections = useMemo(
    () =>
      viewMode === "grid"
        ? regularSections.map((section) => ({
            ...section,
            rows: chunkIntoGridRows(section.data),
          }))
        : [],
    [regularSections, viewMode],
  );
  const handlePreview = useCallback((item: HomeGameItem) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    setPreviewItem(item);
  }, []);
  const closePreview = useCallback(() => setPreviewItem(null), []);
  const renderItem = useCallback(
    ({ item }: { item: HomeGameItem }) => (
      <GameCard item={item} viewMode={viewMode} onPreview={handlePreview} />
    ),
    [viewMode, handlePreview],
  );
  const renderHeader = useCallback(
    ({ section }: { section: HomeGameSection }) => {
      if (!showHeaders) return null;
      return (
        <View
          style={{
            marginHorizontal: 12,
            marginTop: regularSections[0]?.id === section.id ? 0 : 8,
          }}
        >
          <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
        </View>
      );
    },
    [showHeaders, isDark, regularSections],
  );

  if (loading || !viewModeReady) {
    const ids = sections.length ? sections.map(({ id }) => id) : ["loading"];
    return (
      <View style={styles.contentContainer}>
        {ids.map((id) => (
          <View key={id}>
            {showHeaders && (
              <View style={styles.headerSkeleton}>
                <HeaderSkeleton />
              </View>
            )}
            <SkeletonCards count={expectedCount ?? 4} viewMode={viewMode} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <>
      {championshipGames.length > 0 && (
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          {championshipGames.map((item) => (
            <GameCard
              key={item.key}
              item={item}
              viewMode="list"
              onPreview={handlePreview}
              championship
            />
          ))}
        </View>
      )}
      {viewMode === "grid" ? (
        <View style={styles.gridListContainer}>
          {gridSections.map((section, index) => (
            <View key={section.id} style={styles.gridSection}>
              {showHeaders && (
                <View style={index > 0 ? styles.sectionSpacing : undefined}>
                  <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
                </View>
              )}
              {section.rows.map((row, rowIndex) => (
                <View
                  key={`${section.id}-row-${rowIndex}`}
                  style={styles.gridRow}
                >
                  {row.map((item, columnIndex) => (
                    <View
                      key={item?.key ?? `empty-${columnIndex}`}
                      style={styles.gridItem}
                    >
                      {item && (
                        <GameCard
                          item={item}
                          viewMode="grid"
                          onPreview={handlePreview}
                        />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <SectionList<HomeGameItem, HomeGameSection>
          sections={regularSections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderHeader}
          contentContainerStyle={styles.contentContainer}
          stickySectionHeadersEnabled={false}
          scrollEnabled={false}
          ItemSeparatorComponent={ItemSeparator}
          renderSectionFooter={SectionFooter}
        />
      )}
      {previewItem && <GamePreview item={previewItem} onClose={closePreview} />}
    </>
  );
}

function keyExtractor(item: HomeGameItem): string {
  return String(item.key);
}
function ItemSeparator() {
  return <View style={styles.itemSeparatorComponent} />;
}
function SectionFooter() {
  return <View style={{ height: 16 }} />;
}
