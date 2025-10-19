import { getNFLTeamsLogo } from "constants/teamsNFL";
import { getStyles } from "styles/GameDetailStyles/DrivesList.styles";

import { FlatList, Image, Text, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
export type Drive = {
  id: string;
  description: string;
  result: string;
  shortDisplayResult: string;
  offensivePlays: number;
  yards: number;
  team: {
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
  };
};

type Props = {
  previousDrives?: Drive[] | null;
  currentDrives?: Drive[] | null;
  loading?: boolean;
  error?: string | null;
  lighter?: boolean;
};

export default function NFLDrivesList({
  previousDrives,
  currentDrives,
  loading,
  error,
  lighter = false,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  // Always coerce to arrays so spread/map never break
  const safePrevious = Array.isArray(previousDrives) ? previousDrives : [];
  const safeCurrent = Array.isArray(currentDrives) ? currentDrives : [];
  const drives = [...safeCurrent, ...safePrevious]; // current first, then history

  if (loading) return <Text style={styles.emptyText}>Loading drives...</Text>;
  if (error) return <Text style={styles.emptyText}>{error}</Text>;
  if (drives.length === 0)
    return <Text style={styles.emptyText}>No drives available</Text>;
  const textColor = lighter ? "#fff" : isDark ? "#fff" : "#1d1d1d";
  const subTextColor = lighter ? "#ccc" : isDark ? "#888" : "#555";
  const borderColor = lighter ? "#aaa" : isDark ? "#888" : "#ccc";

  return (
    <View>
      <ScrollView style={{ maxHeight: 400 }}>
        <FlatList
          data={drives}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          renderItem={({ item }) => {
            // ✅ Show light logos in dark mode or when lighter prop is true
            const useLightLogo = lighter || isDark;
            const logo = getNFLTeamsLogo(item.team.abbreviation, useLightLogo);

            const resultUpper = (item.result ?? "").toUpperCase();

            let resultColor = isDark ? "#aaa" : "#444";

            if (
              resultUpper.includes("INT") ||
              resultUpper.includes("FUMBLE") ||
              resultUpper.includes("MISSED FG") ||
              resultUpper.includes("BLOCKED PUNT TD") ||
              resultUpper.includes("DOWNS")
            ) {
              resultColor = lighter
                ? "#ff4444"
                : isDark
                ? "#ff4444"
                : "#cc0000";
            } else if (
              resultUpper.includes("TD") ||
              resultUpper.includes("FG")
            ) {
              resultColor = lighter
                ? "#00ff00"
                : isDark
                ? "#00ff00"
                : "#008800";
            } else if (resultUpper.includes("PUNT")) {
              resultColor = lighter
                ? "#ff9100ff"
                : isDark
                ? "#ff9100ff"
                : "#de7e00ff";
            }

            return (
              <View
                style={[styles.driveCard, { borderBottomColor: borderColor }]}
              >
                <View style={styles.headerRow}>
                  <Image style={styles.teamLogo} source={logo} />
                  <Text style={[styles.driveTeam, { color: textColor }]}>
                    {item.team.shortDisplayName}
                  </Text>
                </View>
                <Text
                  style={[styles.driveDescription, { color: subTextColor }]}
                >
                  {item.description}
                </Text>
                <Text style={[styles.driveDetail, { color: resultColor }]}>
                  Result: {item.result ?? "N/A"}
                </Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </View>
  );
}
