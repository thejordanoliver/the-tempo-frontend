import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { ReactNode } from "react";
import { Image, Text, View } from "react-native";
import { teams, teamsById } from "../../../constants/teams";
import { teams as teamsCFB, teamsCFBById } from "../../../constants/teamsCFB";
import { teams as teamsNFL, teamsNFLById } from "../../../constants/teamsNFL";

type TeamColors = {
  id?: string | number;
  fullName?: string;
  color?: string;
  secondaryColor?: string;
  constantLight?: string;
  constantTextLight?: string;
  constantBlack?: string;
};

type Props = {
  label: string;
  value: string | number | ReactNode | string[] | number[];
  image?: any;
  isDark: boolean;
  team: TeamColors;
  teamId?: string;
  teamName?: string;
  backgroundColor?: string;
  textColor?: string; // color for the value text
  labelColor?: string; // color for the label text
};

export default function InfoCard({
  label,
  value,
  image,
  isDark,
  team,
  teamId,
  teamName,
  backgroundColor,
  textColor,
  labelColor,
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

  const isConferenceChampionships = label === "Conference Championships";

  // 🧩 Format value: join arrays into a readable comma-separated string
  let formattedValue: string | ReactNode;
  if (Array.isArray(value)) {
    formattedValue = value.join(", ");
  } else {
    formattedValue = value;
  }

  const resolvedLabelColor =
    labelColor ?? (isDark ? Colors.white : Colors.black);
  const resolvedTextColor = textColor ?? (isDark ? Colors.white : Colors.black);

  return (
    <>
      <Text
        style={{
          color: resolvedLabelColor,
          fontFamily: Fonts.OSMEDIUM,
          fontSize: 20,
          paddingBottom: 4,
          marginBottom: 8,
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: isConferenceChampionships ? "flex-start" : "center",
          backgroundColor: backgroundColor ?? teamObj.color,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 12,
          width: "100%",
          minHeight: 80,
          flexWrap: isConferenceChampionships ? "wrap" : "nowrap",
        }}
      >
        {image && (
          <View
            style={{
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              overflow: "hidden",
            }}
          >
            <Image
              source={image}
              style={{
                width: 54,
                height: 54,
                paddingTop: 8,
                resizeMode: "contain",
                backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
              }}
            />
          </View>
        )}

        <Text
          style={{
            fontFamily: Fonts.OSREGULAR,
            fontSize: 16,
            color: Colors.white,
            flexShrink: 1,
            flex: 1,
            flexWrap: isConferenceChampionships ? "wrap" : "nowrap",
          }}
        >
          {formattedValue}
        </Text>
      </View>
    </>
  );
}
