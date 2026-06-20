// components/Games/LeagueGamesList.tsx
import {
  default as BasketballGameCard,
  default as SummerGameCard,
} from "@/components/Sports/Basketball/Games/BasketballGameCard";
import {
  default as BasketballSquareGameCard,
  default as SummerSquareGameCard,
} from "@/components/Sports/Basketball/Games/BasketballSquareGameCard";
import {
  default as BasketballStackedGameCard,
  default as SummerStackedGameCard,
} from "@/components/Sports/Basketball/Games/BasketballStackedGameCard";
import { default as FootballGameCard } from "@/components/Sports/Football/Games/FootballGameCard";
import { default as FootballStackedGameCard } from "@/components/Sports/Football/Games/FootballStackedGameCard";
import NHLStackedGameCard from "@/components/Sports/Hockey/Games/HockeyStackedGameCard";
import {
  CombinedGame,
  CombinedGamesSection,
  LeagueCategory,
} from "@/types/leagues";
import { SoccerGame } from "@/types/soccer";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import BaseballGamePreviewModal from "components/Sports/Baseball/GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "components/Sports/Baseball/Games/BaseballGameCard";
import BaseballSquareGameCard from "components/Sports/Baseball/Games/BaseballSquareGameCard";
import BaseballStackedGameCard from "components/Sports/Baseball/Games/BaseballStackedGameCard";
import GamePreviewModal from "components/Sports/NBA/GamePreview/GamePreviewModal";
import GameCard from "components/Sports/NBA/Games/GameCard";
import SquareGameCard from "components/Sports/NBA/Games/SquareGameCard";
import StackedGameCard from "components/Sports/NBA/Games/StackedGameCard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  SectionList,
  SectionListData,
  View,
  ViewStyle,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { combinedGameListStyles } from "styles/GamecardStyles/CombinedGamesListStyles";
import { BaseballGame } from "types/baseball";
import { BasketballGame } from "types/basketball";
import { FootballGame } from "types/football";
import { HockeyGame } from "types/hockey";
import { MMAFight } from "types/mma";
import HeadingTwo from "../Headings/HeadingTwo";
import SquareGameCardSkeleton from "../Skeletons/GameCards/SquareGameCardSkeleton";
import HeaderSkeleton from "../Skeletons/HeaderSkeleton";
import BasketballGamePreviewModal from "../Sports/Basketball/GamePreview/BasketballGamePreviewModal";
import FootballGamePreviewModal from "../Sports/Football/GamePreview/FootballGamePreviewModal";
import FootballSquareGameCard from "../Sports/Football/Games/FootballSquareGameCard";
import NHLGamePreviewModal from "../Sports/Hockey/GamePreview/HockeyGamePreviewModal";
import NHLGameCard from "../Sports/Hockey/Games/HockeyGameCard";
import NHLGameSquareCard from "../Sports/Hockey/Games/HockeySqaureGameCard";
import MMAGamePreviewModal from "../Sports/MMA/GamePreview/MMAGamePreviewModal";
import MMAGameCard from "../Sports/MMA/Games/MMAGameCard";
import MMASquareGameCard from "../Sports/MMA/Games/MMASquareGameCard";
import MMAStackedGameCard from "../Sports/MMA/Games/MMAStackedGameCard";
import SoccerGamePreviewModal from "../Sports/Soccer/GamePreview/GamePreviewModal";
import SoccerGameCard from "../Sports/Soccer/Games/SoccerGameCard";
import SoccerSquareGameCard from "../Sports/Soccer/Games/SoccerSquareGameCard";
import SoccerStackedGameCard from "../Sports/Soccer/Games/SoccerStackedGameCard";

const NBA_LEAGUE_ID = 46;
const NBA_SUMMER_LEAGUE_ID = 46;
const NCAA_FOOTBALL_LEAGUE_ID = 23;
const NFL_FOOTBALL_LEAGUE_ID = 28;
const UFL_FOOTBALL_LEAGUE_ID = 37;
const NCAA_COLLEGE_BASEBALL_LEAGUE_ID = 14;
const NCAA_COLLEGE_SOFTBALL_LEAGUE_ID = 102;
const NCAA_MENS_BASKETBALL_LEAGUE_ID = 116;
const NCAA_WOMENS_BASKETBALL_LEAGUE_ID = 423;
const WNBA_LEAGUE_ID = 59;
const MLS_LEAGUE_ID = 770;
const EPL_LEAGUE_ID = 700;
const FIFA_LEAGUE_ID = 606;
const CHAMPIONS_LEAGUE_ID = 775;
const BUNDESLIGA_LEAGUE_ID = 720;

