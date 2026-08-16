import type { FootballDrive } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { FlatList, Image, Text, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/DrivesListStyles";

type Props = {
  previousDrives?: FootballDrive[] | null;
  currentDrives?: FootballDrive[] | null;
  loading?: boolean;
  error?: string | null;
  isDark: boolean;
  league?: string;
};

const normalizeDriveId = (id?: string | number | null): string | null => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  return String(id);
};

export default function DrivesList({
  previousDrives,
  currentDrives,
  loading,
  error,
  isDark,
  league = "nfl",
}: Props) {
  const styles = getStyles(isDark);
  const global = globalStyles(isDark);

  // Normalize
  const safePrevious = Array.isArray(previousDrives) ? previousDrives : [];
  const safeCurrent = Array.isArray(currentDrives) ? currentDrives : [];

  // ⭐ COMBINE BUT ENSURE UNIQUE IDS
  const combined = [...safeCurrent, ...safePrevious];

  // ⭐ DE-DUPLICATE BY DRIVE ID
  const seen = new Set<string>();
  const drives = combined.filter((d) => {
    const driveId = normalizeDriveId(d?.id);

    if (!driveId) return false;
    if (seen.has(driveId)) return false; // skip duplicates
    seen.add(driveId);
    return true;
  });

  if (loading) return <Text style={styles.emptyText}>Loading drives...</Text>;
  if (error) return <Text style={styles.emptyText}>{error}</Text>;
  if (drives.length === 0)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No drives available</Text>
      </View>
    );

  const subTextColor = isDark ? Colors.midTone : Colors.darkGray;

  const borderColor = isDark ? Colors.midTone : Colors.lightGray;

  return (
    <View>
      <FlatList
        data={drives}
        keyExtractor={(item, index) =>
          normalizeDriveId(item.id) ?? `drive-${index}`
        }
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        renderItem={({ item, index }) => {
          const isNFL = league === "nfl";
          const teamId = item.team?.id ?? "ALL";
          const team = isNFL ? getNFLTeam(teamId) : getCFBTeam(teamId);
          const isLast = index === drives.length - 1;
          const logo = isNFL
            ? getNFLTeamLogo(teamId, isDark)
            : getCFBTeamLogo(teamId, isDark);

          const resultUpper = (item.result ?? "").toUpperCase();
          let resultColor = subTextColor;

          if (
            resultUpper.includes("INT") ||
            resultUpper.includes("FUMBLE") ||
            resultUpper.includes("MISSED FG") ||
            resultUpper.includes("BLOCKED PUNT TD") ||
            resultUpper.includes("DOWNS")
          ) {
            resultColor = isDark ? Colors.dark.lightRed : Colors.light.red;
          } else if (resultUpper.includes("TD") || resultUpper.includes("FG")) {
            resultColor = isDark ? Colors.dark.leafGreen : Colors.light.green;
          } else if (resultUpper.includes("PUNT")) {
            resultColor = isDark ? Colors.dark.yellow : Colors.light.yellow;
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
                <Text style={styles.driveTeam}>{team?.code}</Text>
              </View>

              <Text style={styles.driveDescription}>{item.description}</Text>

              <Text style={[styles.driveDetail, { color: resultColor }]}>
                Result: {item.displayResult ?? "N/A"}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
