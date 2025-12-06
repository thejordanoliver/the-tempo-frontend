// components/SportsListModal.tsx
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import MLBLogo from "assets/Baseball/MLB_Logos/MLB.png";
import CBBLogo from "assets/College_Logos/CBB.png";
import CFBLogo from "assets/College_Logos/CFB.png";
import NFLLogo from "assets/Football/NFL_Logos/NFL.png";
import NBALogo from "assets/Logos/NBA.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LeagueType } from "types/types";

export type SportsListModalRef = {
  present: () => void;
  dismiss: () => void;
};

type SportsListModalProps = {
  onSelect: (league: LeagueType) => void;
  onClose?: () => void; // 👈 new prop
};

const leagues: LeagueType[] = ["NBA", "NFL", "CFB", "CBB", "MLB"];

const SportsListModal = forwardRef<SportsListModalRef, SportsListModalProps>(
  ({ onSelect, onClose }, ref) => {
    const sheetRef = useMemo(
      () => ({ current: null as BottomSheetModal | null }),
      []
    );

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const styles = getStyles(isDark);
    type LeagueRoute =
      | "/league/nba"
      | "/league/nfl"
      | "/league/cfb"
      | "/league/cbb"
      | "/league/mlb";

    const goToLeague = (league: LeagueType) => {
      sheetRef.current?.dismiss();
      onClose?.(); // 👈 tell parent it closed

      const route: LeagueRoute =
        league === "NBA"
          ? "/league/nba"
          : league === "NFL"
          ? "/league/nfl"
          : league === "CFB"
          ? "/league/cfb"
          : league === "CBB"
          ? "/league/cbb"
          : "/league/mlb";
      router.push(route);
      onSelect(league);
    };

    return (
      <BottomSheetModal
        ref={sheetRef as any}
        index={2}
        snapPoints={["60%", "80%", "90%"]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backgroundStyle={{ backgroundColor: "transparent", overflow: "hidden" }}
        handleComponent={() => (
          <View style={styles.header}>
            <View
              style={{
                backgroundColor: "#777",
                width: 36,
                height: 4,
                borderRadius: 2,
                zIndex: 9999,
                marginBottom: 4,
              }}
            ></View>
            <Text style={styles.headerText}>Leagues</Text>
          </View>
        )}
        onDismiss={onClose} // 👈 fires when modal is swiped down or closed
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
            {leagues.map((league) => (
              <TouchableOpacity
                key={league}
                onPress={() => goToLeague(league)}
                style={styles.leagueButton}
                activeOpacity={0.6}
              >
                <View style={styles.buttonWrapper}>
                  <Image
                    style={styles.leagueLogo}
                    source={
                      league === "NBA"
                        ? NBALogo
                        : league === "NFL"
                        ? NFLLogo
                        : league === "CFB"
                        ? CFBLogo
                        : league === "CBB"
                        ? CBBLogo
                        : MLBLogo
                    }
                  />
                  <Text style={styles.leagueText}>{league}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? Colors.white : Colors.black}
                />
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        </BlurView>
      </BottomSheetModal>
    );
  }
);

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    handleStyle: {
      backgroundColor: "transparent",
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 8,
      right: 8,
      top: 0,
    },
    handleIndicatorStyle: {
      backgroundColor: Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    blurContainer: {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
      paddingHorizontal: 16,
      paddingTop: 60,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      position: "absolute",
      width: "100%",
      top: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 12,
    },
    headerText: {
      textAlign: "center",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
    },
    leagueButton: {
      paddingVertical: 12,
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    buttonWrapper: { flexDirection: "row", alignItems: "center" },
    leagueLogo: {
      width: 40,
      height: 40,
      marginRight: 8,
    },
    leagueText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
    },
  });

export default SportsListModal;
