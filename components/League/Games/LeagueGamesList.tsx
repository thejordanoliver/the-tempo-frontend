import BasketballGameCard from "@/components/Sports/Basketball/Games/BasketballGameCard";
import BasketballSquareGameCard from "@/components/Sports/Basketball/Games/BasketballSquareGameCard";
import BasketballStackedGameCard from "@/components/Sports/Basketball/Games/BasketballStackedGameCard";
import FootballGameCard from "@/components/Sports/Football/Games/FootballGameCard";
import FootballStackedGameCard from "@/components/Sports/Football/Games/FootballStackedGameCard";
import NHLStackedGameCard from "@/components/Sports/Hockey/Games/HockeyStackedGameCard";
import type { HomeLeagueId } from "@/constants/leagues";
import type { BaseballGame } from "@/types/baseball/baseball";
import type { BasketballGame } from "@/types/basketball/basketball";
import type { FootballGame } from "@/types/football/football";
import type { HockeyGame } from "@/types/hockey/hockey";
import type { HomeGameItem, HomeGameSection } from "@/types/leagues";
import type { SoccerGame } from "@/types/soccer/soccer";
import type { TennisMatch } from "@/types/tennis/tennis";
import TennisSquareGameCard from "@/components/Sports/Tennis/Games/TennisSquareGameCard";
import TennisStackedGameCard from "@/components/Sports/Tennis/Games/TennisStackedGameCard";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import StackedGameCardSkeleton from "components/Skeletons/GameCards/StackedGameCardSkeleton";
import BaseballGamePreviewModal from "components/Sports/Baseball/GamePreview/BaseballGamePreviewModal";
import BaseballGameCard from "components/Sports/Baseball/Games/BaseballGameCard";
import BaseballSquareGameCard from "components/Sports/Baseball/Games/BaseballSquareGameCard";
import BaseballStackedGameCard from "components/Sports/Baseball/Games/BaseballStackedGameCard";
import * as Haptics from "expo-haptics";
import { useMemo, useState, type ReactNode } from "react";
import { SectionList, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { leagueGamesListStyles } from "styles/GamecardStyles/LeagueGamesListStyles";
import type { MMAFight } from "types/mma/mma";
import { chunkIntoGridRows } from "utils/gameGrid";

import TennisGameCard from "@/components/Sports/Tennis/Games/TennisGameCard";
import HeadingTwo from "../../Headings/HeadingTwo";
import SquareGameCardSkeleton from "../../Skeletons/GameCards/SquareGameCardSkeleton";
import HeaderSkeleton from "../../Skeletons/HeaderSkeleton";
import BasketballGamePreviewModal from "../../Sports/Basketball/GamePreview/BasketballGamePreviewModal";
import FootballGamePreviewModal from "../../Sports/Football/GamePreview/FootballGamePreviewModal";
import FootballSquareGameCard from "../../Sports/Football/Games/FootballSquareGameCard";
import NHLGamePreviewModal from "../../Sports/Hockey/GamePreview/HockeyGamePreviewModal";
import NHLGameCard from "../../Sports/Hockey/Games/HockeyGameCard";
import NHLGameSquareCard from "../../Sports/Hockey/Games/HockeySqaureGameCard";
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

const BASKETBALL_LEAGUES = new Set<HomeLeagueId>([
  "nba",
  "cbb",
  "wcbb",
  "wnba",
]);
const FOOTBALL_LEAGUES = new Set<HomeLeagueId>(["nfl", "cfb", "ufl"]);
const SOCCER_LEAGUES = new Set<HomeLeagueId>([
  "mls",
  "fifa",
  "bundesliga",
  "ligue1",
  "ligue2",
  "laliga",
  "champions",
  "europa",
  "leaguescup",
  "epl",
]);

type LeagueGamesListProps = {
  sections: HomeGameSection[];
  loading: boolean;
  expectedCount?: number;
  showHeaders?: boolean;
  isDark: boolean;
  viewMode: "list" | "grid" | "stacked";
};

const isChampionshipGame = (item: HomeGameItem): boolean => {
  const headline =
    "headline" in item.game ? String(item.game.headline ?? "") : "";
  return (
    headline.includes("NBA Finals") ||
    headline.includes("Finals") ||
    headline.includes("Championship") ||
    headline.includes("Final")
  );
};

const getGameDate = (item: HomeGameItem): Date | null => {
  const { game } = item;
  const value =
    "date" in game
      ? game.date
      : "startDate" in game
        ? game.startDate
        : "timestamp" in game
          ? game.timestamp
          : null;

  if (typeof value !== "string" && typeof value !== "number") return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getSectionTitle = (section: HomeGameSection): string => {
  if (section.id === "nfl") {
    const hasMondayNightGame = section.data.some((item) => {
      const date = getGameDate(item);

      return date?.getDay() === 1 && date.getHours() >= 18;
    });

    if (hasMondayNightGame) return "Monday Night Football";

    const hasThursdayNightGame = section.data.some((item) => {
      const date = getGameDate(item);

      return date?.getDay() === 4 && date.getHours() >= 18;
    });

    if (hasThursdayNightGame) return "Thursday Night Football";
  }

  if (section.id === "cfb") {
    const hasSaturdayGame = section.data.some(
      (item) => getGameDate(item)?.getDay() === 6,
    );

    if (hasSaturdayGame) return "College Football Saturday";
  }

  return section.title;
};

export default function LeagueGamesList({
  sections,
  loading,
  expectedCount,
  showHeaders = true,
  viewMode,
  isDark,
}: LeagueGamesListProps) {
  const styles = leagueGamesListStyles(isDark);
  const [previewItem, setPreviewItem] = useState<HomeGameItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Separate championship games from regular games
  const { championshipGames, regularSections } = useMemo(() => {
    const champs: HomeGameItem[] = [];
    const regular: HomeGameSection[] = [];

    for (const section of sections) {
      const regularInSection: HomeGameItem[] = [];

      for (const item of section.data) {
        if (isChampionshipGame(item)) {
          champs.push(item);
        } else {
          regularInSection.push(item);
        }
      }

      if (regularInSection.length > 0) {
        regular.push({
          ...section,
          data: regularInSection,
        });
      }
    }

    return {
      championshipGames: champs,
      regularSections: regular,
    };
  }, [sections]);

  const handleLongPress = (item: HomeGameItem) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviewItem(item);
    setModalVisible(true);
  };

  const renderGameCard = (item: HomeGameItem) => {
    const wrapper = (child: ReactNode) => {
      return (
        <LongPressGestureHandler
          key={item.key}
          minDurationMs={300}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) handleLongPress(item);
          }}
        >
          <View style={viewMode === "grid" ? styles.gridItem : styles.listItem}>
            {child}
          </View>
        </LongPressGestureHandler>
      );
    };

    switch (item.league) {
      case "nba": {
        const game = item.game as BasketballGame;
        if (viewMode === "list")
          return wrapper(<BasketballGameCard game={game} />);
        if (viewMode === "grid")
          return wrapper(<BasketballSquareGameCard game={game} />);
        return wrapper(<BasketballStackedGameCard game={game} />);
      }

      case "cbb": {
        const game = item.game as BasketballGame;
        if (viewMode === "list")
          return wrapper(<BasketballGameCard game={game} isCBB />);
        if (viewMode === "grid")
          return wrapper(<BasketballSquareGameCard game={game} isCBB />);
        return wrapper(<BasketballStackedGameCard game={game} isCBB />);
      }

      case "wcbb": {
        const game = item.game as BasketballGame;
        if (viewMode === "list")
          return wrapper(<BasketballGameCard game={game} isWCBB />);
        if (viewMode === "grid")
          return wrapper(
            <BasketballSquareGameCard game={game} isWCBB />,
          );
        return wrapper(<BasketballStackedGameCard game={game} isWCBB />);
      }

      case "wnba": {
        const game = item.game as BasketballGame;
        if (viewMode === "list")
          return wrapper(<BasketballGameCard game={game} isWNBA />);
        if (viewMode === "grid")
          return wrapper(
            <BasketballSquareGameCard game={game} isWNBA />,
          );
        return wrapper(<BasketballStackedGameCard game={game} isWNBA />);
      }

      case "nfl": {
        const game = item.game as FootballGame;
        if (viewMode === "list")
          return wrapper(<FootballGameCard game={game} isNFL />);
        if (viewMode === "grid")
          return wrapper(<FootballSquareGameCard game={game} isNFL />);
        return wrapper(<FootballStackedGameCard game={game} isNFL />);
      }

      case "cfb": {
        const game = item.game as FootballGame;
        if (viewMode === "list")
          return wrapper(<FootballGameCard game={game} isCFB />);
        if (viewMode === "grid")
          return wrapper(<FootballSquareGameCard game={game} isCFB />);
        return wrapper(<FootballStackedGameCard game={game} isCFB />);
      }

      case "ufl": {
        const game = item.game as FootballGame;
        if (viewMode === "list")
          return wrapper(<FootballGameCard game={game} />);
        if (viewMode === "grid")
          return wrapper(<FootballSquareGameCard game={game} />);
        return wrapper(<FootballStackedGameCard game={game} />);
      }

      case "mlb": {
        const game = item.game as BaseballGame;
        if (viewMode === "list")
          return wrapper(<BaseballGameCard game={game} isMLB />);
        if (viewMode === "grid")
          return wrapper(<BaseballSquareGameCard game={game} isMLB />);
        return wrapper(<BaseballStackedGameCard game={game} isMLB />);
      }

      case "nhl": {
        const game = item.game as HockeyGame;
        if (viewMode === "list")
          return wrapper(<NHLGameCard game={game} isNHL isMCH={false} />);
        if (viewMode === "grid")
          return wrapper(
            <NHLGameSquareCard game={game} isNHL isMCH={false} />,
          );
        return wrapper(<NHLStackedGameCard game={game} isNHL isMCH={false} />);
      }

      case "mls":
      case "fifa":
      case "bundesliga":
      case "laliga":
      case "ligue1":
      case "ligue2":
      case "champions":
      case "europa":
      case "leaguescup":
      case "epl": {
        const game = item.game as SoccerGame;
        if (viewMode === "list") return wrapper(<SoccerGameCard game={game} />);
        if (viewMode === "grid")
          return wrapper(<SoccerSquareGameCard game={game} />);
        return wrapper(<SoccerStackedGameCard game={game} />);
      }

      case "ufc": {
        const game = item.game as MMAFight;
        if (viewMode === "list") return wrapper(<MMAGameCard game={game} />);
        if (viewMode === "grid")
          return wrapper(<MMASquareGameCard game={game} />);
        return wrapper(<MMAStackedGameCard game={game} />);
      }

      case "atp":
      case "wta": {
        const match = item.game as TennisMatch;
        if (viewMode === "grid")
          return wrapper(<TennisSquareGameCard match={match} />);
        if (viewMode === "stacked")
          return wrapper(<TennisStackedGameCard match={match} />);
        return wrapper(<TennisGameCard match={match} />);
      }
    }
  };

  const renderSkeletons = (count: number) => {
    if (viewMode === "list") {
      return (
        <View style={styles.skeletonWrapper}>
          {Array.from({ length: count }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </View>
      );
    }

    if (viewMode === "grid") {
      return (
        <View style={styles.skeletonGridWrapper}>
          {chunkIntoGridRows(Array.from({ length: count })).map((row, rowIndex) => (
            <View key={`skeleton-row-${rowIndex}`} style={styles.gridRow}>
              {row.map((item, columnIndex) => (
                <View key={columnIndex} style={styles.gridItem}>
                  {item !== null && <SquareGameCardSkeleton />}
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.skeletonWrapper}>
        {Array.from({ length: count }).map((_, index) => (
          <StackedGameCardSkeleton key={index} />
        ))}
      </View>
    );
  };

  if (loading) {
    const skeletonCount = expectedCount ?? 4;

    return (
      <View style={styles.contentContainer}>
        {sections.map((section) => (
          <View key={section.id}>
            {showHeaders && (
              <View style={styles.headerSkeleton}>
                <HeaderSkeleton />
              </View>
            )}
            {renderSkeletons(skeletonCount)}
          </View>
        ))}
      </View>
    );
  }

  const visibleSections = regularSections.filter(
    (section) => section.data.length > 0,
  );
  const previewLeague = previewItem?.league;
  const previewGame = previewItem?.game;

  return (
    <>
      {/* Championship Games Section */}
      {championshipGames.length > 0 && (
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          {championshipGames.map((game) => (
            <LongPressGestureHandler
              key={game.key}
              minDurationMs={300}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) handleLongPress(game);
              }}
            >
              <View>
                {game.league && BASKETBALL_LEAGUES.has(game.league) && (
                  <ChampionshipGameCard
                    game={game.game as BasketballGame}
                    isCBB={game.league === "cbb"}
                    isWCBB={game.league === "wcbb"}
                    isWNBA={game.league === "wnba"}
                    isSL={false}
                    isGLEAGUE={false}
                  />
                )}
                {game.league === "nfl" ||
                  (game.league === "cfb" && (
                    <ChampionshipGameCard
                      game={game.game}
                      isCBB={false}
                      isWCBB={false}
                      isWNBA={false}
                      isSL={false}
                      isGLEAGUE={false}
                    />
                  ))}
                {game.league === "mlb" && (
                  <ChampionshipGameCard
                    game={game.game}
                    isCBB={false}
                    isWCBB={false}
                    isWNBA={false}
                    isSL={false}
                    isGLEAGUE={false}
                    isNHL={true}
                  />
                )}
              </View>
            </LongPressGestureHandler>
          ))}
        </View>
      )}

      {/* Regular Games Section */}
      {viewMode === "grid" ? (
        <View style={styles.gridListContainer}>
          {visibleSections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.gridSection}>
              {showHeaders && (
                <View style={sectionIndex > 0 ? styles.sectionSpacing : undefined}>
                  <HeadingTwo isDark={isDark}>
                    {getSectionTitle(section)}
                  </HeadingTwo>
                </View>
              )}
              {chunkIntoGridRows(section.data).map((row, rowIndex) => (
                <View key={`${section.id}-row-${rowIndex}`} style={styles.gridRow}>
                  {row.map((item, columnIndex) => (
                    <View
                      key={item?.key ?? `${section.id}-empty-${columnIndex}`}
                      style={styles.gridItem}
                    >
                      {item ? renderGameCard(item) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <SectionList<HomeGameItem, HomeGameSection>
          sections={visibleSections}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => renderGameCard(item)}
          renderSectionHeader={({ section }) => {
            if (!showHeaders) return null;

            const multipleSections = visibleSections.length > 1;
            const isFirstSection = visibleSections[0]?.id === section.id;

            return (
              <View
                style={{
                  marginHorizontal: 12,
                  marginTop: multipleSections && !isFirstSection ? 8 : 0,
                }}
              >
                <HeadingTwo isDark={isDark}>
                  {getSectionTitle(section)}
                </HeadingTwo>
              </View>
            );
          }}
          contentContainerStyle={styles.contentContainer}
          stickySectionHeadersEnabled={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View style={styles.itemSeparatorComponent} />
          )}
          renderSectionFooter={() => <View style={{ height: 16 }} />}
        />
      )}

      {modalVisible &&
        previewGame &&
        previewLeague &&
        FOOTBALL_LEAGUES.has(previewLeague) && (
          <FootballGamePreviewModal
            visible={modalVisible}
            game={previewGame as FootballGame}
            onClose={() => setModalVisible(false)}
            isNFL={previewLeague === "nfl"}
            isCFB={previewLeague === "cfb"}
          />
        )}

      {modalVisible && previewGame && previewLeague === "mlb" && (
        <BaseballGamePreviewModal
          visible={modalVisible}
          game={previewGame as BaseballGame}
          onClose={() => setModalVisible(false)}
          isMLB
          isCB={false}
          isSB={false}
        />
      )}

      {modalVisible && previewGame && previewLeague === "nhl" && (
        <NHLGamePreviewModal
          visible={modalVisible}
          game={previewGame as HockeyGame}
          onClose={() => setModalVisible(false)}
          isNHL
          isMCH={false}
        />
      )}

      {modalVisible &&
        previewGame &&
        previewLeague &&
        SOCCER_LEAGUES.has(previewLeague) && (
          <SoccerGamePreviewModal
            visible={modalVisible}
            game={previewGame as SoccerGame}
            onClose={() => setModalVisible(false)}
          />
        )}

      {modalVisible &&
        previewGame &&
        previewLeague &&
        BASKETBALL_LEAGUES.has(previewLeague) && (
          <BasketballGamePreviewModal
            visible={modalVisible}
            game={previewGame as BasketballGame}
            isCBB={previewLeague === "cbb"}
            isWCBB={previewLeague === "wcbb"}
            isWNBA={previewLeague === "wnba"}
            isSL={false}
            isGLEAGUE={false}
            onClose={() => setModalVisible(false)}
          />
        )}

      {modalVisible && previewGame && previewLeague === "ufc" && (
        <MMAGamePreviewModal
          visible={modalVisible}
          game={previewGame as MMAFight}
          onClose={() => setModalVisible(false)}
        />
      )}

      {modalVisible &&
        previewGame &&
        (previewLeague === "atp" || previewLeague === "wta") && (
          <TennisMatchPreviewModal
            visible={modalVisible}
            match={previewGame as TennisMatch}
            onClose={() => setModalVisible(false)}
          />
        )}
    </>
  );
}
