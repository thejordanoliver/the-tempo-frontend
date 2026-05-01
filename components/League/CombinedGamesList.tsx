// components/Games/CombinedGamesList.tsx
import GamePreviewModal from "components/Sports/NBA/GamePreview/GamePreviewModal";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { combinedGameListStyles } from "styles/GamecardStyles/CombinedGamesListStyles";
import { MLBGame } from "types/baseball";
import { BasketballGame } from "types/basketball";
import { Game as NBAGameType, SummerGame } from "types/nba";
import HeadingTwo from "../Headings/HeadingTwo";
import HeaderSkeleton from "../Skeletons/HeaderSkeleton";
import CBBGamePreviewModal from "../Sports/CBB/GamePreview/CBBGamePreviewModal";
import CFBGamePreviewModal from "../Sports/CFB/GamePreview/CFBGamePreviewModal";

import NFLGamePreviewModal from "../Sports/NFL/GamePreview/NFLGamePreviewModal";
// ✅ Shared skeletons
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import SquareGameCardSkeleton from "../Skeletons/GameCards/SquareGameCardSkeleton";

// ✅ NFL cards
import NFLGameCard from "components/Sports/NFL/Games/NFLGameCard";
import NFLStackedGameCard from "components/Sports/NFL/Games/NFLStackedGameCard";
import NFLSquareGameCard from "../Sports/NFL/Games/NFLSquareGameCard";

// ✅ CFB cards
import CFBGameCard from "components/Sports/CFB/Games/CFBGameCard";
import CFBSquareGameCard from "../Sports/CFB/Games/CFBSquareGameCard";
import CFBStackedGameCard from "../Sports/CFB/Games/CFBStackedGameCard";

// ✅ NBA cards
import GameCard from "components/Sports/NBA/Games/GameCard";
import SquareGameCard from "components/Sports/NBA/Games/SquareGameCard";
import StackedGameCard from "components/Sports/NBA/Games/StackedGameCard";

// ✅ MLB cards
import MLBGameCard from "../Sports/MLB/Games/MLBGameCard";
import MLBSquareGameCard from "../Sports/MLB/Games/MLBSquareGameCard";
import MLBStackedGameCard from "../Sports/MLB/Games/MLBStackedGameCard";

// ✅ NHL cards
import NHLGameCard from "../Sports/NHL/Games/NHLGameCard";
import NHLGameSquareCard from "../Sports/NHL/Games/NHLGameSquareCard";

// ✅ CBB cards
import CBBStackedGameCard from "components/Sports/CBB/Games/CBBStackedGameCard";
import CBBGameCard from "../Sports/CBB/Games/CBBGameCard";
import CBBSquareGameCard from "../Sports/CBB/Games/CBBSquareGameCard";

// ✅ Summer League cards
import SummerStackedGameCard from "components/Sports/NBASummerLeague/Games/SLeagueStackedGameCard";
import SummerGameCard from "components/Sports/NBASummerLeague/Games/SLGameCard";
import SummerSquareGameCard from "components/Sports/NBASummerLeague/Games/SLSquareGameCard";
import MLBGamePreviewModal from "../Sports/MLB/GamePreview/MLBGamePreviewModal";

// ✅ MMA cards
import NHLStackedGameCard from "components/Sports/NHL/Games/NHLStackedGameCard";
import WNBAGameCard from "components/Sports/WNBA/Games/WNBAGameCard";
import WNBASquareGameCard from "components/Sports/WNBA/Games/WNBASquareGameCard";
import WNBAStackedGameCard from "components/Sports/WNBA/Games/WNBAStackedGameCard";
import { globalStyles } from "constants/styles";
import { FootballGame } from "types/football";
import { NHLGame } from "types/hockey";
import { MMAFight } from "types/mma";
import MMAGamePreviewModal from "../Sports/MMA/GamePreview/MMAGamePreviewModal";
import MMAGameCard from "../Sports/MMA/Games/MMAGameCard";
import MMASquareGameCard from "../Sports/MMA/Games/MMASquareGameCard";
import MMAStackedGameCard from "../Sports/MMA/Games/MMAStackedGameCard";
import NHLGamePreviewModal from "../Sports/NHL/GamePreview/NHLGamePreviewModal";

const NCAA_FOOTBALL_LEAGUE_ID = 2;
const NCAA_MENS_BASKETBALL_LEAGUE_ID = 116;
const NCAA_WOMENS_BASKETBALL_LEAGUE_ID = 423;
const WNBA_LEAGUE_ID = 13;
type SportsCategory =
  | "College Football"
  | "NFL"
  | "NBA"
  | "WNBA"
  | "MLB"
  | "NHL"
  | "Men's College Basketball"
  | "Women's College Basketball"
  | "NBA Summer League"
  | "MMA"
  | "Favorites";

