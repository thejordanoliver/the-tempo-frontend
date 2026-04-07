import { useNavigation } from "@react-navigation/native";
import Button from "components/Button";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { Colors } from "constants/styles";
import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import {
  Animated,
  TextInput,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { editFavoritesStyles } from "styles/EditFavoriteStyles";
import type { LeagueType } from "types/types";

export const leagueMap: Record<string, LeagueType> = {};
[...teams].forEach((t) => {
  leagueMap[t.id.toString()] = "NBA";
});
[...wnbaTeams].forEach((t) => {
  leagueMap[t.id.toString()] = "WNBA";
});
[...nflTeams].forEach((t) => {
  leagueMap[t.id.toString()] = "NFL";
});
[...cfbTeams].forEach((t) => {
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
  } = useFavoriteTeamsContext();

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
  const styles = editFavoritesStyles(isDark, isGridView);

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
        placeholder="Search teams or leagues..."
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
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "NBA" as const,
                id: t.id,
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} NBA basketball`,
              })),

            // WNBA
            ...wnbaTeams
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "WNBA" as const,
                id: t.id,
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} WNBA women's basketball`,
              })),

            // NFL
            ...nflTeams
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "NFL" as const,
                id: t.id,
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} NFL football`,
              })),

            // MLB
            ...mlbTeams
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "MLB" as const,
                id: t.id,
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} MLB baseball`,
              })),

            // NHL
            ...nhlTeams
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "NHL" as const,
                id: t.id,
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} NHL hockey`,
              })),

            // CFB
            ...cfbTeams
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "CFB" as const,
                id: t.id,
                isAllStar: t.isAllStar ?? false, // ✅ narrow undefined to boolean
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} CFB college football NCAA`,
              })),

            // CBB
            ...cbbTeams
              .filter((t) => !t.isAllStar && t.isActive !== false) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "CBB" as const,
                id: t.id,
                isAllStar: t.isAllStar ?? false, // ✅ narrow undefined to boolean
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} CBB college basketball NCAA`,
              })),

            // WCBB
            ...cbbTeams
              .filter(
                (t) => !t.isAllStar && t.wid != null && t.isActive !== false,
              ) // ✅ filter out inactive teams
              .map((t) => ({
                ...t,
                league: "WCBB" as const,
                id: t.wid!, // ✅ non-null assertion — safe because filter guarantees wid != null
                isAllStar: t.isAllStar ?? false,
                isActive: t.isActive ?? false,
                searchTerms: `${t.name} ${t.fullName} WCBB women's college basketball NCAA`,
              })),
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
      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} isDark={isDark} />
      </View>
    </View>
  );
}
