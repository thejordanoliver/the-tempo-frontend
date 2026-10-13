import { PlayerAwardListStyles } from "@/styles/PlayerStyles/PlayerAwardListStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { StyleSheet, Text, View } from "react-native";
import { Player } from "types/types";

type Props = {
  player: Player | null;
};

export default function PlayerAwardList(player: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = PlayerAwardListStyles(isDark);

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
      <View style={styles.wrapper}>{playerAwards}</View>
    </View>
  );
}
