import { getNFLTeamsLogo } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";
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
import FixedWidthTabBar, {
  getLabelStyle,
} from "../../../TabBars/FixedWidthTabBar";

type Injury = {
  espnId: number | null;
  name: string;
  position?: string | null;
  jerseyNumber?: number | null;
  image?: string | null;
  status?: string | null;
  detail?: string | null;
  returnDate?: string | null;
  teamId?: number | null;
  location: string;
};

type Props = {
  injuries?: Injury[]; // ✅ optional now
  loading: boolean;
  error: any;
  awayTeamId?: string | number;
  homeTeamId?: string | number;
  awayTeamAbbr?: string;
  homeTeamAbbr?: string;
  lighter?: boolean;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/36?text=👤";

export default function NFLInjuries({
  injuries = [], // ✅ DEFAULT FIX
  loading,
  error,
  awayTeamId,
  homeTeamId,
  awayTeamAbbr,
  homeTeamAbbr,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = teamInjuryStyles(isDark, lighter);

  /* -------------------------------------------------- */
  /* Group injuries by teamId                           */
  /* -------------------------------------------------- */

  const grouped = useMemo(() => {
    const list = Array.isArray(injuries) ? injuries : [];

    const away = list.filter((i) => String(i.teamId) === String(awayTeamId));

    const home = list.filter((i) => String(i.teamId) === String(homeTeamId));

    // 🔥 fallback: if teamIds are missing, split evenly
    if (!away.length && !home.length && list.length) {
      return {
        away: list.slice(0, Math.ceil(list.length / 2)),
        home: list.slice(Math.ceil(list.length / 2)),
      };
    }

    return { away, home };
  }, [injuries, awayTeamId, homeTeamId]);

  const tabs = useMemo(() => {
    return [
      awayTeamAbbr?.toUpperCase() ?? "AWAY",
      homeTeamAbbr?.toUpperCase() ?? "HOME",
    ];
  }, [awayTeamAbbr, homeTeamAbbr]);

  const [selected, setSelected] = useState(tabs[0]);

  useEffect(() => {
    if (tabs[0] !== selected) {
      setSelected(tabs[0]);
    }
  }, [tabs.join("|")]);

  const selectedInjuries = useMemo(() => {
    return selected === tabs[0] ? grouped.away : grouped.home;
  }, [grouped, selected, tabs]);

  /* -------------------------------------------------- */
  /* States                                             */
  /* -------------------------------------------------- */

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

  if (!injuries.length) return null;

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */

  const renderInjury = ({ item, index }: { item: Injury; index: number }) => {
    const avatar = item.image || DEFAULT_HEADSHOT;

    return (
      <View
        style={[
          styles.injuryItem,
          {
            borderBottomWidth:
              index === selectedInjuries.length - 1
                ? 0
                : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.infoSection}>
            <View style={styles.playerHeader}>
              <Text style={styles.name}>{item.name ?? "Unknown Player"}</Text>
              <Text style={styles.jersey}>
                {item.position ?? "—"}{" "}
                {item.jerseyNumber ? `#${item.jerseyNumber}` : ""}
              </Text>
            </View>

            {item.detail && (
              <>
                <Text style={styles.status}>{item.status}</Text>
                <Text style={styles.details}>
                  {item.detail} — {item.location ?? "N/A"}
                </Text>
              </>
            )}
          </View>
        </View>

        {item.returnDate && (
          <View style={styles.bottom}>
            <Text style={styles.status}>
              Return: {new Date(item.returnDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Injury Report</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          selected={selected}
          lighter={lighter}
          onTabPress={setSelected}
          renderLabel={(tab, isSelected) => {
            const selectedTeamId = useMemo(() => {
              return selected === tabs[0] ? awayTeamId : homeTeamId;
            }, [selected, tabs, awayTeamId, homeTeamId]);

            const logo = selectedTeamId
              ? getNFLTeamsLogo(Number(selectedTeamId), lighter || isDark)
              : null;
            return (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Image source={logo} style={styles.tabLogo} />
                <Text style={getLabelStyle(isDark, isSelected, lighter)}>
                  {tab}
                </Text>
              </View>
            );
          }}
        />

        {selectedInjuries.length > 0 ? (
          <FlatList
            data={selectedInjuries}
            renderItem={renderInjury}
            keyExtractor={(i, idx) => `${i.espnId ?? idx}`}
            scrollEnabled={false}
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
