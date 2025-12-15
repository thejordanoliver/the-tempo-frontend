import { Dropdown } from "components/Dropdown";
import { useState } from "react";
import { ScrollView, useColorScheme } from "react-native";
import { AwardSeasonsTable } from "./AwardSeasonsTable";
import { AwardCategory } from "hooks/useNBAAwardSeasons";
const AWARD_OPTIONS = [
  { label: "All Awards", value: "all" },
  { label: "MVP", value: "mvp" },
  { label: "ROTY", value: "roy" },
  { label: "DPOY", value: "dpoy" },
  { label: "6MOY", value: "sixthman" },
  { label: "COY", value: "coy" },
  { label: "MIP", value: "mip" },
  { label: "FMVP", value: "fmvp" },
];

type Props = {
  lighter?: boolean;
};

export default function NBAAwardSeasons({ lighter = false }: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedAward, setSelectedAward] = useState<AwardCategory>("all");

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 100,
        paddingTop: 12,
      }}
    >
      {/* Dropdown */}
      <Dropdown
        options={AWARD_OPTIONS}
        selectedValue={selectedAward}
        onSelect={(val) => setSelectedAward(val as AwardCategory)}
        isDark={isDark}
        absolute
      />

      {(selectedAward === "all" || selectedAward === "mvp") && (
        <AwardSeasonsTable category="mvp" title="NBA MVP" lighter={lighter} />
      )}

      {(selectedAward === "all" || selectedAward === "roy") && (
        <AwardSeasonsTable
          category="roy"
          title="NBA Rookie of the Year"
          lighter={lighter}
        />
      )}

      {(selectedAward === "all" || selectedAward === "dpoy") && (
        <AwardSeasonsTable
          category="dpoy"
          title="NBA Defensive Player of the Year"
          lighter={lighter}
        />
      )}

      {(selectedAward === "all" || selectedAward === "sixthman") && (
        <AwardSeasonsTable
          category="sixthman"
          title="NBA Sixth Man of the Year"
          lighter={lighter}
        />
      )}
      {(selectedAward === "all" || selectedAward === "sixthman") && (
        <AwardSeasonsTable
          category="sixthman"
          title="NBA Sixth Man of the Year"
          lighter={lighter}
        />
      )}
      {(selectedAward === "all" || selectedAward === "coy") && (
        <AwardSeasonsTable
          category="coy"
          title="NBA Coach of the Year"
          lighter={lighter}
        />
      )}
      {(selectedAward === "all" || selectedAward === "mip") && (
        <AwardSeasonsTable
          category="mip"
          title="NBA Most Improved Player"
          lighter={lighter}
        />
      )}
      {(selectedAward === "all" || selectedAward === "fmvp") && (
        <AwardSeasonsTable
          category="fmvp"
          title="NBA Finals MVP"
          lighter={lighter}
        />
      )}
    </ScrollView>
  );
}
