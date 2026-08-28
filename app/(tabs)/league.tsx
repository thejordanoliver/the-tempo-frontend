import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { ImageSourcePropType, ListRenderItem } from "react-native";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

import MLBLogo from "assets/Baseball/MLB_Logos/MLB.png";
import CBLogo from "assets/College_Logos/Conference_Logos/CB.png";
import CBBLogo from "assets/College_Logos/Conference_Logos/CBB.png";
import CFBLogo from "assets/College_Logos/Conference_Logos/CFB.png";
import SBLogo from "assets/College_Logos/Conference_Logos/SB.png";
import WCBBLogo from "assets/College_Logos/Conference_Logos/WCBB.png";
import NFLLogo from "assets/Football/NFL_Logos/NFL.png";
import UFLLogo from "assets/Football/UFL_Logos/UFL.png";
import UFLLightLogo from "assets/Football/UFL_Logos/UFLLight.png";
import NHLLogo from "assets/Hockey/NHL_Logos/NHL.png";
import UFCLogo from "assets/MMA/MMA_Logos/UFC.png";
import NBALogo from "assets/NBA/Logos/NBA.png";
import F1Logo from "assets/Racing/Logos/f1.png";
import NascarLogo from "assets/Racing/Logos/Nascar.png";
import NascarLightLogo from "assets/Racing/Logos/NascarLight.png";
import BundesligaLogo from "assets/Soccer/Logos/Bundesliga.png";
import BundesligaLightLogo from "assets/Soccer/Logos/BundesligaLight.png";
import EPLLogo from "assets/Soccer/Logos/EPL.png";
import LeaguesCupLogo from "assets/Soccer/Logos/LeaguesCup.png";
import LeaguesCupLogoLight from "assets/Soccer/Logos/LeaguesCupLight.png";
import MLSLogo from "assets/Soccer/Logos/MLS.png";
import UEFAChampionsLogo from "assets/Soccer/Logos/UEFAChampions.png";
import UEFAChampionsLightLogo from "assets/Soccer/Logos/UEFAChampionsLight.png";
import UEFAEuropaLogo from "assets/Soccer/Logos/UEFAEuropa.png";
import UEFAEuropaLightLogo from "assets/Soccer/Logos/UEFAEuropaLight.png";
import WorldCupLogo from "assets/Soccer/Logos/WorldCup.png";
import WorldCupLightLogo from "assets/Soccer/Logos/WorldCupLight.png";
import WNBALogo from "assets/WNBA/Logos/WNBA.png";

