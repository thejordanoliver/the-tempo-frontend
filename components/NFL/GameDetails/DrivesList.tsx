import { Colors } from "constants/Colors";
import { getTeamLogo } from "constants/teamsCFB";
import { getNFLTeamsLogo } from "constants/teamsNFL";
import { FlatList, Image, Text, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { getStyles } from "styles/GameDetailStyles/DrivesList.styles";
import { LeagueType } from "types/types";

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
  league?: LeagueType; // 🏈 added league prop
};

export default function DrivesList({
  previousDrives,
  currentDrives,
  loading,
  error,
  lighter = false,
  league = "NFL", // default to NFL
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  const safePrevious = Array.isArray(previousDrives) ? previousDrives : [];
  const safeCurrent = Array.isArray(currentDrives) ? currentDrives : [];
  const drives = [...safeCurrent, ...safePrevious]; // current first

  if (loading) return <Text style={styles.emptyText}>Loading drives...</Text>;
  if (error) return <Text style={styles.emptyText}>{error}</Text>;
  if (drives.length === 0)
    return <Text style={styles.emptyText}>No drives available</Text>;

  const textColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;
  const subTextColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.darkGray;
  const borderColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.lightGray;

  return (
    <View>
      <ScrollView style={{ maxHeight: 400 }}>
        <FlatList
          data={drives}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const useLightLogo = lighter || isDark;
            // 🧠 Select correct logo helper based on league
            const logo =
              league === "CFB"
                ? getTeamLogo(item.team.abbreviation, useLightLogo)
                : getNFLTeamsLogo(item.team.abbreviation, useLightLogo);

            const resultUpper = (item.result ?? "").toUpperCase();

            let resultColor = lighter
              ? Colors.lightGray
              : isDark
              ? Colors.lightGray
              : Colors.darkGray;

            if (
              resultUpper.includes("INT") ||
              resultUpper.includes("FUMBLE") ||
              resultUpper.includes("MISSED FG") ||
              resultUpper.includes("BLOCKED PUNT TD") ||
              resultUpper.includes("DOWNS")
            ) {
              resultColor = lighter
                ? Colors.dark.lightRed
                : isDark
                ? Colors.dark.lightRed
                : Colors.light.red;
            } else if (
              resultUpper.includes("TD") ||
              resultUpper.includes("FG")
            ) {
              resultColor = lighter
                ? Colors.dark.limeGreen
                : isDark
                ? Colors.dark.limeGreen
                : Colors.light.green;
            } else if (resultUpper.includes("PUNT")) {
              resultColor = lighter
                ? Colors.dark.yellow
                : isDark
                ? Colors.dark.yellow
                : Colors.light.yellow;
            }

            return (
              <View
                style={[styles.driveCard, { borderBottomColor: borderColor }]}
              >
                <View style={styles.headerRow}>
                  {logo && (
                    <Image
                      style={styles.teamLogo}
                      source={logo}
                      resizeMode="contain"
                    />
                  )}
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
