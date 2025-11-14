// components/Games/CombinedGamesList.tsx
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
import { combinedGameStyles } from "styles/GamecardStyles/CombinedGamesList.styles";
import type { Game as CFBGameType } from "types/cfb";
import type { Game as NFLGameType } from "types/nfl";
import type {
  CBBGame as CBBGameType,
  Game as NBAGameType,
  summerGame,
} from "types/types";
import { CBBGame } from "types/types";
import CBBGamePreviewModal from "./CBB/GamePreview/CBBGamePreviewModal";
import CFBGamePreviewModal from "./CFB/GamePreview/CFBGamePreviewModal";
import GamePreviewModal from "./GamePreview/GamePreviewModal";
import HeaderSkeleton from "./Headings/HeaderSkeleton";
import HeadingTwo from "./Headings/HeadingTwo";
import NFLGamePreviewModal from "./NFL/GamePreview/NFLGamePreviewModal";
import SummerLeagueGamePreviewModal from "./summer-league/SummerLeagueGamePreviewModal";
// ✅ Shared skeletons
import GameCardSkeleton from "components/Games/GameCardSkeleton";
import GameSquareCardSkeleton from "components/Games/GameSquareCardSkeleton";
import StackedGameCardSkeleton from "components/Games/StackedGameCardSkeleton";

// ✅ NFL cards
import NFLGameCard from "components/NFL/Games/NFLGameCard";
import NFLGameSquareCard from "components/NFL/Games/NFLGameSquareCard";
import NFLStackedGameCard from "components/NFL/Games/NFLStackedGameCard";

// ✅ CFB cards
import CFBGameCard from "components/CFB/Games/CFBGameCard";
import CFBGameSquareCard from "components/CFB/Games/CFBGameSquareCard";
import CFBStackedGameCard from "./CFB/Games/CFBStackedGameCard";

// ✅ NBA cards
import GameCard from "components/Games/GameCard";
import GameSquareCard from "components/Games/GameSquareCard";
import StackedGameCard from "components/Games/StackedGameCard";

// ✅ CBB cards
import CBBStackedGameCard from "components/CBB/Games/CBBStackedGameCard";
import CBBGameCard from "./CBB/Games/CBBGameCard";
import CBBGameSquareCard from "./CBB/Games/CBBGameSquareCard";

// ✅ Summer League cards
import SummerGameSquareCard from "components/summer-league/SummerGameSquareCard";
import SummerGameCard from "components/summer-league/SummerLeagueGameCard";
import SummerStackedGameCard from "components/summer-league/SummerLeagueStackedGameCard";

type SportsCategory =
  | "College Football"
  | "NFL"
  | "NBA"
  | "Men's College Basketball"
  | "NBA Summer League"
  | "Favorites";

export type CombinedGamesSection =
  | { category: "College Football"; data: CFBGameType[] }
  | { category: "Men's College Basketball"; data: CBBGame[] }
  | { category: "NFL"; data: NFLGameType[] }
  | { category: "NBA"; data: NBAGameType[] }
  | { category: "NBA Summer League"; data: summerGame[] }
  | { category: "Favorites"; data: NBAGameType[] };

type CombinedGame =
  | CFBGameType
  | NFLGameType
  | NBAGameType
  | CBBGameType
  | summerGame;

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

type CBBGameExtended = CBBGame & {
  league?: { id?: number; name?: string; season?: string; logo?: string };
};

const getCategoryForFavorites = (
  item: CFBGameType | NBAGameType | NFLGameType | CBBGameType | summerGame
): SportsCategory => {
  const leagueName = (item as any).league?.name ?? "NBA";

  if (leagueName === "NFL") return "NFL";
  if (leagueName === "College Football") return "College Football";
  if (
    leagueName === "CBB" ||
    leagueName === "College Basketball" ||
    leagueName === "Men's College Basketball"
  )
    return "Men's College Basketball";
  if (leagueName === "NBA Summer League") return "NBA Summer League";

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
  game: CombinedGame
): game is CFBGameType | NFLGameType => {
  return "game" in game && typeof game.game === "object";
};

const getGameStatus = (game: CombinedGame): string => {
  if (hasGameProperty(game)) {
    return String(game.game?.status?.short ?? game.game?.status ?? "");
  } else {
    return String((game as NBAGameType | summerGame)?.status ?? "");
  }
};

export const isLiveGame = (game: CombinedGame): boolean => {
  const status = getGameStatus(game);
  return liveStatuses.some(
    (live) => status?.toString()?.toUpperCase() === live.toUpperCase()
  );
};

