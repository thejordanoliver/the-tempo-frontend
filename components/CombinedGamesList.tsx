// components/Games/CombinedGamesList.tsx
import GamePreviewModal from "components/Sports/NBA/GamePreview/GamePreviewModal";
import { usePreferences } from "contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { combinedGameListStyles } from "styles/GamecardStyles/CombinedGamesListStyles";
import type { Game as CFBGameType } from "types/cfb";
import { MLBGame } from "types/mlb";
import type { Game as NFLGameType } from "types/nfl";
import type {
  CBBGame as CBBGameType,
  Game as NBAGameType,
  SummerGame,
} from "types/types";
import { CBBGame } from "types/types";
import HeadingTwo from "./Headings/HeadingTwo";
import HeaderSkeleton from "./Skeletons/HeaderSkeleton";
import CBBGamePreviewModal from "./Sports/CBB/GamePreview/CBBGamePreviewModal";
import CFBGamePreviewModal from "./Sports/CFB/GamePreview/CFBGamePreviewModal";

import NFLGamePreviewModal from "./Sports/NFL/GamePreview/NFLGamePreviewModal";
// ✅ Shared skeletons
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Skeletons/GameCards/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";

// ✅ NFL cards
import NFLGameCard from "components/Sports/NFL/Games/NFLGameCard";
import NFLGameSquareCard from "components/Sports/NFL/Games/NFLGameSquareCard";
import NFLStackedGameCard from "components/Sports/NFL/Games/NFLStackedGameCard";

// ✅ CFB cards
import CFBGameCard from "components/Sports/CFB/Games/CFBGameCard";
import CFBGameSquareCard from "components/Sports/CFB/Games/CFBGameSquareCard";
import CFBStackedGameCard from "./Sports/CFB/Games/CFBStackedGameCard";

// ✅ NBA cards
import GameCard from "components/Sports/NBA/Games/GameCard";
import GameSquareCard from "components/Sports/NBA/Games/GameSquareCard";
import StackedGameCard from "components/Sports/NBA/Games/StackedGameCard";

// ✅ MLB cards
import MLBGameCard from "./Sports/MLB/Games/MLBGameCard";
import MLBGameSquareCard from "./Sports/MLB/Games/MLBGameSquareCard";
import MLBStackedGameCard from "./Sports/MLB/Games/MLBStackedGameCard";

// ✅ CBB cards
import CBBStackedGameCard from "components/Sports/CBB/Games/CBBStackedGameCard";
import CBBGameCard from "./Sports/CBB/Games/CBBGameCard";
import CBBGameSquareCard from "./Sports/CBB/Games/CBBGameSquareCard";

// ✅ Summer League cards
import SummerGameSquareCard from "components/Sports/NBASummerLeague/Games/SummerGameSquareCard";
import SummerGameCard from "components/Sports/NBASummerLeague/Games/SummerLeagueGameCard";
import SummerStackedGameCard from "components/Sports/NBASummerLeague/Games/SummerLeagueStackedGameCard";
import MLBGamePreviewModal from "./Sports/MLB/GamePreview/MLBGamePreviewModal";

const NCAA_FOOTBALL_LEAGUE_ID = 2;
const NCAA_MENS_BASKETBALL_LEAGUE_ID = 116;
const NCAA_WOMENS_BASKETBALL_LEAGUE_ID = 423;

type SportsCategory =
  | "College Football"
  | "NFL"
  | "NBA"
  | "MLB"
  | "Men's College Basketball"
  | "Women's College Basketball"
  | "NBA Summer League"
  | "Favorites";

export type CombinedGamesSection =
  | { category: "College Football"; data: CFBGameType[] }
  | { category: "Men's College Basketball"; data: CBBGame[] }
  | { category: "Women's College Basketball"; data: CBBGame[] }
  | { category: "NFL"; data: NFLGameType[] }
  | { category: "MLB"; data: MLBGame[] }
  | { category: "NBA"; data: NBAGameType[] }
  | { category: "NBA Summer League"; data: SummerGame[] }
  | { category: "Favorites"; data: CombinedGame[] };

type CombinedGame =
  | CFBGameType
  | NFLGameType
  | NBAGameType
  | CBBGameType
  | MLBGame
  | SummerGame;

