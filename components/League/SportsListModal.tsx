// components/SportsListModal.tsx
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import MLBLogo from "assets/Baseball/MLB_Logos/MLB.png";
import CBLogo from "assets/College_Logos/Conference_Logos/CB.png";
import CBBLogo from "assets/College_Logos/Conference_Logos/CBB.png";
import CFBLogo from "assets/College_Logos/Conference_Logos/CFB.png";
import SBLogo from "assets/College_Logos/Conference_Logos/SB.png";
import WCBBLogo from "assets/College_Logos/Conference_Logos/WCBB.png";
import NFLLogo from "assets/Football/NFL_Logos/NFL.png";
import NHLLogo from "assets/Hockey/NHL_Logos/NHL.png";
import NBALogo from "assets/Logos/NBA.png";
import WNBALogo from "assets/Logos/WNBA/WNBA.png";
import MMALogo from "assets/MMA/MMA_Logos/MMA.png";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { forwardRef, useImperativeHandle, useMemo } from "react";
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
  onClose?: () => void; // 👈 new prop
};

const leagues: LeagueType[] = [
  "NBA",
  "WNBA",
  "NFL",
  "CFB",
  "CB",
  "SB",
  "CBB",
  "WCBB",
  "MLB",
  "NHL",
  "MMA",
];
const leagueConfig: Record<LeagueType, { label: string; logo: any }> = {
  NBA: { label: "NBA", logo: NBALogo },
  WNBA: { label: "WNBA", logo: WNBALogo },
  NFL: { label: "NFL", logo: NFLLogo },
  CFB: { label: "College Football", logo: CFBLogo },
  CB: { label: "College Baseball", logo: CBLogo },
  SB: { label: "College Softball", logo: SBLogo },
  CBB: { label: "Men's College Basketball", logo: CBBLogo },
  WCBB: { label: "Women's College Basketball", logo: WCBBLogo },
  MLB: { label: "MLB", logo: MLBLogo },
  NHL: { label: "NHL", logo: NHLLogo },
  MMA: { label: "MMA", logo: MMALogo },
};

const SportsListModal = forwardRef<SportsListModalRef, SportsListModalProps>(
  ({ onSelect, onClose }, ref) => {
    const { resolvedColorScheme } = usePreferences();
    const isDark = resolvedColorScheme === "dark";
    const styles = sportsListModalStyles(isDark);
    const router = useRouter();
    const sheetRef = useMemo(
      () => ({ current: null as BottomSheetModal | null }),
      [],
    );

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    type LeagueRoute =
      | "/league/nba"
      | "/league/wnba"
      | "/league/nfl"
      | "/league/cb"
      | "/league/sb"
      | "/league/cfb"
      | "/league/cbb"
      | "/league/wcbb"
      | "/league/mlb"
      | "/league/nhl"
      | "/league/mma";

    const goToLeague = (league: LeagueType) => {
      sheetRef.current?.dismiss();
      onClose?.(); // 👈 tell parent it closed

      const route: LeagueRoute =
        league === "NBA"
          ? "/league/nba"
          : league === "WNBA"
            ? "/league/wnba"
            : league === "NFL"
              ? "/league/nfl"
              : league === "CFB"
                ? "/league/cfb"
                : league === "CB"
                  ? "/league/cb"
                : league === "SB"
                  ? "/league/sb"
                  : league === "CBB"
                    ? "/league/cbb"
                    : league === "WCBB"
                      ? "/league/wcbb"
                      : league === "NHL"
                        ? "/league/nhl"
                        : league === "MMA"
                          ? "/league/mma"
                          : "/league/mlb";
      router.push(route);
      onSelect(league);
    };

    return (
      <BottomSheetModal
        ref={sheetRef as any}
        index={2}
        snapPoints={snapPoints}
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
            <View style={styles.handleIndicatorStyle}></View>
            <Text style={styles.headerText}>Leagues</Text>
          </View>
        )}
        onDismiss={onClose}
      >
        <BlurView
          intensity={100}
          tint={"systemThinMaterial"}
          style={styles.blurContainer}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {leagues.map((league) => {
              const { label, logo } = leagueConfig[league];

              return (
                <View key={league} style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => goToLeague(league)}
                    style={styles.leagueButton}
                    activeOpacity={0.6}
                  >
                    <View style={styles.buttonWrapper}>
                      <Image style={styles.leagueLogo} source={logo} />
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
            })}
          </BottomSheetScrollView>
        </BlurView>
      </BottomSheetModal>
    );
  },
);

export default SportsListModal;