const getGameTimestamp = (game: CombinedGame): number => {
  if (hasGameProperty(game)) {
    return game.game?.date?.timestamp
      ? game.game.date.timestamp * 1000
      : new Date(game.game?.date?.date ?? "").getTime();
  } else {
    return new Date((game as NBAGameType | summerGame)?.date ?? "").getTime();
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

  const [previewGame, setPreviewGame] = useState<CombinedGame | null>(null);
  const [previewCategory, setPreviewCategory] = useState<SportsCategory | null>(
    null
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
    total?: number
  ) => {
    const wrapper = (child: React.ReactNode, indexInRow?: number) => {
      let itemStyle: ViewStyle =
        viewMode === "grid"
          ? combinedGameStyles.gridItem
          : combinedGameStyles.listItem;

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

    if (category === "NFL") {
      const nflGame = transformNFLGame(item as NFLGameExtended);
      if (viewMode === "list")
        return wrapper(<NFLGameCard game={nflGame} isDark={isDark} />);
      if (viewMode === "grid")
        return wrapper(
          <NFLGameSquareCard game={nflGame} isDark={isDark} />,
          index
        );
      return wrapper(<NFLStackedGameCard game={nflGame} isDark={isDark} />);
    }

    if (category === "College Football") {
      const cfbGame = transformCFBGame(item as CFBGameExtended);
      if (viewMode === "list")
        return wrapper(<CFBGameCard game={cfbGame} isDark={isDark} />);
      if (viewMode === "grid")
        return wrapper(
          <CFBGameSquareCard game={cfbGame} isDark={isDark} />,
          index
        );
      return wrapper(<CFBStackedGameCard game={cfbGame} isDark={isDark} />);
    }

    if (category === "NBA") {
      const nbaGame = item as NBAGameType;
      if (viewMode === "list")
        return wrapper(<GameCard game={nbaGame} isDark={isDark} />);
      if (viewMode === "grid")
        return wrapper(
          <GameSquareCard game={nbaGame} isDark={isDark} />,
          index
        );
      return wrapper(<StackedGameCard game={nbaGame} isDark={isDark} />);
    }

    if (category === "Men's College Basketball") {
      const cbbGame = item as CBBGameType;
      if (viewMode === "list")
        return wrapper(<CBBGameCard game={cbbGame} isDark={isDark} />);
      if (viewMode === "grid")
        return wrapper(
          <CBBGameSquareCard game={cbbGame} isDark={isDark} />,
          index
        );
      return wrapper(<CBBStackedGameCard game={cbbGame} isDark={isDark} />);
    }

    if (category === "NBA Summer League") {
      const slGame = item as summerGame;
      if (viewMode === "list")
        return wrapper(<SummerGameCard game={slGame} isDark={isDark} />);
      if (viewMode === "grid")
        return wrapper(
          <SummerGameSquareCard game={slGame} isDark={isDark} />,
          index
        );
      return wrapper(<SummerStackedGameCard game={slGame} isDark={isDark} />);
    }

    return null;
  };

  const renderSkeletons = (count: number) => {
    if (viewMode === "list")
      return (
        <View style={combinedGameStyles.skeletonWrapper}>
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
          columnWrapperStyle={combinedGameStyles.skeletonGridRow}
          renderItem={({ item, index }) => {
            const isPlaceholder = (item as any)?._isPlaceholder;
            const marginLeft = index % 2 === 0 ? 12 : 6;
            const marginRight = index % 2 === 0 ? 6 : 12;

            return (
              <View
                key={index}
                style={[
                  combinedGameStyles.gridItem,
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
          contentContainerStyle={combinedGameStyles.skeletonGridWrapper}
        />
      );
    }

    return (
      <View style={combinedGameStyles.skeletonWrapper}>
        {Array.from({ length: count }).map((_, idx) => (
          <StackedGameCardSkeleton key={idx} />
        ))}
      </View>
    );
  };

  if (loading) {
    const skeletonCount = expectedCount ?? 4;
    return (
      <View>
        {gamesByCategory.map((section, idx) => (
          <View key={idx}>
            {showHeaders && <HeaderSkeleton />}
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
  sectionCategory: SportsCategory
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
    case "Men's College Basketball":
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
      (section) => section.data.length > 0
    ) as SectionListData<CombinedGame, CombinedGamesSection>[]
  }


  
  keyExtractor={(item) => getItemId(item)}
  
  renderItem={({ item, section, index }) => {
    if (viewMode === "grid") return null;

    // Narrow the type safely
    const getCategoryAndValidatedGame = (
      item: CombinedGame,
      sectionCategory: SportsCategory
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
        case "Men's College Basketball":
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
      section.data.length
    );
  }}
  renderSectionHeader={({ section }) => {
    if (!showHeaders) return null;

    const multipleSections =
      sortedSections.filter((s) => s.data.length > 0).length > 1;
    const isFirstSection =
      sortedSections.findIndex((s) => s.category === section.category) === 0;

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
  contentContainerStyle={combinedGameStyles.contentContainer}
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
            keyExtractor={(item, index) => getItemId(item) ?? `idx-${index}`}
            numColumns={2}
            columnWrapperStyle={combinedGameStyles.gridRow}
            renderItem={({ item, index }) => {
              const validated = getCategoryAndValidatedGame(item, section.category);
              if (!validated) return null;
              return renderGameCard(
                validated.game,
                validated.category,
                index,
                section.data.length
              );
            }}
            scrollEnabled={false}
            contentContainerStyle={combinedGameStyles.gridListContainer}
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
        previewCategory === "Men's College Basketball" && (
          <CBBGamePreviewModal
            visible={modalVisible}
            game={previewGame as CBBGameType}
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
      {modalVisible &&
        previewGame &&
        previewCategory === "NBA Summer League" && (
          <SummerLeagueGamePreviewModal
            visible={modalVisible}
            game={previewGame as summerGame}
            onClose={() => setModalVisible(false)}
          />
        )}
    </>
  );
}
