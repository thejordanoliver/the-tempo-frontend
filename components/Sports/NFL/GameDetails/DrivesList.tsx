import { Colors } from "constants/Styles";
import { getTeamByESPNId } from "constants/teamsCFB";
import { getTeamByESPNId as getNFLTeamByESPNId } from "constants/teamsNFL";
import { FlatList, Image, Text, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { getStyles } from "styles/GameDetailStyles/DrivesListStyles";
import { LeagueType } from "types/types";

export type Drive = {
  id: string;
  description: string;
  result: string;
  shortDisplayResult: string;
  displayResult: string;
  offensivePlays: number;
  yards: number;
  team: {
    id?: number;
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
  league?: LeagueType;
};

export default function DrivesList({
  previousDrives,
  currentDrives,
  loading,
  error,
  lighter = false,
  league = "NFL",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Normalize
  const safePrevious = Array.isArray(previousDrives) ? previousDrives : [];
  const safeCurrent = Array.isArray(currentDrives) ? currentDrives : [];

  // ⭐ COMBINE BUT ENSURE UNIQUE IDS
  const combined = [...safeCurrent, ...safePrevious];

  // ⭐ DE-DUPLICATE BY DRIVE ID
  const seen = new Set<string>();
  const drives = combined.filter((d) => {
    if (!d || !d.id) return false;
    if (seen.has(d.id)) return false; // skip duplicates
    seen.add(d.id);
    return true;
  });

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
          keyExtractor={(item) => item.id} // 👈 now ID is unique
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const teamId = item.team?.id ?? "ALL";
            const team =
              league === "CFB"
                ? getTeamByESPNId(teamId)
                : getNFLTeamByESPNId(teamId);
            const isLast = index === drives.length - 1;

            const logo = lighter
              ? team?.logoLight || team?.logo
              : isDark
              ? team?.logoLight || team?.logo
              : team?.logo;

            const resultUpper = (item.result ?? "").toUpperCase();
            let resultColor = subTextColor;

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
                ? Colors.dark.leafGreen
                : isDark
                ? Colors.dark.leafGreen
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
                style={[
                  styles.driveCard,
                  !isLast && { borderBottomColor: borderColor },
                  isLast && { borderBottomWidth: 0 },
                ]}
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
                    {item.team?.shortDisplayName ?? "Unknown"}
                  </Text>
                </View>

                <Text
                  style={[styles.driveDescription, { color: subTextColor }]}
                >
                  {item.description}
                </Text>

                <Text style={[styles.driveDetail, { color: resultColor }]}>
                  Result: {item.displayResult ?? "N/A"}
                </Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </View>
  );
}