const FOOTBALL_PREVIEW_CATEGORIES = ["NFL", "UFL", "College Football"];
const HOCKEY_PREVIEW_CATEGORIES = ["NHL", "Men's College Hockey"];
const BASKETBALL_PREVIEW_CATEGORIES = [
  "Men's College Basketball",
  "Women's College Basketball",
  "WNBA",
];
const BASEBALL_PREVIEW_CATEGORIES = [
  "MLB",
  "College Baseball",
  "College Softball",
];
const SOCCER_PREVIEW_CATEGORIES = [
  "MLS",
  "FIFA World Cup",
  "FIFA Women's World Cup",
  "German Bundesliga",
  "UEFA Champions League",
  "UEFA Europa League",
  "English Premier League",
];

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

export const getCategoryForFavorites = (item: CombinedGame): LeagueCategory => {
  const league = (item as any).league;

  // NBA Summer League
  if (league.id === NBA_LEAGUE_ID) {
    return "NBA";
  }

  // Women's CBB
  if (league.id === NCAA_WOMENS_BASKETBALL_LEAGUE_ID) {
    return "Women's College Basketball";
  }

  // Men's CBB
  if (league.id === NCAA_MENS_BASKETBALL_LEAGUE_ID) {
    return "Men's College Basketball";
  }

  // College Baseball
  if (league.id === NCAA_COLLEGE_BASEBALL_LEAGUE_ID) {
    return "College Baseball";
  }

  // College Softball
  if (league.id === NCAA_COLLEGE_SOFTBALL_LEAGUE_ID) {
    return "College Softball";
  }

  // WNBA
  if (league.id === WNBA_LEAGUE_ID) {
    return "WNBA";
  }

  // NFL
  if (league.id === NFL_FOOTBALL_LEAGUE_ID) {
    return "NFL";
  }

  // UFL
  if (league.id === UFL_FOOTBALL_LEAGUE_ID) {
    return "UFL";
  }

  // College Football
  if (league.id === NCAA_FOOTBALL_LEAGUE_ID) {
    return "College Football";
  }
  // NBA Summer League
  if (league.id === NBA_SUMMER_LEAGUE_ID) {
    return "NBA Summer League";
  }

  // MLS
  if (league.id === MLS_LEAGUE_ID) {
    return "MLS";
  }

  // English Premier League
  if (league.id === EPL_LEAGUE_ID) {
    return "English Premier League";
  }

  // FIFA
  if (league.id === FIFA_LEAGUE_ID) {
    return "FIFA World Cup";
  }

  // UEFA Champions League
  if (league.id === CHAMPIONS_LEAGUE_ID) {
    return "UEFA Champions League";
  }
  // German Bundesliga
  if (league.id === BUNDESLIGA_LEAGUE_ID) {
    return "German Bundesliga";
  }

  if (league.name === "MLB") return "MLB";

  if (league.name === "NHL") return "NHL";

  if (league.name === "MMA") return "MMA";

  return "NBA";
};

