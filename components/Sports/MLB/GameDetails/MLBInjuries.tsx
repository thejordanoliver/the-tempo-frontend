import { Colors, Fonts } from "constants/Styles";
import { getMLBTeamByEspnId } from "constants/teamsMLB";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import HeadingTwo from "../../../Headings/HeadingTwo";
import FixedWidthTabBar from "../../../TabBars/FixedWidthTabBar";

export interface MLBInjury {
  status: string;
  date?: string;
  athlete: {
    id: string;
    displayName: string;
    shortName?: string;
    headshot?: { href: string };
    position?: { displayName?: string; abbreviation?: string };
    jersey?: string;
  };
  details?: {
    type?: string;
    location?: string;
    returnDate?: string;
  };
}

export interface MLBTeamInjuries {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: MLBInjury[];
}

type Props = {
  injuries: MLBTeamInjuries[];
  loading: boolean;
  error: any;
  awayTeam?: string;
  homeTeam?: string;
  lighter?: boolean;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/36?text=👤";

export default function MLBInjuries({
  injuries,
  loading,
  error,
  awayTeam,
  homeTeam,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = teamInjuryStyles(isDark, lighter);

  // ---------------------------------------------------------------------
  // 🟦 MLB TEAM LOOKUP (USING ESPN IDs)
  // ---------------------------------------------------------------------
  // These will match the order of tabs
  const awayAbbr = awayTeam?.toUpperCase();
  const homeAbbr = homeTeam?.toUpperCase();

  // ---------------------------------------------------------------------
  // 🟩 Tab Order (Away → Home → All Remaining)
  // ---------------------------------------------------------------------
  const orderedTabs = useMemo(() => {
    if (!injuries || injuries.length === 0) return [];

    const allAbbrs = injuries.map((t) => t.team.abbreviation.toUpperCase());
    const tabs: string[] = [];

    if (awayAbbr && allAbbrs.includes(awayAbbr)) tabs.push(awayAbbr);
    if (homeAbbr && allAbbrs.includes(homeAbbr) && homeAbbr !== awayAbbr)
      tabs.push(homeAbbr);

    allAbbrs.forEach((a) => {
      if (!tabs.includes(a)) tabs.push(a);
    });

    return tabs;
  }, [injuries, awayAbbr, homeAbbr]);

  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    if (awayAbbr && orderedTabs.includes(awayAbbr)) return awayAbbr;
    if (homeAbbr && orderedTabs.includes(homeAbbr)) return homeAbbr;
    return orderedTabs[0] || "";
  });

  const selected = selectedTeam || orderedTabs[0];

  // ---------------------------------------------------------------------
  // 🛑 Loading / Error States
  // ---------------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading injuries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load injuries</Text>
      </View>
    );
  }

  if (!injuries || injuries.length === 0) return null;

  const teamData = injuries.find(
    (t) => t.team.abbreviation.toUpperCase() === selected
  );

  // ---------------------------------------------------------------------
  // 🟨 Render a Single Injury Item
  // ---------------------------------------------------------------------
  const renderInjury = ({
    item,
    index,
  }: {
    item: MLBInjury;
    index: number;
  }) => {
    const player = item.athlete;

    const avatarUrl = player.headshot?.href || DEFAULT_HEADSHOT;

    return (
      <View
        style={[
          styles.injuryItem,
          {
            borderBottomWidth:
              index === (teamData?.injuries.length ?? 0) - 1
                ? 0
                : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatarWrapper}
          resizeMode="cover"
        />

        <View style={{ flex: 1 }}>
          <View style={styles.infoSection}>
            <View style={styles.playerHeader}>
              <Text style={styles.name}>{player.displayName}</Text>
              <Text style={styles.jersey}>
                {player?.position?.abbreviation ?? "—"}{" "}
                {player?.jersey ? `#${player.jersey}` : ""}
              </Text>
            </View>

            {item.details?.type && (
              <>
                <Text style={styles.status}>{item.status}</Text>
                <Text style={styles.details}>
                  {item.details.type} — {item.details.location ?? "N/A"}
                </Text>
              </>
            )}
          </View>
        </View>

        {item.details?.returnDate && (
          <Text style={styles.status}>
            Return:{" "}
            {new Date(item.details.returnDate).toLocaleDateString("en-US")}
          </Text>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------
  // 🟥 Render Component
  // ---------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Injury Report</HeadingTwo>
 <View style={styles.wrapper}>
      {/* TAB BAR */}
      <FixedWidthTabBar
        tabs={orderedTabs}
        selected={selected}
        lighter={lighter}
        onTabPress={setSelectedTeam}
        renderLabel={(abbr, isSelected) => {
          const t = injuries.find(
            (team) => team.team.abbreviation.toUpperCase() === abbr
          );

          const team = getMLBTeamByEspnId(String(t?.team.id));
          const logo = team?.logoLight ?? team?.logo ?? null;

          const textColor = lighter
            ? Colors.white
            : isSelected
            ? isDark
              ? Colors.white
              : Colors.black
            : isDark
            ? Colors.midTone
            : Colors.midTone;

          return (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {logo && (
                <Image
                  source={logo}
                  style={{
                    width: 28,
                    height: 28,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                  resizeMode="contain"
                />
              )}
              <Text
                style={{
                  color: textColor,
                  opacity: isSelected ? 1 : 0.5,
                  fontFamily: Fonts.OSMEDIUM,
                }}
              >
                {abbr}
              </Text>
            </View>
          );
        }}
      />

      {/* INJURY LIST */}
      {teamData && teamData.injuries.length > 0 ? (
        <FlatList
          data={teamData.injuries}
          renderItem={renderInjury}
          keyExtractor={(inj) => inj.athlete.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <Text style={styles.errorText}>
          No injuries reported for this team.
        </Text>
      )}
      </View>
    </View>
  );
}
