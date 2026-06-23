// components/SportsListModal.tsx

import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import MLBLogo from "assets/Baseball/MLB_Logos/MLB.png";
import CBLogo from "assets/College_Logos/Conference_Logos/CB.png";
import CBBLogo from "assets/College_Logos/Conference_Logos/CBB.png";
import CFBLogo from "assets/College_Logos/Conference_Logos/CFB.png";
import SBLogo from "assets/College_Logos/Conference_Logos/SB.png";
import WCBBLogo from "assets/College_Logos/Conference_Logos/WCBB.png";
import NFLLogo from "assets/Football/NFL_Logos/NFL.png";
import UFLLogo from "assets/Football/UFL_Logos/UFL.png";
import UFLLogolight from "assets/Football/UFL_Logos/UFLLight.png";
import NHLLogo from "assets/Hockey/NHL_Logos/NHL.png";
import NBALogo from "assets/Logos/NBA.png";
import WNBALogo from "assets/Logos/WNBA/WNBA.png";
import UFCLogo from "assets/MMA/MMA_Logos/UFC.png";
import BundesligaLogo from "assets/Soccer/Logos/Bundesliga.png";
import BundesligaLogoLight from "assets/Soccer/Logos/BundesligaLight.png";
import EPLLogo from "assets/Soccer/Logos/EPL.png";
import MLSLogo from "assets/Soccer/Logos/MLS.png";
import UEFAChampionsLogo from "assets/Soccer/Logos/UEFAChampions.png";
import UEFAChampionsLogoLight from "assets/Soccer/Logos/UEFAChampionsLight.png";
import UEFAEuropaLogo from "assets/Soccer/Logos/UEFAEuropa.png";
import UEFAEuropaLogoLight from "assets/Soccer/Logos/UEFAEuropaLight.png";
import WorldCupLogo from "assets/Soccer/Logos/WorldCup.png";
import WorldCupLogoLight from "assets/Soccer/Logos/WorldCupLight.png";
import SearchBar from "components/SearchBars/SearchBar";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ImageSourcePropType, ListRenderItem } from "react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { sportsListModalStyles } from "styles/LeagueStyles/SportsListModalStyles";
import { LeagueType } from "types/types";
import { snapPoints } from "utils/modalUtils";

export type SportsListModalRef = {
  present: () => void;
  dismiss: () => void;
};

