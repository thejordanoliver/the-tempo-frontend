// components/CBBStandingsList.tsx
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "components/Dropdown";
import { StandingsSkeleton } from "components/Standings/StandingsSkeleton";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogoESPN } from "constants/teamsCBB";
import { CBBTeamRank, useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { getStyles } from "styles/Standings.styles";
export const CBBStandingsList = () => {
  const { rankings = [], loading, error } = useCBBRankings();
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const [pollMode, setPollMode] = useState<"ap" | "coaches">("ap");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const onSelectPollMode = (mode: "ap" | "coaches") => {
    setPollMode(mode);
    toggleDropdown();
  };

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  const selectedPoll = rankings.find((r) =>
    pollMode === "ap"
      ? r.shortName === "AP Poll"
      : r.shortName === "Coaches Poll"
  );

  const filteredRankings = selectedPoll?.ranks ?? [];
  const droppedOutTeams = selectedPoll?.droppedOut ?? [];

  // --- Render functions ---
  const renderLeftItem = ({
    item,
    index,
  }: {
    item: CBBTeamRank;
    index: number;
  }) => {
    const teamLogo = item.team
      ? getTeamLogoESPN(item.team.id, isDark)
      : undefined;

    const trendNum = Number(item.trend);
    const isUp = trendNum > 0;
    const isDown = trendNum < 0;

    return (
      <View
        style={[
          styles.row,
          { borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.current}</Text>
        </View>

        <View style={styles.teamInfo}>
          {teamLogo && <Image source={teamLogo} style={styles.logo} />}
          <Text style={styles.collegeTeamName}>
            {item.team?.abbreviation || item.team?.nickname || "N/A"}
          </Text>

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
                      ? Colors.dark.limeGreen
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
                        ? Colors.dark.limeGreen
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

  const renderRightItem = ({ item }: { item: CBBTeamRank }) => (
    <View style={styles.row}>
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
        <View
          style={[
            styles.header,
            { borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray },
          ]}
        >
          <Text
            style={[
              styles.heading,
              {
                color: isDark ? Colors.white : Colors.black,
                fontSize: 20,
                fontFamily: Fonts.OSSEMIBOLD,
              },
            ]}
          >
            Dropped From Rankings
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {droppedOutTeams.map((item) => (
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
              {item.team?.nickname || "Unknown"} ({item.previous})
            </Text>
          ))}
        </View>
      </View>
    );
  };

  function Section({ title, data }: { title: string; data: CBBTeamRank[] }) {
    return (
      <View style={{ marginTop: 24 }}>
        <View
          style={[
            styles.header,
            { borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray },
          ]}
        >
          <Text
            style={[
              styles.heading,
              {
                color: isDark ? Colors.white : Colors.black,
                fontSize: 20,
                fontFamily: Fonts.OSSEMIBOLD,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={data}
            keyExtractor={(item) =>
              item.team?.id || `dropped-${item.current}-${item.date}`
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
              keyExtractor={(item) =>
                item.team?.id || `dropped-${item.current}-${item.date}`
              }
              renderItem={renderRightItem}
              scrollEnabled={false}
              ListHeaderComponent={renderStatsHeader}
              stickyHeaderIndices={[0]}
            />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{}}
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
    >
      {/* --- Dropdown Header --- */}
      <Dropdown
        options={[
          { label: "AP Poll", value: "ap" },
          { label: "Coaches Poll", value: "coaches" },
        ]}
        selectedValue={pollMode}
        onSelect={(value) => setPollMode(value as "ap" | "coaches")}
        isDark={isDark}
        absolute
      />

      {/* --- Rankings Section --- */}
      <Section
        title={pollMode === "ap" ? "AP Poll" : "Coaches Poll"}
        data={filteredRankings}
      />

      {renderDroppedOut()}
    </ScrollView>
  );
};