import SearchBar from "@/components/Explore/SearchBar";
import { CustomHeader } from "../../components/CustomHeader";
import { activeOpacity, Colors, globalStyles } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { LeagueScreenStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { LeagueType } from "../../types/types";

type LeagueRoute =
  | "/league/basketball"
  | "/league/football"
  | "/league/baseball"
  | "/league/hockey"
  | "/league/mma"
  | "/league/racing"
  | "/league/socc";

type LeagueConfig = {
  label: string;
  logo: ImageSourcePropType;
  logoLight: ImageSourcePropType;
};

const leagues: LeagueType[] = [
  "NBA",
  "WNBA",
  "NFL",
  "MLB",
  "NHL",
  "CFB",
  "CB",
  "SB",
  "CBB",
  "WCBB",
  "UFC",
  "UFL",
  "EPL",
  "MLS",
  "CHAMPIONS",
  "EUROPA",
  "BUNDESLIGA",
  "LEAGUESCUP",
  "FIFA",
  "F1",
  "NASCARPREMIER",
];

const leagueConfig: Record<LeagueType, LeagueConfig> = {
  NBA: {
    label: "NBA",
    logo: NBALogo,
    logoLight: NBALogo,
  },
  WNBA: {
    label: "WNBA",
    logo: WNBALogo,
    logoLight: WNBALogo,
  },
  NFL: {
    label: "NFL",
    logo: NFLLogo,
    logoLight: NFLLogo,
  },
  MLB: {
    label: "MLB",
    logo: MLBLogo,
    logoLight: MLBLogo,
  },
  NHL: {
    label: "NHL",
    logo: NHLLogo,
    logoLight: NHLLogo,
  },
  CFB: {
    label: "College Football",
    logo: CFBLogo,
    logoLight: CFBLogo,
  },
  CB: {
    label: "College Baseball",
    logo: CBLogo,
    logoLight: CBLogo,
  },
  SB: {
    label: "College Softball",
    logo: SBLogo,
    logoLight: SBLogo,
  },
  CBB: {
    label: "Men's College Basketball",
    logo: CBBLogo,
    logoLight: CBBLogo,
  },
  WCBB: {
    label: "Women's College Basketball",
    logo: WCBBLogo,
    logoLight: WCBBLogo,
  },
  UFC: {
    label: "UFC",
    logo: UFCLogo,
    logoLight: UFCLogo,
  },
  UFL: {
    label: "UFL",
    logo: UFLLogo,
    logoLight: UFLLightLogo,
  },
  EPL: {
    label: "English Premier League",
    logo: EPLLogo,
    logoLight: EPLLogo,
  },
  MLS: {
    label: "MLS",
    logo: MLSLogo,
    logoLight: MLSLogo,
  },
  CHAMPIONS: {
    label: "UEFA Champions League",
    logo: UEFAChampionsLogo,
    logoLight: UEFAChampionsLightLogo,
  },
  EUROPA: {
    label: "UEFA Europa League",
    logo: UEFAEuropaLogo,
    logoLight: UEFAEuropaLightLogo,
  },
  BUNDESLIGA: {
    label: "German Bundesliga",
    logo: BundesligaLogo,
    logoLight: BundesligaLightLogo,
  },
  LEAGUESCUP: {
    label: "Leagues Cup",
    logo: LeaguesCupLogo,
    logoLight: LeaguesCupLogoLight,
  },
  FIFA: {
    label: "FIFA World Cup",
    logo: WorldCupLogo,
    logoLight: WorldCupLightLogo,
  },
  FIFAW: {
    label: "FIFA Women's World Cup",
    logo: WorldCupLogo,
    logoLight: WorldCupLightLogo,
  },
  F1: {
    label: "F1",
    logo: F1Logo,
    logoLight: F1Logo,
  },
  NASCARPREMIER: {
    label: "NASCAR Premier",
    logo: NascarLogo,
    logoLight: NascarLightLogo,
  },
};

const leagueRoutes: Partial<Record<LeagueType, LeagueRoute>> = {
  NBA: "/league/basketball",
  WNBA: "/league/basketball",
  CBB: "/league/basketball",
  WCBB: "/league/basketball",
  NFL: "/league/football",
  UFL: "/league/football",
  CFB: "/league/football",
  CB: "/league/baseball",
  SB: "/league/baseball",
  MLB: "/league/baseball",
  NHL: "/league/hockey",
  UFC: "/league/mma",
  F1: "/league/racing",
  NASCARPREMIER: "/league/racing",
  EPL: "/league/socc",
  MLS: "/league/socc",
  CHAMPIONS: "/league/socc",
  EUROPA: "/league/socc",
  BUNDESLIGA: "/league/socc",
  LEAGUESCUP: "/league/socc",
  FIFA: "/league/socc",
  FIFAW: "/league/socc",
};

export default function LeagueScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const global = globalStyles(isDark);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const leagueLogos = useMemo<Record<LeagueType, ImageSourcePropType>>(() => {
    return Object.fromEntries(
      Object.entries(leagueConfig).map(([league, config]) => [
        league,
        isDark ? config.logoLight : config.logo,
      ]),
    ) as Record<LeagueType, ImageSourcePropType>;
  }, [isDark]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible((current) => {
      const next = !current;

      if (!next) {
        setSearchQuery("");
      }

      return next;
    });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader tabName="Leagues" onSearchToggle={handleSearchToggle} />
      ),
    });
  }, [handleSearchToggle, navigation]);

  const filteredLeagues = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return leagues;
    }

    return leagues.filter((league) => {
      const config = leagueConfig[league];

      const searchableText = [
        league,
        config.label,
        config.label.replace(/[^a-zA-Z0-9 ]/g, ""),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [searchQuery]);

  const goToLeague = useCallback(
    (league: LeagueType) => {
      const route = leagueRoutes[league];

      if (!route) {
        return;
      }

      router.push({
        pathname: route,
        params: {
          league,
          leagueLabel: leagueConfig[league].label,
        },
      });
    },
    [router],
  );

const renderLeague: ListRenderItem<LeagueType> = useCallback(
  ({ item: league, index }) => {
    const { label } = leagueConfig[league];
    const logo = leagueLogos[league];
    const isLastRow = index === filteredLeagues.length - 1;

    return (
      <View
        style={[styles.buttonContainer, isLastRow && { borderBottomWidth: 0 }]}
      >
        <TouchableOpacity
          onPress={() => goToLeague(league)}
          style={styles.leagueButton}
          activeOpacity={activeOpacity}
        >
          <View style={styles.buttonWrapper}>
            <Image
              source={logo}
              style={styles.leagueLogo}
              resizeMode="contain"
            />

            <Text style={styles.leagueText}>{label}</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </TouchableOpacity>
      </View>
    );
  },
  [filteredLeagues.length, goToLeague, isDark, leagueLogos, styles],
);
  const renderEmptyResults = useCallback(
    () => (
      <View style={global.emptyContainer}>
        <Text style={global.emptySubText}>No leagues found.</Text>
      </View>
    ),
    [global],
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

      <FlatList
        data={filteredLeagues}
        keyExtractor={(league) => league}
        renderItem={renderLeague}
        ListEmptyComponent={renderEmptyResults}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}
