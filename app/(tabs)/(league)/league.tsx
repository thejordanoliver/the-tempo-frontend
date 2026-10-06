import { useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import SearchBar from "@/components/Explore/SearchBar";
import { LEAGUE_CONFIG } from "@/constants/leagues";
import { CustomHeader } from "components/CustomHeader";
import LeagueList from "components/League/LeagueList";
import LeagueCarousel from "components/League/LeagueCarousel";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { LeagueScreenStyles } from "styles/LeagueStyles/LeagueStyles";
import { LeagueType } from "types/types";

export default function LeagueScreen() {
  const navigation = useNavigation();
  const router = useScopedRouter();
  const { resolvedColorScheme, leagueLayout } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = LeagueScreenStyles(isDark);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible((current) => !current);
    setSearchQuery("");
  }, []);
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader tabName="Leagues" onSearchToggle={handleSearchToggle} />,
    });
  }, [handleSearchToggle, navigation]);

  const goToLeague = useCallback(
    (league: LeagueType) => {
      const config = LEAGUE_CONFIG[league];

      const sport = config.route.split("/").at(-1);

      if (!sport) {
        return;
      }

      router.push({
        pathname: "/(tabs)/(league)/league/[sport]",
        params: {
          sport,
          league,
          leagueLabel: config.label,
        },
      } as any);
    },
    [router],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searcBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          visible={isSearchVisible}
          onFocus={() => {}}
          onBlur={() => {}}
          placeholder="Search leagues..."
        />
      </View>
      {leagueLayout === "list" ? (
        <LeagueList isDark={isDark} searchQuery={searchQuery} onSelect={goToLeague}
          contentContainerStyle={navigationContentStyle(styles.scrollContent)} />
      ) : (
      <ScrollView
        contentContainerStyle={navigationContentStyle(styles.carouselContent)}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <LeagueCarousel isDark={isDark} searchQuery={searchQuery} onSelect={goToLeague} />
      </ScrollView>
      )}
    </View>
  );
}
