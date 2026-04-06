import { Colors, Fonts } from "constants/styles";
import { ReactNode } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";

import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";

type TeamColors = {
  id?: string | number;
  name?: string;
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

const allTeams: TeamColors[] = [
  ...teams,
  ...nflTeams,
  ...cfbTeams,
  ...mlbTeams,
  ...nhlTeams,
  ...cbbTeams,
];

const findTeam = (
  teamId?: string,
  teamName?: string,
  fallback?: TeamColors,
) => {
  let teamObj: TeamColors | undefined;

  if (teamId) {
    teamObj = allTeams.find((t) => String(t.id) === String(teamId));
  }

  if (!teamObj && teamName) {
    const clean = teamName.toLowerCase();
    teamObj = allTeams.find(
      (t) =>
        t.name?.toLowerCase() === clean || t.fullName?.toLowerCase() === clean,
    );
  }

  if (!teamObj && fallback?.fullName) {
    const clean = fallback.fullName.toLowerCase();
    teamObj = allTeams.find(
      (t) =>
        t.name?.toLowerCase() === clean || t.fullName?.toLowerCase() === clean,
    );
  }

  return teamObj ?? fallback;
};

export default function InfoCard({
  label,
  value,
  image,
  team,
  teamId,
  teamName,
}: Props) {
  const teamObj = findTeam(teamId, teamName, team) ?? {
    color: Colors.midTone,
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = infoCardStyles(isDark, teamObj);

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

export const infoCardStyles = (isDark: boolean, teamObj: TeamColors) =>
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
      alignItems: "center",
      backgroundColor: teamObj?.color ?? Colors.midTone,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      width: "100%",
      minHeight: 80,
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
      resizeMode: "contain",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    value: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: Colors.white,
      flexShrink: 1,
      flex: 1,
    },
  });
