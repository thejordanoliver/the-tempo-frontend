import Button from "components/Buttons/Button";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useTournamentBracket } from "hooks/BasketballHooks/useTournamentBracket";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";
import { BRACKET_LAYOUT } from "utils/brackets/tournamentBracket.utils";
import { QUADRANT_BOARD_HEIGHT } from "utils/brackets/tournamentBracketLayout";
import { BracketRoundHeader } from "./BracketRoundHeader";
import { FirstFour } from "./FirstFour";
import { TournamentBracketBoard } from "./TournamentBracketBoard";

type TournamentTreeBracketProps = {
  season: number;
  league?: string;
};

export default function TournamentTreeBracket({
  season,
  league = "mcbb",
}: TournamentTreeBracketProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = MCBBTournamentBracketStyles(isDark);
  const global = globalStyles(isDark);
  const roundHeaderScrollRef = useRef<ScrollView>(null);

  const {
    games,
    regions,
    openingRoundGames,
    finalFourGames,
    championshipGame,

    loading,
    error,
    refresh,
  } = useTournamentBracket(league, season);
  const hasMainBracket =
    regions.length > 0 ||
    finalFourGames.length > 0 ||
    championshipGame !== null;

  if (loading && games.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error && games.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Tournament unavailable</Text>
        <Button variant="text" onPress={() => void refresh()} isDark={isDark}>
          Try Again
        </Button>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No bracket data</Text>
        <Text style={styles.emptyBody}>No tournament games available</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        directionalLockEnabled
        stickyHeaderIndices={hasMainBracket ? [1] : undefined}
        contentContainerStyle={navigationContentStyle(
          styles.verticalScrollContent,
        )}
      >
        <View>
          <FirstFour
            games={openingRoundGames}
            isDark={isDark}
            league={league}
          />
        </View>

        {hasMainBracket && (
          <View
            style={{
              height: BRACKET_LAYOUT.roundTitleHeight,
              zIndex: 20,
              backgroundColor: isDark
                ? Colors.dark.background
                : Colors.light.background,
            }}
          >
            <ScrollView
              ref={roundHeaderScrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <BracketRoundHeader isDark={isDark} />
            </ScrollView>
          </View>
        )}
        {hasMainBracket && (
          <ScrollView
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator
            style={{ height: QUADRANT_BOARD_HEIGHT }}
            scrollEventThrottle={16}
            onScroll={(event) => {
              roundHeaderScrollRef.current?.scrollTo({
                x: event.nativeEvent.contentOffset.x,
                animated: false,
              });
            }}
            contentContainerStyle={[
              styles.horizontalScrollContent,
              { paddingHorizontal: 12 },
            ]}
          >
            <TournamentBracketBoard
              regions={regions}
              finalFourGames={finalFourGames}
              championshipGame={championshipGame}
              isDark={isDark}
              league={league}
            />
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}