export type CombinedGamesSection =
  | { category: "College Football"; data: FootballGame[] }
  | { category: "Men's College Basketball"; data: BasketballGame[] }
  | { category: "Women's College Basketball"; data: BasketballGame[] }
  | { category: "NFL"; data: FootballGame[] }
  | { category: "MLB"; data: MLBGame[] }
  | { category: "NHL"; data: NHLGame[] }
  | { category: "NBA"; data: NBAGameType[] }
  | { category: "WNBA"; data: BasketballGame[] }
  | { category: "NBA Summer League"; data: SummerGame[] }
  | { category: "MMA"; data: MMAFight[] }
  | { category: "Favorites"; data: CombinedGame[] };

type CombinedGame =
  | FootballGame
  | FootballGame
  | NBAGameType
  | BasketballGame
  | MLBGame
  | NHLGame
  | MMAFight
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
  isDark: boolean;
  viewMode: string;
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

  // WNBA
  if (league.id === WNBA_LEAGUE_ID) {
    return "WNBA";
  }

  // College Football
  if (league.id === NCAA_FOOTBALL_LEAGUE_ID) {
    return "College Football";
  }

  if (league.name === "NFL") return "NFL";

  if (league.name === "MLB") return "MLB";
  if (league.name === "NHL") return "NHL";
  if (league.name === "MLB - Spring Training") return "MLB";
  if (league.name === "NBA Summer League") return "NBA Summer League";
  if (league.name === "MMA") return "MMA";

  return "NBA";
};