export default function LeagueGamesList({
  gamesByCategory,
  loading,
  expectedCount,
  showHeaders = true,
  viewMode,
  isDark,
}: CombinedGamesListProps) {
  const styles = combinedGameListStyles(isDark);
  const [previewGame, setPreviewGame] = useState<CombinedGame | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewCategory, setPreviewCategory] = useState<LeagueCategory | null>(
    null,
  );

  const isBasketballPreview =
    previewCategory !== null &&
    previewCategory !== undefined &&
    BASKETBALL_PREVIEW_CATEGORIES.includes(previewCategory);

  const isBaseballPreview =
    previewCategory !== null &&
    previewCategory !== undefined &&
    BASEBALL_PREVIEW_CATEGORIES.includes(previewCategory);

  const isHockeyPreview =
    previewCategory !== null &&
    previewCategory !== undefined &&
    HOCKEY_PREVIEW_CATEGORIES.includes(previewCategory);

  const isFootballPreview =
    previewCategory !== null &&
    previewCategory !== undefined &&
    FOOTBALL_PREVIEW_CATEGORIES.includes(previewCategory);

  const isSoccerPreview =
    previewCategory !== null &&
    previewCategory !== undefined &&
    SOCCER_PREVIEW_CATEGORIES.includes(previewCategory);

  const getItemId = (item: CombinedGame): string => {
    if ("game" in item) return String((item as any).game?.id ?? "unknown");
    if ("id" in item) return String((item as any).id ?? "unknown");
    return "unknown";
  };

  const handleLongPress = (game: CombinedGame, category: LeagueCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewGame(game);
    setPreviewCategory(category);
    setModalVisible(true);
  };

  const renderGameCard = (
    item: CombinedGame,
    category: LeagueCategory,
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

    // ✅ NBA
    if (category === "NBA") {
      const nbaGame = item as BasketballGame;
      if (viewMode === "list") return wrapper(<GameCard game={nbaGame} />);
      if (viewMode === "grid")
        return wrapper(<SquareGameCard game={nbaGame} />, index);
      return wrapper(<StackedGameCard game={nbaGame} />);
    }

    // ✅ Men's College Basketball
    if (category === "Men's College Basketball") {
      const BasketballGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(
          <BasketballGameCard game={BasketballGame} isCBB={true} />,
        );
      if (viewMode === "grid")
        return wrapper(
          <BasketballSquareGameCard game={BasketballGame} isCBB={true} />,
          index,
        );
      return wrapper(
        <BasketballStackedGameCard game={BasketballGame} isCBB={true} />,
      );
    }

    // ✅ Women's College Basketball
    if (category === "Women's College Basketball") {
      const BasketballGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(
          <BasketballGameCard game={BasketballGame} isWCBB={true} />,
        );
      if (viewMode === "grid")
        return wrapper(
          <BasketballSquareGameCard game={BasketballGame} isWCBB={true} />,
          index,
        );
      return wrapper(
        <BasketballStackedGameCard game={BasketballGame} isWCBB={true} />,
      );
    }

    // ✅ WNBA
    if (category === "WNBA") {
      const BasketballGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(
          <BasketballGameCard game={BasketballGame} isWNBA={true} />,
        );
      if (viewMode === "grid")
        return wrapper(
          <BasketballSquareGameCard game={BasketballGame} isWNBA={true} />,
          index,
        );
      return wrapper(
        <BasketballStackedGameCard game={BasketballGame} isWNBA={true} />,
      );
    }

    // ✅ NBA Summer League
    if (category === "NBA Summer League") {
      const slGame = item as BasketballGame;
      if (viewMode === "list")
        return wrapper(
          <SummerGameCard game={slGame} isCBB={false} isWCBB={false} />,
        );
      if (viewMode === "grid")
        return wrapper(<SummerSquareGameCard game={slGame} />, index);
      return wrapper(<SummerStackedGameCard game={slGame} />);
    }

    // ✅ NFL
    if (category === "NFL") {
      const nflGame = item as FootballGame;
      if (viewMode === "list")
        return wrapper(<FootballGameCard game={nflGame} isNFL={true} />);
      if (viewMode === "grid")
        return wrapper(
          <FootballSquareGameCard game={nflGame} isNFL={true} />,
          index,
        );
      return wrapper(<FootballStackedGameCard game={nflGame} isNFL={true} />);
    }

    // ✅ College Football
    if (category === "College Football") {
      const cfbGame = item as FootballGame;
      if (viewMode === "list")
        return wrapper(<FootballGameCard game={cfbGame} isCFB={true} />);
      if (viewMode === "grid")
        return wrapper(
          <FootballSquareGameCard game={cfbGame} isCFB={true} />,
          index,
        );
      return wrapper(<FootballStackedGameCard game={cfbGame} isCFB={true} />);
    }

    // ✅ UFL
    if (category === "UFL") {
      const uflGame = item as FootballGame;
      if (viewMode === "list")
        return wrapper(
          <FootballGameCard game={uflGame} isNFL={false} isCFB={false} />,
        );
      if (viewMode === "grid")
        return wrapper(
          <FootballSquareGameCard game={uflGame} isNFL={false} isCFB={false} />,
          index,
        );
      return wrapper(
        <FootballStackedGameCard game={uflGame} isNFL={false} isCFB={false} />,
      );
    }

    // ✅ SOCCER
    if (
      category === "MLS" ||
      category === "FIFA World Cup" ||
      category === "FIFA Women's World Cup" ||
      category === "German Bundesliga" ||
      category === "UEFA Champions League" ||
      category === "UEFA Europa League" ||
      category === "English Premier League"
    ) {
      const soccerGame = item as SoccerGame;
      if (viewMode === "list")
        return wrapper(<SoccerGameCard game={soccerGame} />);
      if (viewMode === "grid")
        return wrapper(<SoccerSquareGameCard game={soccerGame} />, index);
      return wrapper(<SoccerStackedGameCard game={soccerGame} />);
    }

    // ✅ MLB
    if (category === "MLB") {
      const baseballGame = item as BaseballGame;
      if (viewMode === "list")
        return wrapper(
          <BaseballGameCard
            game={baseballGame}
            isMLB={true}
            isCB={false}
            isSB={false}
          />,
        );
      if (viewMode === "grid")
        return wrapper(
          <BaseballSquareGameCard
            game={baseballGame}
            isMLB={true}
            isCB={false}
            isSB={false}
          />,
          index,
        );
      return wrapper(
        <BaseballStackedGameCard
          game={baseballGame}
          isMLB={true}
          isCB={false}
          isSB={false}
        />,
      );
    }

    // ✅ CB
    if (category === "College Baseball") {
      const baseballGame = item as BaseballGame;
      if (viewMode === "list")
        return wrapper(
          <BaseballGameCard
            game={baseballGame}
            isMLB={false}
            isCB={true}
            isSB={false}
          />,
        );
      if (viewMode === "grid")
        return wrapper(
          <BaseballSquareGameCard
            game={baseballGame}
            isMLB={false}
            isCB={true}
            isSB={false}
          />,
          index,
        );
      return wrapper(
        <BaseballStackedGameCard
          game={baseballGame}
          isMLB={false}
          isCB={true}
          isSB={false}
        />,
      );
    }

    // ✅ SB
    if (category === "College Softball") {
      const baseballGame = item as BaseballGame;
      if (viewMode === "list")
        return wrapper(
          <BaseballGameCard
            game={baseballGame}
            isMLB={false}
            isCB={false}
            isSB={true}
          />,
        );
      if (viewMode === "grid")
        return wrapper(
          <BaseballSquareGameCard
            game={baseballGame}
            isMLB={false}
            isCB={false}
            isSB={true}
          />,
          index,
        );
      return wrapper(
        <BaseballStackedGameCard
          game={baseballGame}
          isMLB={false}
          isCB={false}
          isSB={true}
        />,
      );
    }

    // ✅ NHL
    if (category === "NHL") {
      const nhlGame = item as HockeyGame;
      if (viewMode === "list")
        return wrapper(
          <NHLGameCard game={nhlGame} isNHL={true} isMCH={false} />,
        );
      if (viewMode === "grid")
        return wrapper(
          <NHLGameSquareCard game={nhlGame} isNHL={true} isMCH={false} />,
          index,
        );
      return wrapper(
        <NHLStackedGameCard game={nhlGame} isNHL={true} isMCH={false} />,
      );
    }

    // ✅ MMA
    if (category === "MMA") {
      const mmaFight = item as MMAFight;
      if (viewMode === "list") return wrapper(<MMAGameCard game={mmaFight} />);
      if (viewMode === "grid")
        return wrapper(<MMASquareGameCard game={mmaFight} />, index);
      return wrapper(<MMAStackedGameCard game={mmaFight} />);
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
    sectionCategory: LeagueCategory,
  ): { category: LeagueCategory; game: CombinedGame } | null => {
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
      case "UFL":
      case "MLB":
      case "College Baseball":
      case "College Softball":
      case "NHL":
      case "MLS":
      case "UEFA Champions League":
      case "FIFA World Cup":
      case "UEFA Europa League":
      case "English Premier League":
      case "German Bundesliga":
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
      />

      {modalVisible && previewGame && isFootballPreview && (
        <FootballGamePreviewModal
          visible={modalVisible}
          game={previewGame as FootballGame}
          onClose={() => setModalVisible(false)}
          isNFL={previewCategory === "NFL"}
          isCFB={previewCategory === "College Football"}
        />
      )}

      {modalVisible && previewGame && isBaseballPreview && (
        <BaseballGamePreviewModal
          visible={modalVisible}
          game={previewGame as BaseballGame}
          onClose={() => setModalVisible(false)}
          isMLB={previewCategory === "MLB"}
          isCB={previewCategory === "College Baseball"}
          isSB={previewCategory === "College Softball"}
        />
      )}

      {modalVisible && previewGame && isHockeyPreview && (
        <NHLGamePreviewModal
          visible={modalVisible}
          game={previewGame as HockeyGame}
          onClose={() => setModalVisible(false)}
          isNHL={previewCategory === "NHL"}
          isMCH={false}
        />
      )}

      {modalVisible && previewGame && isSoccerPreview && (
        <SoccerGamePreviewModal
          visible={modalVisible}
          game={previewGame as SoccerGame}
          onClose={() => setModalVisible(false)}
        />
      )}

      {modalVisible && previewGame && isBasketballPreview && (
        <BasketballGamePreviewModal
          visible={modalVisible}
          game={previewGame as BasketballGame}
          isCBB={previewCategory === "Men's College Basketball"}
          isWCBB={previewCategory === "Women's College Basketball"}
          isWNBA={previewCategory === "WNBA"}
          onClose={() => setModalVisible(false)}
        />
      )}

      {modalVisible && previewGame && previewCategory === "NBA" && (
        <GamePreviewModal
          visible={modalVisible}
          game={previewGame as BasketballGame}
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
