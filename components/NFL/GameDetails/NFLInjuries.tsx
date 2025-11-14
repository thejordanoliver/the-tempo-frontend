import { Fonts } from "constants/fonts";
import { players } from "constants/nflPlayers";
import { getNFLTeamsLogo } from "constants/teamsNFL";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { styles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import HeadingTwo from "../../Headings/HeadingTwo";
import FixedWidthTabBar from "../TabBars/FixedWidthTabBar";

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
  const getStyles = styles(isDark, lighter);

  const awayAbbr = awayTeamAbbr?.toUpperCase();
  const homeAbbr = homeTeamAbbr?.toUpperCase();

  const orderedTabs = useMemo(() => {
    if (!injuries || injuries.length === 0) return [];
    const allAbbrs = injuries.map((t) => t.team.abbreviation.toUpperCase());
    const tabs: string[] = [];

    if (awayAbbr && allAbbrs.includes(awayAbbr)) tabs.push(awayAbbr);
    if (homeAbbr && allAbbrs.includes(homeAbbr) && homeAbbr !== awayAbbr)
      tabs.push(homeAbbr);
    allAbbrs.forEach((abbr) => {
      if (!tabs.includes(abbr)) tabs.push(abbr);
    });
    return tabs;
  }, [injuries, awayAbbr, homeAbbr]);

  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    if (awayAbbr && orderedTabs.includes(awayAbbr)) return awayAbbr;
    if (homeAbbr && orderedTabs.includes(homeAbbr)) return homeAbbr;
    return orderedTabs[0] || "";
  });

  const selected = selectedTeam || orderedTabs[0];

  if (loading) {
    return (
      <View style={getStyles.container}>
        <ActivityIndicator size="small" />
        <Text style={getStyles.loadingText}>Loading injuries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={getStyles.container}>
        <Text style={getStyles.errorText}>Failed to load injuries</Text>
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
          getStyles.injuryItem,
          {
            borderBottomWidth:
              index === (teamData?.injuries.length ?? 0) - 1 ? 0 : 1,
          },
        ]}
      >
        <View style={getStyles.avatarWrapper}>
          <Image
            source={{ uri: avatarUrl }}
            style={getStyles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={getStyles.infoSection}>
            <View style={getStyles.playerHeader}>
              <Text style={getStyles.name}>
                {player?.displayName ?? "Unknown Player"}
              </Text>
              <Text style={getStyles.jersey}>
                {player?.position?.abbreviation ?? "—"}{" "}
                {player?.jersey ? `#${player.jersey}` : ""}
              </Text>
            </View>
            {item.details?.type && (
              <>
                <Text style={getStyles.status}>{item.status}</Text>
                <Text style={getStyles.details}>
                  {item.details.type} — {item.details.location ?? "N/A"}
                </Text>
              </>
            )}
          </View>
        </View>
        {item.details?.returnDate && (
          <View style={getStyles.bottom}>
            <Text style={getStyles.status}>
              Return: {new Date(item.details.returnDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={getStyles.container}>
      <HeadingTwo lighter={lighter}>Injury Report</HeadingTwo>

      <FixedWidthTabBar
        tabs={orderedTabs}
        selected={selected}
        lighter={lighter}
        onTabPress={setSelectedTeam}
        renderLabel={(tab, isSelected) => {
          const team = injuries.find(
            (t) => t.team.abbreviation.toUpperCase() === tab
          );

          const useLightLogo = lighter || isDark;
          const logo = getNFLTeamsLogo(team?.team.abbreviation, useLightLogo);
          const textColor = lighter
            ? "#fff"
            : isSelected
            ? isDark
              ? "#fff"
              : "#1d1d1d"
            : isDark
            ? "#888"
            : "rgba(0,0,0,0.5)";

          return (
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Image
                source={logo}
                style={[
                  { width: 28, height: 28, opacity: isSelected ? 1 : 0.5 },
                ]}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: textColor,
                  fontFamily: Fonts.OSMEDIUM,
                  opacity: isSelected ? 1 : 0.5,
                }}
              >
                {team?.team.abbreviation ?? tab}
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
          ItemSeparatorComponent={() => <View style={getStyles.separator} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <Text style={getStyles.errorText}>
          No injuries reported for this team.
        </Text>
      )}
    </View>
  );
}
