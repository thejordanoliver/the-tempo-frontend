import type { FootballDrive } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeam } from "constants/teamsCFB";
import { getNFLTeam } from "constants/teamsNFL";
import { useMemo } from "react";
import { FlatList, Image, Text, View, type ImageSourcePropType } from "react-native";
import { DriveListStyles } from "styles/GameDetailStyles/DrivesListStyles";

type Props = {
  previousDrives?: FootballDrive[] | null;
  currentDrives?: FootballDrive[] | null;
  loading?: boolean;
  error?: string | null;
  isDark: boolean;
  league?: string;
  teamCode?: string;
  teamLogo: ImageSourcePropType;
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
  teamCode,
  teamLogo,
}: Props) {
  const styles = DriveListStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const safePrevious = Array.isArray(previousDrives) ? previousDrives : [];
  const safeCurrent = Array.isArray(currentDrives) ? currentDrives : [];

  // Prefer the current version when a drive is also in the completed list.
  const combined = [...safeCurrent, ...safePrevious];

  const seen = new Set<string>();
  const drives = combined.filter((d) => {
    const driveId = normalizeDriveId(d?.id);

    if (!driveId) return true;
    if (seen.has(driveId)) return false; // skip duplicates
    seen.add(driveId);
    return true;
  });

  if (loading && drives.length === 0) return <Text style={styles.emptyText}>Loading drives...</Text>;
  if (error && drives.length === 0) return <Text style={styles.emptyText}>{error}</Text>;
  if (drives.length === 0)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No drives available</Text>
      </View>
    );

  const subTextColor = isDark ? Colors.midTone : Colors.darkGray;

  const borderColor = isDark ? Colors.midTone : Colors.lightGray;

  return (
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

        const result = item.displayResult?.trim() || item.shortDisplayResult?.trim() || item.result?.trim() || (safeCurrent.includes(item) ? "In progress" : "Unavailable");
        const resultUpper = (item.result || result).toUpperCase();
        let resultColor = subTextColor;

        if (
          /\b(INT|INTERCEPTION)\b/.test(resultUpper) ||
          resultUpper.includes("FUMBLE") ||
          resultUpper.includes("MISSED FG") ||
          resultUpper.includes("MISSED FIELD GOAL") ||
          resultUpper.includes("BLOCKED FIELD GOAL") ||
          resultUpper.includes("BLOCKED PUNT TD") ||
          resultUpper.includes("DOWNS")
        ) {
          resultColor = isDark ? Colors.dark.lightRed : Colors.light.red;
        } else if (item.isScore || /\b(TD|FG)\b/.test(resultUpper) || resultUpper.includes("TOUCHDOWN") || resultUpper.includes("FIELD GOAL")) {
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
              {teamLogo && (
                <Image
                  style={styles.teamLogo}
                  source={teamLogo}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.driveTeam}>{teamCode || team?.code || item.team?.code || item.team?.abbreviation || item.team?.displayName || "Team"}</Text>
            </View>

            <Text style={styles.driveDescription}>{item.description}</Text>

            <Text style={[styles.driveDetail, { color: resultColor }]}>
              Result: {result}
            </Text>
          </View>
        );
      }}
    />
  );
}
