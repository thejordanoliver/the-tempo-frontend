// components/CFBStandingsList.tsx
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "components/Dropdown";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo, getTeamByESPNId } from "constants/teamsCFB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { CFBTeamRank, useCFBRankings } from "hooks/CFBHooks/useCFBRankings";
import { useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";
export const CFBStandingsList = () => {
  const { rankings, loading, error, refresh } = useCFBRankings();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const router = useRouter();
  const styles = standingsStyles(isDark);
  const { isFavorite } = useFavoriteTeamsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [pollMode, setPollMode] = useState<"ap" | "coaches">("ap");
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };
  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  const selectedPoll = rankings.find((r) =>
    pollMode === "ap"
      ? r.shortName === "AP Poll"
      : r.shortName === "Coaches Poll",
  );

  const filteredRankings = selectedPoll?.ranks ?? [];
  const droppedOutTeams = selectedPoll?.droppedOut ?? [];

  // --- Render functions ---
  const renderLeftItem = ({
    item,
    index,
  }: {
    item: CFBTeamRank;
    index: number;
  }) => {
    const isLastRow = index === filteredRankings.length - 1;
    const team = getTeamByESPNId(item.team?.id ?? "");
    const teamId = team?.id ?? 0;
    const teamLogo = getCFBTeamLogo(teamId, isDark);
    const teamcode = team?.code || "N/A";
    const trendNum = Number(item.trend);
    const isUp = trendNum > 0;
    const favorited = team ? isFavorite("CFB", team.id) : false;

    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
          favorited && {
            backgroundColor: isDark
              ? Colors.dark.itemBackground
              : Colors.light.itemBackground,
          },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.current}</Text>
        </View>

        <View style={styles.teamInfo}>
          <TouchableOpacity
            onPress={() => {
              if (!teamId) return;
              router.push({
                pathname: "/team/cfb/[teamId]",
                params: { teamId },
              });
            }}
            style={styles.teamInfoWrapper}
          >
            {teamLogo && <Image source={teamLogo} style={styles.logo} />}
            <Text style={styles.collegeTeamName}>{teamcode}</Text>
          </TouchableOpacity>

          {trendNum !== 0 && !isNaN(trendNum) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={isUp ? "arrow-up" : "arrow-down"}
                size={10}
                color={
                  isUp
                    ? isDark
                      ? Colors.dark.leafGreen
                      : Colors.light.green // correct branch
                    : isDark
                      ? Colors.dark.lightRed
                      : Colors.light.red
                }
                style={{ marginRight: 2 }}
              />

              <Text
                style={[
                  styles.collegeTeamTrend,
                  {
                    color: isUp
                      ? isDark
                        ? Colors.dark.leafGreen
                        : Colors.light.green // correct branch
                      : isDark
                        ? Colors.dark.lightRed
                        : Colors.light.red,
                  },
                ]}
              >
                {Math.abs(trendNum)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRightItem = ({
    item,
    index,
  }: {
    item: CFBTeamRank;
    index: number;
  }) => {
    const isLastRow = index === filteredRankings.length - 1;
    const team = getTeamByESPNId(item.team?.id ?? "");
    const favorited = team ? isFavorite("CFB", team.id) : false;
    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
          favorited && {
            backgroundColor: isDark
              ? Colors.dark.itemBackground
              : Colors.light.itemBackground,
          },
        ]}
      >
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.recordSummary || "N/A"}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.points ?? 0}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.firstPlaceVotes ?? 0}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>
            {item.team?.groups?.shortName || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View
      style={[
        styles.row,
        {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          alignItems: "center",
        },
      ]}
    >
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { fontFamily: Fonts.OSSEMIBOLD }]}>
          #
        </Text>
      </View>
      <Text style={[styles.teamHeaderText]}>Team</Text>
    </View>
  );

  const renderStatsHeader = () => (
    <View
      style={[
        styles.row,
        {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
        },
      ]}
    >
      {["Record", "Points", "1st Votes", "Conference"].map((label) => (
        <View key={label} style={styles.statCell}>
          <Text
            style={[
              styles.statText,
              {
                fontFamily: Fonts.OSSEMIBOLD,
                color: isDark ? Colors.white : Colors.black,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderDroppedOut = () => {
    if (!droppedOutTeams.length) return null;

    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.droppedHeading}>Dropped From Rankings</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {droppedOutTeams.map((item) => {
            const team = getTeamByESPNId(item.team?.id ?? "");
            const teamName = team?.shortName || team?.name || "N/A";
            return (
              <Text
                key={item.team?.id || `dropped-${item.previous}-${item.date}`}
                style={{
                  color: isDark ? Colors.white : Colors.black,
                  fontFamily: Fonts.OSLIGHT,
                  fontSize: 16,
                  marginVertical: 2,
                  marginRight: 8,
                }}
              >
                {teamName} ({item.previous})
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  function Section({ title, data }: { title: string; data: CFBTeamRank[] }) {
    return (
      <>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Text style={styles.heading}>{title}</Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            <FlatList
              data={data}
              keyExtractor={(item, index) =>
                item.team?.id
                  ? String(item.team.id)
                  : `fallback-${index}-${item.date}`
              }
              renderItem={renderLeftItem}
              scrollEnabled={false}
              ListHeaderComponent={renderHeader}
              stickyHeaderIndices={[0]}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ width: 220 }}
            >
              <FlatList
                data={data}
                keyExtractor={(item, index) =>
                  item.team?.id
                    ? String(item.team.id)
                    : `fallback-${index}-${item.date}`
                }
                renderItem={renderRightItem}
                scrollEnabled={false}
                ListHeaderComponent={renderStatsHeader}
                stickyHeaderIndices={[0]}
              />
            </ScrollView>
          </View>
        </View>
      </>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.dropdownRow}>
        <Dropdown
          options={[
            { label: "AP Poll", value: "ap" },
            { label: "Coaches Poll", value: "coaches" },
            { label: "CFP Rankings", value: "cfp" }, // 🏆 Added CFP
          ]}
          selectedValue={pollMode}
          onSelect={(value) => setPollMode(value as "ap" | "coaches")}
          isDark={isDark}
        />
      </View>
      {/* --- Rankings Section --- */}
      <Section
        title={pollMode === "ap" ? "AP Poll" : "Coaches Poll"}
        data={filteredRankings}
      />

      {renderDroppedOut()}
    </ScrollView>
  );
};