type CombinedGamesListProps = {
  gamesByCategory: CombinedGamesSection[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  expectedCount?: number;
  day?: "todayTomorrow";
  showHeaders?: boolean;
  ListHeaderComponent?: React.ReactNode;
};

type NFLGameExtended = NFLGameType & {
  league?: { id?: number; name?: string; season?: string; logo?: string };
};
type CFBGameExtended = CFBGameType & {
  league?: { id?: number; name?: string; season?: string; logo?: string };
};

const getCategoryForFavorites = (item: CombinedGame): SportsCategory => {
  const league = (item as any).league;

  if (!league) return "NBA";

  // Women's CBB
  if (league.id === NCAA_WOMENS_BASKETBALL_LEAGUE_ID) {
    return "Women's College Basketball";
  }

  // Men's CBB
  if (league.id === NCAA_MENS_BASKETBALL_LEAGUE_ID) {
    return "Men's College Basketball";
  }

  // College Football
  if (league.id === NCAA_FOOTBALL_LEAGUE_ID) {
    return "College Football";
  }

  if (league.name === "NFL") return "NFL";

  if (league.name === "MLB") return "MLB";
  if (league.name === "MLB - Spring Training") return "MLB";
  if (league.name === "NBA Summer League") return "NBA Summer League";

  return "NBA";
};

const liveStatuses = [
  "In Progress",
  "LIVE",
  "Live",
  "Playing",
  "1Q",
  "2Q",
  "3Q",
  "4Q",
  "1H",
  "2H",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "H1",
  "H2",
  "HT",
  "OT",
  "AOT",
  "ET",
  "2OT",
  "3OT",
  "OT1",
  "OT2",
  "Mid",
  "End",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "OT1",
  "OT2",
  "OT3",
  "Suspended",
  "Delayed",
  "In Play",
];

const hasGameProperty = (
  game: CombinedGame,
): game is CFBGameType | NFLGameType => {
  return "game" in game && typeof game.game === "object";
};

const getGameStatus = (game: CombinedGame): string => {
  if (hasGameProperty(game)) {
    return String(game.game?.status?.short ?? game.game?.status ?? "");
  } else {
    return String((game as NBAGameType | SummerGame)?.status ?? "");
  }
};

export const isLiveGame = (game: CombinedGame): boolean => {
  const status = getGameStatus(game);
  return liveStatuses.some(
    (live) => status?.toString()?.toUpperCase() === live.toUpperCase(),
  );
};

const getGameTimestamp = (game: CombinedGame): number => {
  if (hasGameProperty(game)) {
    return game.game?.date?.timestamp
      ? game.game.date.timestamp * 1000
      : new Date(game.game?.date?.date ?? "").getTime();
  } else {
    return new Date((game as NBAGameType | SummerGame)?.date ?? "").getTime();
  }
};

const sortByLiveFirst = (games: CombinedGame[]): CombinedGame[] => {
  const sorted = [...games].sort((a, b) => {
    const aLive = isLiveGame(a) ? 1 : 0;
    const bLive = isLiveGame(b) ? 1 : 0;
    if (aLive !== bLive) return bLive - aLive;
    return getGameTimestamp(a) - getGameTimestamp(b);
  });
  return sorted;
};

export default function CombinedGamesList({
  gamesByCategory,
  loading,
  refreshing,
  onRefresh,
  expectedCount,
  day,
  showHeaders = true,
}: CombinedGamesListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { viewMode } = usePreferences();
  const styles = combinedGameListStyles(isDark);
  const [previewGame, setPreviewGame] = useState<CombinedGame | null>(null);
  const [previewCategory, setPreviewCategory] = useState<SportsCategory | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const getItemId = (item: CombinedGame): string => {
    if ("game" in item) return String((item as any).game?.id ?? "unknown");
    if ("id" in item) return String((item as any).id ?? "unknown");
    return "unknown";
  };

  const handleLongPress = (game: CombinedGame, category: SportsCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setPreviewCategory(category);
    setModalVisible(true);
  };

  const transformNFLGame = (nflGame: NFLGameExtended): NFLGameType => ({
    game: {
      id: String(nflGame.game?.id ?? "0"),
      stage: nflGame.game?.stage ?? "regular",
      week: nflGame.game?.week ?? "1",
      date: {
        timezone: nflGame.game?.date?.timezone ?? "UTC",
        date: nflGame.game?.date?.date ?? "",
        time: nflGame.game?.date?.time ?? "",
        timestamp: nflGame.game?.date?.timestamp ?? 0,
      },
      venue: nflGame.game?.venue || { name: "Unknown", city: "Unknown" },
      status: {
        short: nflGame.game?.status?.short ?? "",
        long: nflGame.game?.status?.long ?? "",
        timer: nflGame.game?.status?.timer,
      },
    },
    league: {
      id: Number(nflGame.league?.id ?? 0),
      name: nflGame.league?.name ?? "NFL",
      season: nflGame.league?.season ?? "2025",
      logo: nflGame.league?.logo ?? "",
    },
    teams: nflGame.teams,
    scores: nflGame.scores,
  });

  const transformCFBGame = (cfbgame: CFBGameExtended): CFBGameType => ({
    game: {
      id: String(cfbgame.game?.id ?? "0"),
      stage: cfbgame.game?.stage,
      week: cfbgame.game?.week,
      date: cfbgame.game?.date,
      venue: cfbgame.game?.venue,
      status: {
        short: cfbgame.game?.status?.short,
        long: cfbgame.game?.status?.long,
        timer: cfbgame.game?.status?.timer ?? undefined,
      },
    },
    league: cfbgame.league,
    teams: {
      home: {
        ...cfbgame.teams.home,
        fullName: cfbgame.teams.home?.fullName ?? cfbgame.teams.home?.name,
      },
      away: {
        ...cfbgame.teams.away,
        fullName: cfbgame.teams.away?.fullName ?? cfbgame.teams.away?.name,
      },
    },
    scores: cfbgame.scores,
  });

  const renderGameCard = (
    item: CombinedGame,
    category: SportsCategory,
    index?: number,
    total?: number,
  ) => {
    const wrapper = (child: React.ReactNode, indexInRow?: number) => {
      let itemStyle: ViewStyle =
        viewMode === "grid" ? styles.gridItem : styles.listItem;

      if (viewMode === "grid" && typeof indexInRow === "number") {
        const isLastOdd =
          typeof total === "number" &&
          total % 2 === 1 &&
          indexInRow === total - 1;
        if (isLastOdd) {
          itemStyle = { marginLeft: 12, marginRight: 12, flex: 0.49 };
        } else {
          const isFirst = indexInRow % 2 === 0;
          itemStyle = {
            ...itemStyle,
            marginLeft: isFirst ? 12 : 6,
            marginRight: isFirst ? 6 : 12,
          };
        }
      }

      return (
        <LongPressGestureHandler
          key={getItemId(item)}
          minDurationMs={300}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE)
              handleLongPress(item, category);
          }}
        >
          <View style={itemStyle}>{child}</View>
        </LongPressGestureHandler>
      );
    };

    // ✅ NFL
    if (category === "NFL") {
      const nflGame = transformNFLGame(item as NFLGameExtended);
      if (viewMode === "list") return wrapper(<NFLGameCard game={nflGame} />);
      if (viewMode === "grid")
        return wrapper(<NFLGameSquareCard game={nflGame} />, index);
      return wrapper(<NFLStackedGameCard game={nflGame} />);
    }

        // ✅ NFL
    if (category === "MLB") {
      const mlbGame = item as MLBGame;
      if (viewMode === "list") return wrapper(<MLBGameCard game={mlbGame} />);
      if (viewMode === "grid")
        return wrapper(<MLBGameSquareCard game={mlbGame} />, index);
      return wrapper(<MLBStackedGameCard game={mlbGame} />);
    }

    // ✅ College Football
    if (category === "College Football") {
      const cfbGame = transformCFBGame(item as CFBGameExtended);
      if (viewMode === "list") return wrapper(<CFBGameCard game={cfbGame} />);
      if (viewMode === "grid")
        return wrapper(<CFBGameSquareCard game={cfbGame} />, index);
      return wrapper(<CFBStackedGameCard game={cfbGame} />);
    }

    // ✅ NBA
    if (category === "NBA") {
      const nbaGame = item as NBAGameType;
      if (viewMode === "list") return wrapper(<GameCard game={nbaGame} />);
      if (viewMode === "grid")
        return wrapper(<GameSquareCard game={nbaGame} />, index);
      return wrapper(<StackedGameCard game={nbaGame} />);
    }

    // ✅ Men's College Basketball
    if (category === "Men's College Basketball") {
      const cbbGame = item as CBBGameType;
      if (viewMode === "list")
        return wrapper(<CBBGameCard game={cbbGame} isWomen={false} />);
      if (viewMode === "grid")
        return wrapper(
          <CBBGameSquareCard game={cbbGame} isWomen={false} />,
          index,
        );
      return wrapper(<CBBStackedGameCard game={cbbGame} isWomen={false} />);
    }

    // ✅ Women's College Basketball
    if (category === "Women's College Basketball") {
      const cbbGame = item as CBBGameType;
      if (viewMode === "list")
        return wrapper(<CBBGameCard game={cbbGame} isWomen={true} />);
      if (viewMode === "grid")
        return wrapper(
          <CBBGameSquareCard game={cbbGame} isWomen={true} />,
          index,
        );
      return wrapper(<CBBStackedGameCard game={cbbGame} isWomen={true} />);
    }

    // ✅ NBA Summer League
    if (category === "NBA Summer League") {
      const slGame = item as SummerGame;
      if (viewMode === "list") return wrapper(<SummerGameCard game={slGame} />);
      if (viewMode === "grid")
        return wrapper(<SummerGameSquareCard game={slGame} />, index);
      return wrapper(<SummerStackedGameCard game={slGame} />);
    }

    return null;
  };

  const renderSkeletons = (count: number) => {
    if (viewMode === "list")
      return (
        <View style={styles.skeletonWrapper}>
          {Array.from({ length: count }).map((_, idx) => (
            <GameCardSkeleton key={idx} />
          ))}
        </View>
      );

    if (viewMode === "grid") {
      const dataWithPlaceholder =
        count % 2 === 1
          ? [...Array.from({ length: count }), { _isPlaceholder: true }]
          : Array.from({ length: count });

      return (
        <FlatList
          data={dataWithPlaceholder}
          keyExtractor={(_, idx) => `skeleton-${idx}`}
          numColumns={2}
          columnWrapperStyle={styles.skeletonGridRow}
          renderItem={({ item, index }) => {
            const isPlaceholder = (item as any)?._isPlaceholder;
            const marginLeft = index % 2 === 0 ? 12 : 6;
            const marginRight = index % 2 === 0 ? 6 : 12;

            return (
              <View
                key={index}
                style={[
                  styles.gridItem,
                  {
                    marginLeft,
                    marginRight,
                    backgroundColor: isPlaceholder ? "red" : undefined,
                  },
                ]}
              >
                {!isPlaceholder && <GameSquareCardSkeleton />}
              </View>
            );
          }}
          scrollEnabled={false}
          contentContainerStyle={styles.skeletonGridWrapper}
        />
      );
    }

    return (
      <View style={styles.skeletonWrapper}>
        {Array.from({ length: count }).map((_, idx) => (
          <StackedGameCardSkeleton key={idx} />
        ))}
      </View>
    );
  };

  if (loading) {
    const skeletonCount = expectedCount ?? 4;
    return (
      <View style={{ paddingBottom: 100 }}>
        {gamesByCategory.map((section, idx) => (
          <View key={idx}>
            {showHeaders && (
              <View key={idx} style={{ paddingHorizontal: 12 }}>
                <HeaderSkeleton />
              </View>
            )}
            {renderSkeletons(skeletonCount)}
          </View>
        ))}
      </View>
    );
  }

  const sortedSections = gamesByCategory.map((section) => ({
    ...section,
    data: sortByLiveFirst(section.data as CombinedGame[]),
  }));

  // Inside CombinedGamesList, before renderItem/renderSectionFooter
  const getCategoryAndValidatedGame = (
    item: CombinedGame,
    sectionCategory: SportsCategory,
  ): { category: SportsCategory; game: CombinedGame } | null => {
    const category =
      sectionCategory === "Favorites"
        ? getCategoryForFavorites(item)
        : sectionCategory;

    // Only allow valid combinations for renderGameCard
    switch (category) {
      case "NBA":
      case "NBA Summer League":
      case "College Football":
      case "NFL":
      case "MLB":
      case "Men's College Basketball":
      case "Women's College Basketball":
        return { category, game: item };
      default:
        return null;
    }
  };

  return (
    <>
      <SectionList
        sections={
          sortedSections.filter(
            (section) => section.data.length > 0,
          ) as SectionListData<CombinedGame, CombinedGamesSection>[]
        }
        keyExtractor={(item) => getItemId(item)}
        renderItem={({ item, section, index }) => {
          if (viewMode === "grid") return null;

          // Narrow the type safely
          const getCategoryAndValidatedGame = (
            item: CombinedGame,
            sectionCategory: SportsCategory,
          ) => {
            const category =
              sectionCategory === "Favorites"
                ? getCategoryForFavorites(item)
                : sectionCategory;

            // Only allow valid combinations for renderGameCard
            switch (category) {
              case "NBA":
              case "NBA Summer League":
              case "College Football":
              case "NFL":
              case "MLB":
              case "Men's College Basketball":
              case "Women's College Basketball":
                return { category, game: item };
              default:
                return null;
            }
          };

          const validated = getCategoryAndValidatedGame(item, section.category);
          if (!validated) return null;

          return renderGameCard(
            validated.game,
            validated.category,
            index,
            section.data.length,
          );
        }}
        renderSectionHeader={({ section }) => {
          if (!showHeaders) return null;

          const multipleSections =
            sortedSections.filter((s) => s.data.length > 0).length > 1;
          const isFirstSection =
            sortedSections.findIndex((s) => s.category === section.category) ===
            0;

          return (
            <View
              style={{
                marginHorizontal: 12,
                marginTop: multipleSections && !isFirstSection ? 8 : 0,
              }}
            >
              <HeadingTwo>{section.category}</HeadingTwo>
            </View>
          );
        }}
        contentContainerStyle={styles.contentContainer}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
        ItemSeparatorComponent={() =>
          viewMode !== "grid" ? <View style={{ height: 12 }} /> : null
        }
        renderSectionFooter={({ section }) => {
          if (viewMode === "grid") {
            return (
              <View style={{ marginBottom: 16 }}>
                <FlatList
                  data={section.data as CombinedGame[]}
                  keyExtractor={(item, index) =>
                    getItemId(item) ?? `idx-${index}`
                  }
                  numColumns={2}
                  columnWrapperStyle={styles.gridRow}
                  renderItem={({ item, index }) => {
                    const validated = getCategoryAndValidatedGame(
                      item,
                      section.category,
                    );
                    if (!validated) return null;
                    return renderGameCard(
                      validated.game,
                      validated.category,
                      index,
                      section.data.length,
                    );
                  }}
                  scrollEnabled={false}
                  contentContainerStyle={styles.gridListContainer}
                />
              </View>
            );
          }
          return <View style={{ height: 16 }} />;
        }}
      />

      {modalVisible && previewGame && previewCategory === "NFL" && (
        <NFLGamePreviewModal
          visible={modalVisible}
          game={previewGame as NFLGameType}
          onClose={() => setModalVisible(false)}
        />
      )}
      {modalVisible &&
        previewGame &&
        previewCategory === "College Football" && (
          <CFBGamePreviewModal
            visible={modalVisible}
            game={previewGame as CFBGameType}
            onClose={() => setModalVisible(false)}
          />
        )}
      {modalVisible &&
        previewGame &&
        previewCategory === "MLB" && (
          <MLBGamePreviewModal
            visible={modalVisible}
            game={previewGame as MLBGame}
            onClose={() => setModalVisible(false)}
          />
        )}
      {modalVisible &&
        previewGame &&
        (previewCategory === "Men's College Basketball" ||
          previewCategory === "Women's College Basketball") && (
          <CBBGamePreviewModal
            visible={modalVisible}
            game={previewGame as CBBGameType}
            isWomen={previewCategory === "Women's College Basketball"}
            onClose={() => setModalVisible(false)}
          />
        )}

      {modalVisible && previewGame && previewCategory === "NBA" && (
        <GamePreviewModal
          visible={modalVisible}
          game={previewGame as NBAGameType}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
