import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import { globalStyles } from "constants/styles";
import { getNHLTeamByEspnId, getNHLTeamLogo } from "constants/teamsNHL";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import HeadingTwo from "../../../Headings/HeadingTwo";
import FixedWidthTabBar from "../../../TabBars/FixedWidthTabBar";

export interface Injury {
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

export interface TeamInjuries {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: Injury[];
}

type Props = {
  injuries: TeamInjuries[];
  loading: boolean;
  error: any;
  awayTeamId?: string;
  homeTeamId?: string;
  isDark: boolean;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/36?text=👤";

export default function NHLInjuries({
  injuries,
  loading,
  error,
  awayTeamId,
  homeTeamId,
  isDark,
}: Props) {
  const styles = teamInjuryStyles(isDark);
  const global = globalStyles(isDark);

  // Away is always left (index 0), home always right (index 1).
  // Mirror the TeamInjuries pattern: reorder by known away/home IDs upfront.
  const reorderedInjuries = (() => {
    if (!injuries?.length) return [];
    const away = injuries.find((t) => t.team.id === awayTeamId);
    const home = injuries.find((t) => t.team.id === homeTeamId);
    const rest = injuries.filter(
      (t) => t.team.id !== awayTeamId && t.team.id !== homeTeamId,
    );
    return [...(away ? [away] : []), ...(home ? [home] : []), ...rest];
  })();

  const tabs = reorderedInjuries.map((t) => t.team.id);

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // Select the first tab (away) whenever tabs change.
  useEffect(() => {
    if (tabs.length) setSelectedTeamId(tabs[0]);
  }, [awayTeamId, homeTeamId]);

  const currentTeam = reorderedInjuries.find(
    (t) => t.team.id === selectedTeamId,
  );

  // ------------------------------------------------------------------
  // Loading / Error / Empty
  // ------------------------------------------------------------------
  if (loading) return <TeamInjuriesSkeleton />;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load injuries</Text>
      </View>
    );
  }

  if (!injuries?.length || !currentTeam) return null;

  // ------------------------------------------------------------------
  // Render injury row
  // ------------------------------------------------------------------
  const renderInjury = ({ item, index }: { item: Injury; index: number }) => {
    const player = item.athlete;
    const avatarUrl = player.headshot?.href || DEFAULT_HEADSHOT;

    return (
      <View
        style={[
          styles.injuryItem,
          {
            borderBottomWidth:
              index === (currentTeam.injuries.length ?? 0) - 1
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
              <Text style={styles.name}>{player.shortName}</Text>
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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Injury Report</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          selected={selectedTeamId}
          isDark={isDark}
          onTabPress={setSelectedTeamId}
          renderLabel={(teamId, isSelected, tabStyles) => {
            const team = getNHLTeamByEspnId(teamId);
            const logo = getNHLTeamLogo(Number(team?.id), isDark);

            return (
              <View style={styles.tabLabel}>
                {logo && (
                  <Image
                    source={logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}
                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {team?.code}
                </Text>
              </View>
            );
          }}
        />

        {currentTeam.injuries.length > 0 ? (
          <FlatList
            data={currentTeam.injuries}
            renderItem={renderInjury}
            keyExtractor={(inj) => inj.athlete.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        ) : (
          <Text style={global.emptyText}>
            No injuries reported for this team.
          </Text>
        )}
      </View>
    </View>
  );
}
