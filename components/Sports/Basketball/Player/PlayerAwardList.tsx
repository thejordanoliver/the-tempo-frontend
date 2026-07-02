import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, Text, View } from "react-native";
import { DBPlayer } from "types/types";

type Props = {
  player: DBPlayer | null;
};

export default function PlayerAwardList(player: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerAwardListStyles(isDark);

  const playerAwardsArray = player.player?.awards;
  if (!playerAwardsArray || playerAwardsArray.length === 0) return null;

  const playerAwards = playerAwardsArray.map((award, i) => {
    const isAlt = i % 2 === 1;
    const isLast = i === playerAwardsArray.length - 1;

    const zebra = isAlt
      ? isDark
        ? styles.rowAltDark
        : styles.rowAltLight
      : null;

    return (
      <View
        key={award}
        style={[
          styles.awardItem,
          zebra,
          { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
        ]}
      >
        <Ionicons
          name="trophy"
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />
        <Text style={styles.awardText}>{award}</Text>
      </View>
    );
  });

  return (
    <View>
      <HeadingTwo isDark={isDark}>Awards</HeadingTwo>
      <View style={styles.wrapper}>{playerAwards}</View>
    </View>
  );
}

export const playerAwardListStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderRadius: 8,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: "hidden",
    },
    awardItem: {
      gap: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
      paddingVertical: 12,
    },
    awardText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },
  });
