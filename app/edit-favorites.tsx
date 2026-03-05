import { useNavigation } from "@react-navigation/native";
import Button from "components/Button";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { Colors, Fonts } from "constants/Styles";
import { teams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as cfbteams, conferenceListMap } from "constants/teamsCFB";
import { teams as mlbTeams } from "constants/teamsMLB";
import { teams as nflteams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { useRouter } from "expo-router";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useLayoutEffect } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import type { LeagueType, Team } from "types/types";

// Create a lookup map at the top of your component
export const leagueMap: Record<string, LeagueType> = {};
[...teams].forEach((t) => {
  leagueMap[t.id.toString()] = "NBA";
});
[...nflteams].forEach((t) => {
  leagueMap[t.id.toString()] = "NFL";
});
[...cfbteams].forEach((t) => {
  leagueMap[t.id.toString()] = "CFB";
});
[...cbbTeams].forEach((t) => {
  leagueMap[t.id.toString()] = "CBB";
});
[...mlbTeams].forEach((t) => {
  leagueMap[t.id.toString()] = "MLB";
});
[...nhlTeams].forEach((t) => {
  leagueMap[t.id.toString()] = "NHL";
});

export default function EditFavoritesScreen() {
  const {
    search,
    setSearch,
    favorites,
    toggleFavorite,
    isGridView,
    toggleLayout,
    fadeAnim,
    saveFavorites,
    isLoading,
  } = useFavoriteTeams();

  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 3;
  const containerPadding = 40;
  const columnGap = 12;
  const totalSpacing = columnGap * (numColumns - 1);
  const availableWidth = screenWidth - containerPadding - totalSpacing;
  const itemWidth = availableWidth / numColumns;

  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark, isGridView);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title="Edit Favorites"
          onBack={() => router.back()}
          onToggleLayout={toggleLayout}
          isGrid={isGridView}
        />
      ),
    });
  }, [navigation, isGridView]);

  const handleSave = async () => {
    const success = await saveFavorites();
    if (success) router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search teams..."
        placeholderTextColor={isDark ? Colors.darkGray : Colors.lightGray}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FavoriteTeamsSelector
          teams={[
            // NBA
            ...teams
              .filter((t) => !t.isAllStar)
              .map(
                (t) =>
                  ({ ...t, league: "NBA", id: t.id }) as Team & {
                    league: "NBA";
                  },
              ),

            // NFL
            ...nflteams
              .filter((t) => !t.isAllStar)
              .map(
                (t) =>
                  ({ ...t, league: "NFL", id: t.id }) as Team & {
                    league: "NFL";
                  },
              ),

            // MLB
            ...mlbTeams
              .filter((t) => !t.isAllStar)
              .map(
                (t) =>
                  ({ ...t, league: "MLB", id: t.id }) as Team & {
                    league: "MLB";
                  },
              ),

            // NHL
            ...nhlTeams
              .filter((t) => !t.isAllStar)
              .map(
                (t) =>
                  ({ ...t, league: "NHL", id: t.id }) as Team & {
                    league: "NHL";
                  },
              ),

            // CFB (still respects FBS logic)
            ...cfbteams
              .filter((t) => !t.isAllStar)
              .filter((t) => {
                const fbsTeamNames = Object.values(conferenceListMap)
                  .flat()
                  .map((n) => n.toLowerCase());
                const name = (t.fullName || t.name || "").toLowerCase();

                return (
                  fbsTeamNames.length === 0 ||
                  fbsTeamNames.some((n) => n.includes(name) || name.includes(n))
                );
              })
              .map(
                (t) =>
                  ({ ...t, league: "CFB", id: t.id }) as Team & {
                    league: "CFB";
                  },
              ),

            // CBB
            ...cbbTeams
              .filter((t) => !t.isAllStar)
              .map(
                (t) =>
                  ({ ...t, league: "CBB", id: t.id }) as Team & {
                    league: "CBB";
                  },
              ),

            // WCBB
            ...cbbTeams
              .filter((t) => !t.isAllStar && t.wid != null)
              .map(
                (t) =>
                  ({
                    ...t,
                    league: "WCBB",
                    id: t.wid,
                  }) as Team & { league: "WCBB" },
              ),
          ].sort((a, b) => a.name.localeCompare(b.fullName ?? ""))}
          favorites={favorites}
          toggleFavorite={(league: LeagueType, id: string) =>
            toggleFavorite(league, id)
          }
          isGridView={isGridView}
          fadeAnim={fadeAnim}
          search={search}
          itemWidth={itemWidth}
        />
      </Animated.View>

      <Button onPress={handleSave} style={styles.saveButton} />
    </View>
  );
}

const getStyles = (isDark: boolean, isGridView: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
      alignItems: isGridView ? "center" : "stretch",
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSLIGHT,
      width: "100%",
    },
    saveButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 16,
      marginBottom: 20,
      width: "96%",
    },
    saveText: {
      color: isDark ? Colors.black : Colors.white,
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
    },
  });