type SportsListModalProps = {
  onSelect: (league: LeagueType) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

const leagues: LeagueType[] = [
  "NBA",
  "WNBA",
  "NFL",
  "CFB",
  "UFL",
  "EPL",
  "MLS",
  "CHAMPIONS",
  "EUROPA",
  "BUNDESLIGA",
  "FIFA",
  "CB",
  "SB",
  "CBB",
  "WCBB",
  "MLB",
  "NHL",
  "UFC",
];

const leagueConfig: Record<
  LeagueType,
  { label: string; logo: ImageSourcePropType; logoLight: ImageSourcePropType }
> = {
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
  CFB: {
    label: "College Football",
    logo: CFBLogo,
    logoLight: CFBLogo,
  },
  UFL: {
    label: "UFL",
    logo: UFLLogo,
    logoLight: UFLLogolight,
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
    logoLight: UEFAChampionsLogoLight,
  },
  EUROPA: {
    label: "UEFA Europa League",
    logo: UEFAEuropaLogo,
    logoLight: UEFAEuropaLogoLight,
  },
  FIFA: {
    label: "FIFA World Cup",
    logo: WorldCupLogo,
    logoLight: WorldCupLogoLight,
  },
  FIFAW: {
    label: "FIFA Women's World Cup",
    logo: WorldCupLogo,
    logoLight: WorldCupLogoLight,
  },
  BUNDESLIGA: {
    label: "German Bundesliga",
    logo: BundesligaLogo,
    logoLight: BundesligaLogoLight,
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
  UFC: {
    label: "UFC",
    logo: UFCLogo,
    logoLight: UFCLogo,
  },
};

type LeagueRoute =
  | "/league/nba"
  | "/league/wnba"
  | "/league/nfl"
  | "/league/ufl"
  | "/league/cb"
  | "/league/sb"
  | "/league/cfb"
  | "/league/cbb"
  | "/league/wcbb"
  | "/league/mlb"
  | "/league/nhl"
  | "/league/ufc"
  | "/league/socc";

const leagueRoutes: Partial<Record<LeagueType, LeagueRoute>> = {
  NBA: "/league/nba",
  WNBA: "/league/wnba",
  NFL: "/league/nfl",
  CFB: "/league/cfb",
  UFL: "/league/ufl",
  CB: "/league/cb",
  SB: "/league/sb",
  CBB: "/league/cbb",
  WCBB: "/league/wcbb",
  MLB: "/league/mlb",
  NHL: "/league/nhl",
  UFC: "/league/ufc",

  EPL: "/league/socc",
  MLS: "/league/socc",
  CHAMPIONS: "/league/socc",
  EUROPA: "/league/socc",
  FIFA: "/league/socc",
  FIFAW: "/league/socc",
  BUNDESLIGA: "/league/socc",
};

const SportsListModal = forwardRef<SportsListModalRef, SportsListModalProps>(
  function SportsListModal({ onSelect, onOpen, onClose }, ref) {
    const { resolvedColorScheme } = usePreferences();
    const isDark = resolvedColorScheme === "dark";
    const styles = sportsListModalStyles(isDark);
    const global = globalStyles(isDark);
    const router = useRouter();

    const sheetRef = useRef<BottomSheetModal>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLeagues = useMemo(() => {
      const normalizedSearch = searchQuery.trim().toLowerCase();

      if (!normalizedSearch) return leagues;

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

    const present = useCallback(() => {
      sheetRef.current?.present();
    }, []);

    const dismiss = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        present,
        dismiss,
      }),
      [present, dismiss],
    );

    const handleDismiss = useCallback(() => {
      setSearchQuery("");
      onClose?.();
    }, [onClose]);

    const goToLeague = useCallback(
      (league: LeagueType) => {
        const route = leagueRoutes[league] ?? "/league/nba";
        const leagueLabel = leagueConfig[league].label;

        sheetRef.current?.dismiss();

        router.push({
          pathname: route,
          params: {
            league,
            leagueLabel,
          },
        });

        onSelect(league);
      },
      [onSelect, router],
    );

    const renderLeague: ListRenderItem<LeagueType> = useCallback(
      ({ item: league }) => {
        const { label, logo, logoLight } = leagueConfig[league];

        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => goToLeague(league)}
              style={styles.leagueButton}
              activeOpacity={0.6}
            >
              <View style={styles.buttonWrapper}>
                <Image
                  style={styles.leagueLogo}
                  source={isDark ? logoLight : logo}
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
      [goToLeague, isDark, styles],
    );

    const renderEmptyResults = useCallback(() => {
      return (
        <View style={global.emptyContainer}>
          <Text style={global.emptySubText}>No leagues found.</Text>
        </View>
      );
    }, [global]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={2}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={(index) => {
          if (index >= 0) {
            onOpen?.();
          } else {
            onClose?.();
          }
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        backgroundStyle={styles.backgroundStyle}
        handleComponent={() => (
          <View style={styles.header}>
            <View style={styles.handleIndicatorStyle} />
            <Text style={styles.headerText}>Leagues</Text>
          </View>
        )}
        onDismiss={handleDismiss}
      >
        <BlurView
          intensity={100}
          tint={"systemMaterial"}
          style={styles.blurContainer}
        >
          <View style={styles.searcBarContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>

          <BottomSheetFlatList
            data={filteredLeagues}
            keyExtractor={(item) => item}
            renderItem={renderLeague}
            ListEmptyComponent={renderEmptyResults}
            contentContainerStyle={[
              styles.scrollContent,
              filteredLeagues.length === 0 && { flexGrow: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          />
        </BlurView>
      </BottomSheetModal>
    );
  },
);

export default SportsListModal;