export default function CombinedGamesList({
  gamesByCategory,
  loading,
  expectedCount,
  showHeaders = true,
  viewMode,
  isDark,
}: CombinedGamesListProps) {
  const styles = combinedGameListStyles(isDark);
  const global = globalStyles(isDark);
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
      const nflGame = item as FootballGame;
      if (viewMode === "list") return wrapper(<NFLGameCard game={nflGame} />);
      if (viewMode === "grid")
        return wrapper(<NFLSquareGameCard game={nflGame} />, index);
      return wrapper(<NFLStackedGameCard game={nflGame} />);
    }

    // ✅ MLB
    if (category === "MLB") {
      const mlbGame = item as MLBGame;
      if (viewMode === "list") return wrapper(<MLBGameCard game={mlbGame} />);
      if (viewMode === "grid")
        return wrapper(<MLBSquareGameCard game={mlbGame} />, index);
      return wrapper(<MLBStackedGameCard game={mlbGame} />);
    }
    // ✅ NHL
    if (category === "NHL") {
      const nhlGame = item as NHLGame;
      if (viewMode === "list") return wrapper(<NHLGameCard game={nhlGame} />);
      if (viewMode === "grid")
        return wrapper(<NHLGameSquareCard game={nhlGame} />, index);
      return wrapper(<NHLStackedGameCard game={nhlGame} />);
    }
    // ✅ MMA
    if (category === "MMA") {
      const mmaFight = item as MMAFight;
      if (viewMode === "list") return wrapper(<MMAGameCard game={mmaFight} />);
      if (viewMode === "grid")
        return wrapper(<MMASquareGameCard game={mmaFight} />, index);
      return wrapper(<MMAStackedGameCard game={mmaFight} />);
    }

    // ✅ College Football
    if (category === "College Football") {
      const cfbGame = item as FootballGame;
      if (viewMode === "list") return wrapper(<CFBGameCard game={cfbGame} />);
      if (viewMode === "grid")
        return wrapper(<CFBSquareGameCard game={cfbGame} />, index);
      return wrapper(<CFBStackedGameCard game={cfbGame} />);
    }

    // ✅ NBA
    if (category === "NBA") {
      const nbaGame = item as NBAGameType;
      if (viewMode === "list") return wrapper(<GameCard game={nbaGame} />);
      if (viewMode === "grid")
        return wrapper(<SquareGameCard game={nbaGame} />, index);
      return wrapper(<StackedGameCard game={nbaGame} />);
    }

    // ✅ Men's College Basketball
    if (category === "Men's College Basketball") {
      const BasketballGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(<CBBGameCard game={BasketballGame} isWomen={false} />);
      if (viewMode === "grid")
        return wrapper(
          <CBBSquareGameCard game={BasketballGame} isWomen={false} />,
          index,
        );
      return wrapper(
        <CBBStackedGameCard game={BasketballGame} isWomen={false} />,
      );
    }

    // ✅ Women's College Basketball
    if (category === "Women's College Basketball") {
      const BasketballGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(<CBBGameCard game={BasketballGame} isWomen={true} />);
      if (viewMode === "grid")
        return wrapper(
          <CBBSquareGameCard game={BasketballGame} isWomen={true} />,
          index,
        );
      return wrapper(
        <CBBStackedGameCard game={BasketballGame} isWomen={true} />,
      );
    }

    // ✅ WNBA
    if (category === "WNBA") {
      const BasketballGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(<WNBAGameCard game={BasketballGame} />);
      if (viewMode === "grid")
        return wrapper(<WNBASquareGameCard game={BasketballGame} />, index);
      return wrapper(<WNBAStackedGameCard game={BasketballGame} />);
    }

    // ✅ NBA Summer League
    if (category === "NBA Summer League") {
      const slGame = item as BasketballGame;
      if (viewMode === "list") return wrapper(<SummerGameCard game={slGame} />);
      if (viewMode === "grid")
        return wrapper(<SummerSquareGameCard game={slGame} />, index);
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
                {!isPlaceholder && <SquareGameCardSkeleton />}
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
      <View style={styles.contentContainer}>
        {gamesByCategory.map((section, idx) => (
          <View key={idx}>
            {showHeaders && (
              <View key={idx} style={styles.headerSkeleton}>
                <HeaderSkeleton />
              </View>
            )}
            {renderSkeletons(skeletonCount)}
          </View>
        ))}
      </View>
    );
  }

  const getCategoryAndValidatedGame = (
    item: CombinedGame,
    sectionCategory: SportsCategory,
  ): { category: SportsCategory; game: CombinedGame } | null => {
    const category =
      sectionCategory === "Favorites"
        ? getCategoryForFavorites(item)
        : sectionCategory;

   
    switch (category) {
      case "NBA":
      case "WNBA":
      case "NBA Summer League":
      case "College Football":
      case "NFL":
      case "MLB":
      case "NHL":
      case "MMA":
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
          gamesByCategory.filter(
            (section) => section.data.length > 0,
          ) as SectionListData<CombinedGame, CombinedGamesSection>[]
        }
        keyExtractor={(item) => getItemId(item)}
        renderItem={({ item, section, index }) => {
          if (viewMode === "grid") return null;

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

          const visibleSections = gamesByCategory.filter(
            (s) => s.data.length > 0,
          );
          const multipleSections = visibleSections.length > 1;

          const isFirstSection =
            visibleSections.findIndex(
              (s) => s.category === section.category,
            ) === 0;

          return (
            <View
              style={{
                marginHorizontal: 12,
                marginTop: multipleSections && !isFirstSection ? 8 : 0,
              }}
            >
              <HeadingTwo isDark={isDark}>{section.category}</HeadingTwo>
            </View>
          );
        }}
        contentContainerStyle={styles.contentContainer}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
        ItemSeparatorComponent={() =>
          viewMode !== "grid" ? (
            <View style={styles.itemSeparatorComponent} />
          ) : null
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
        ListEmptyComponent={() => (
          <View style={global.emptyContainer}>
            <Text style={global.emptyText}>No games today</Text>
          </View>
        )}
      />

      {modalVisible && previewGame && previewCategory === "NFL" && (
        <NFLGamePreviewModal
          visible={modalVisible}
          game={previewGame as FootballGame}
          onClose={() => setModalVisible(false)}
        />
      )}
      {modalVisible &&
        previewGame &&
        previewCategory === "College Football" && (
          <CFBGamePreviewModal
            visible={modalVisible}
            game={previewGame as FootballGame}
            onClose={() => setModalVisible(false)}
          />
        )}
      {modalVisible && previewGame && previewCategory === "MLB" && (
        <MLBGamePreviewModal
          visible={modalVisible}
          game={previewGame as MLBGame}
          onClose={() => setModalVisible(false)}
        />
      )}
      {modalVisible && previewGame && previewCategory === "NHL" && (
        <NHLGamePreviewModal
          visible={modalVisible}
          game={previewGame as NHLGame}
          onClose={() => setModalVisible(false)}
        />
      )}
      {modalVisible &&
        previewGame &&
        (previewCategory === "Men's College Basketball" ||
          previewCategory === "Women's College Basketball") && (
          <CBBGamePreviewModal
            visible={modalVisible}
            game={previewGame as BasketballGame}
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
      {modalVisible && previewGame && previewCategory === "MMA" && (
        <MMAGamePreviewModal
          visible={modalVisible}
          game={previewGame as MMAFight}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
