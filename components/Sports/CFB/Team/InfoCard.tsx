import { Colors, Fonts } from "constants/Styles";
import { ReactNode } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { teams, teamsById } from "../../../../constants/teams";
import {
  teams as teamsCFB,
  teamsCFBById,
} from "../../../../constants/teamsCFB";
import {
  teams as teamsNFL,
  teamsNFLById,
} from "../../../../constants/teamsNFL";
type TeamColors = {
  id?: string | number;
  fullName?: string;
  color?: string;
  secondaryColor?: string;
};

type Props = {
  label: string;
  value: string | number | ReactNode | string[] | number[];
  image?: any;
  team: TeamColors;
  teamId?: string;
  teamName?: string;
};

export default function InfoCard({
  label,
  value,
  image,
  team,
  teamId,
  teamName,
}: Props) {
  let teamObj: TeamColors | undefined;

  // --- ID checks ---
  if (
    teamId &&
    (teamsById[teamId] || teamsNFLById[teamId] || teamsCFBById[teamId])
  ) {
    teamObj = teamsById[teamId] ?? teamsNFLById[teamId] ?? teamsCFBById[teamId];
  }

  // --- Name checks ---
  if (!teamObj && teamName) {
    const cleanName = teamName.toLowerCase();
    teamObj =
      teams.find((t) => t.fullName.toLowerCase() === cleanName) ??
      teamsNFL.find((t) => t.name.toLowerCase() === cleanName) ??
      teamsCFB.find((t) => t.name.toLowerCase() === cleanName);
  }

  // --- Provided team object fallback ---
  if (!teamObj && team.fullName) {
    const cleanName = team.fullName.toLowerCase();
    teamObj =
      teams.find((t) => t.fullName?.toLowerCase() === cleanName) ??
      teamsNFL.find((t) => t.name?.toLowerCase() === cleanName) ??
      teamsCFB.find((t) => t.name?.toLowerCase() === cleanName);
  }

  // Final fallback
  if (!teamObj) teamObj = team;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isConferenceChampionships = label === "Conference Championships";
  const styles = infoCardStyles(isDark, isConferenceChampionships, teamObj);

  // 🧩 Format value: join arrays into a readable comma-separated string
  let formattedValue: string | ReactNode;
  if (Array.isArray(value)) {
    formattedValue = value.join(", ");
  } else {
    formattedValue = value;
  }

  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.cardContainer}>
        {image && (
          <View style={styles.imageContainer}>
            <Image source={image} style={styles.image} />
          </View>
        )}

        <Text style={styles.value}>{formattedValue}</Text>
      </View>
    </>
  );
}

export const infoCardStyles = (
  isDark: boolean,
  isConferenceChampionships: boolean,
  teamObj: TeamColors,
) =>
  StyleSheet.create({
    label: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 20,
      paddingBottom: 4,
      marginBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    cardContainer: {
      flexDirection: "row",
      alignItems: isConferenceChampionships ? "flex-start" : "center",
      backgroundColor: teamObj.color,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      width: "100%",
      minHeight: 80,
      flexWrap: isConferenceChampionships ? "wrap" : "nowrap",
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
    imageContainer: {
      borderRadius: 100,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      overflow: "hidden",
    },
    image: {
      width: 54,
      height: 54,
      paddingTop: 8,
      resizeMode: "contain",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    value: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: Colors.white,
      flexShrink: 1,
      flex: 1,
      flexWrap: isConferenceChampionships ? "wrap" : "nowrap",
    },
  });
