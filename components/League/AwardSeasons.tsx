import { Dropdown } from "components/Dropdown";
import { AwardCategory, League } from "hooks/useAwardSeasons";
import { useState } from "react";
import { ScrollView, useColorScheme, RefreshControl } from "react-native";
import { AwardSeasonsTable } from "./AwardSeasonsTable";


const AWARD_CONFIG: Partial<
  Record<League, { label: string; value: AwardCategory; title: string }[]>
> = {
  NBA: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "NBA MVP" },
    { label: "ROTY", value: "roy", title: "NBA Rookie of the Year" },
    { label: "DPOY", value: "dpoy", title: "NBA Defensive Player of the Year" },
    { label: "6MOY", value: "sixthman", title: "NBA Sixth Man of the Year" },
    { label: "COY", value: "coy", title: "NBA Coach of the Year" },
    { label: "MIP", value: "mip", title: "NBA Most Improved Player" },
    { label: "FMVP", value: "fmvp", title: "NBA Finals MVP" },
  ],

  CFB: [
    { label: "All Awards", value: "all", title: "" },

    // 🏆 Major awards
    { label: "Heisman Trophy", value: "heisman", title: "Heisman Trophy" },
    { label: "AP Player of the Year", value: "apoy", title: "AP Player of the Year" },
    { label: "Walter Camp POY", value: "camp", title: "Walter Camp POY" },
    { label: "Maxwell Award", value: "maxwell", title: "Maxwell Award" },

    // 🏈 Position / skill awards
    { label: "Fred Biletnikoff Award", value: "biletnikoff", title: "Fred Biletnikoff Award" },
    { label: "Doak Walker Award", value: "doak", title: "Doak Walker Award" },
    { label: "John Mackey Award", value: "mackey", title: "John Mackey Award" },
    { label: "Lou Groza Award", value: "groza", title: "Lou Groza Award" },

    // 🧱 Offensive line
    { label: "Rimington Trophy", value: "rimington", title: "Rimington Trophy" },
    { label: "Outland Trophy", value: "outland", title: "Outland Trophy" },

    // 🛡 Defense / line / impact
    { label: "Jim Thorpe Award", value: "thorpe", title: "Jim Thorpe Award" },
    { label: "Bronko Nagurski Award", value: "nagurski", title: "Bronko Nagurski Award" },
    { label: "Dick Butkus Award", value: "butkus", title: "Dick Butkus Award" },
    { label: "Ted Hendricks Award", value: "hendricks", title: "Ted Hendricks Award" },
    { label: "Lombardi Award", value: "lombardi", title: "Lombardi Award" },
    { label: "Ronnie Lott Trophy", value: "lott", title: "Ronnie Lott Trophy" },

    // 🧠 QB awards
    { label: "Davey O’Brien Award", value: "obrien", title: "Davey O’Brien Award" },
    { label: "Manning Award", value: "manning", title: "Manning Award" },
    { label: "Johnny Unitas Golden Arm Award", value: "unitas", title: "Johnny Unitas Golden Arm Award" },
  ],
};




type Props = {
  league: League; // 👈 NEW
  lighter?: boolean;
};


export default function AwardSeasons({
  league,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
const [refreshing, setRefreshing] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);

const awards = AWARD_CONFIG[league] ?? [];
 const dropdownOptions = awards.map(({ label, value }) => ({
  label,
  value,
}));
  const [selectedAward, setSelectedAward] =
    useState<AwardCategory>("all");

    
const handleRefresh = async () => {
  setRefreshing(true);
  setRefreshKey((k) => k + 1);

  // small delay so UI feels native
  setTimeout(() => {
    setRefreshing(false);
  }, 500);
};


  return (
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={isDark ? "#fff" : "#000"}
    />
  }
  contentContainerStyle={{
    paddingHorizontal: 12,
    paddingBottom: 100,
    paddingTop: 12,
  }}
>


      {/* Dropdown */}
      <Dropdown
        options={dropdownOptions}
        selectedValue={selectedAward}
        onSelect={(val) => setSelectedAward(val as AwardCategory)}
        isDark={isDark}
        absolute
      />

      {awards?.map(({ value, title }) => {
        if (value === "all") return null;

        if (selectedAward !== "all" && selectedAward !== value) {
          return null;
        }

        return (
        <AwardSeasonsTable
  key={`${league}-${value}-${refreshKey}`}
  league={league}
  category={value}
  title={title}
  lighter={lighter}
    refreshSignal={refreshKey}   // 👈 THIS is the trigger

/>

        );
      })}
    </ScrollView>
  );
}
