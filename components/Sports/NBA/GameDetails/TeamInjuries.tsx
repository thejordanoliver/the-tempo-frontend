import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "components/TabBars/FixedWidthTabBar";
import { getTeamByESPNId } from "constants/teams";
import { useEffect, useState } from "react";
import { Image, Text, useColorScheme, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import TeamInjuriesList from "./TeamInjuriesList";

// ✅ Define type for injuries
export type TeamInjury = {
  team: {
    id: string | number;
    displayName: string;
    abbreviation: string;
  };
  injuries: {
    athlete: {
      id: string | number;
      fullName: string;
      headshot?: string;
      position?: string;
      jersey?: string;
    };
    status: string;
    details?: {
      detail?: string;
      returnDate?: string;
    };
  }[];
};

type Props = {
  injuries: any[];
  lighter?: boolean;
  loading?: boolean; // ✅ add this here too
};

export default function TeamInjuries({ injuries, lighter = false }: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const styles = teamInjuryStyles(isDark, lighter);
  // Reorder so away team is first
  const reorderedInjuries =
    injuries?.length === 2 ? [injuries[1], injuries[0]] : injuries ?? [];

  const tabs = reorderedInjuries.map((inj) => {
    const team = getTeamByESPNId(inj.team.id);

    return {
      id: String(inj.team.id), // ✅ normalized
      label: inj.team.abbreviation,
      logo: team?.logo,
      logoLight: team?.logoLight,
    };
  });

  useEffect(() => {
    if (!selectedTeamId && tabs.length) {
      setSelectedTeamId(tabs[0].id);
    }
  }, [tabs]);

  const currentInjuries = reorderedInjuries.find(
    (t) => String(t.team.id) === selectedTeamId
  );

  // ✅ Now safe to bail out
  if (!injuries || injuries.length === 0 || !currentInjuries) {
    return null;
  }

  return (
    <View>
      <HeadingTwo style={{ marginBottom: 12 }} lighter={lighter}>
        Injury Report
      </HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((t) => t.id)} // 👈 IDs, not names
          selected={selectedTeamId}
          onTabPress={setSelectedTeamId}
          lighter={lighter}
          renderLabel={(tabId, isSelected) => {
            const tab = tabs.find((t) => t.id === tabId);
            if (!tab) return null;

            return (
              <View style={styles.tabLabel}>
                {tab.logo && (
                  <Image
                    source={
                      lighter
                        ? tab.logoLight || tab.logo
                        : isDark
                        ? tab.logoLight || tab.logo
                        : tab.logo
                    }
                    style={[styles.logo, { opacity: isSelected ? 1 : 0.5 }]}
                    resizeMode="contain"
                  />
                )}

                <Text
                  style={getLabelStyle(isDark, isSelected, lighter, {
                    opacity: isSelected ? 1 : 0.5,
                  })}
                >
                  {tab.label}
                </Text>
              </View>
            );
          }}
        />

        <TeamInjuriesList injuries={[currentInjuries]} lighter={lighter} />
      </View>
    </View>
  );
}
