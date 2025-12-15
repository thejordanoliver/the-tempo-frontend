import { players } from "constants/nflPlayers";
import { getNFLTeamsLogo } from "constants/teamsNFL";
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
import HeadingTwo from "../../Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "../../TabBars/FixedWidthTabBar";

type Injury = {
  status: string;
  date: string;
  athlete: {
    id: string;
    displayName: string;
    position?: { displayName: string; abbreviation: string };
    headshot?: { href: string };
    jersey?: string;
  };
  details?: {
    type?: string;
    location?: string;
    returnDate?: string;
  };
};

type TeamInjuries = {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: Injury[];
};

type Props = {
  injuries: TeamInjuries[];
  loading: boolean;
  error: any;
  awayTeamAbbr?: string;
  homeTeamAbbr?: string;
  lighter?: boolean;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/36?text=👤";

export default function NFLInjuries({
  injuries,
  loading,
  error,
  awayTeamAbbr,
  homeTeamAbbr,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = teamInjuryStyles(isDark, lighter);

  const awayAbbr = awayTeamAbbr?.toUpperCase();
  const homeAbbr = homeTeamAbbr?.toUpperCase();

  const orderedTabs = useMemo(() => {
    // ALWAYS create 2 tabs
    const away =
      awayAbbr || injuries[0]?.team.abbreviation?.toUpperCase() || "AWY";

    const home =
      homeAbbr ||
      injuries[1]?.team.abbreviation?.toUpperCase() ||
      (away !== "HOM" ? "HOM" : "HOME");

    return [away, home];
  }, [awayAbbr, homeAbbr, injuries]);

  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    if (awayAbbr && orderedTabs.includes(awayAbbr)) return awayAbbr;
    if (homeAbbr && orderedTabs.includes(homeAbbr)) return homeAbbr;
    return orderedTabs[0] || "";
  });

  const selected = selectedTeam || orderedTabs[0];

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

  const renderInjury = ({ item, index }: { item: Injury; index: number }) => {
    const player = item.athlete;

    // ✅ Try to find player image from constants/nflPlayers by name (case-insensitive)
    const playerMatch = players.find(
      (p) =>
        p.name.trim().toLowerCase() === player.displayName.trim().toLowerCase()
    );

    const avatarUrl =
      playerMatch?.image || player.headshot?.href || DEFAULT_HEADSHOT;

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
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.infoSection}>
            <View style={styles.playerHeader}>
              <Text style={styles.name}>
                {player?.displayName ?? "Unknown Player"}
              </Text>
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
          <View style={styles.bottom}>
            <Text style={styles.status}>
              Return: {new Date(item.details.returnDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Injury Report</HeadingTwo>

      <FixedWidthTabBar
        tabs={orderedTabs}
        selected={selected}
        lighter={lighter}
        onTabPress={setSelectedTeam}
        renderLabel={(tab, isSelected) => {
          const useLightLogo = lighter || isDark;

          // ALWAYS USE TAB (ABBR), not the injuries array
          const logo = getNFLTeamsLogo(tab, useLightLogo);

          return (
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Image source={logo} style={styles.tabLogo} />

              <Text
                style={getLabelStyle(isDark, isSelected, lighter, {
                  opacity: isSelected ? 1 : 0.5,
                })}
              >
                {tab}
              </Text>
            </View>
          );
        }}
      />

      {teamData && teamData.injuries.length > 0 ? (
        <FlatList
          data={teamData.injuries}
          renderItem={renderInjury}
          keyExtractor={(inj) => inj.athlete.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <Text style={styles.errorText}>
          No injuries reported for this team.
        </Text>
      )}
    </View>
  );
}
