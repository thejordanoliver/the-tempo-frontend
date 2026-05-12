import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import OfferList from "components/Sports/CFB/Recruiting/OfferLists";
import PredictionRing from "components/Sports/CFB/Recruiting/PredictionRing";
import RecruitHeader from "components/Sports/CFB/Recruiting/RecruitHeader";
import StarRating from "components/Sports/CFB/Recruiting/StarRating";
import { globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useFootballRecruit } from "hooks/FootballHooks/useFootballRecruit";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";

export default function RecruitDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  /* ---------------- Route params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  /** FETCH DATA */
  const { data: player, loading, error } = useFootballRecruit(playerId);
  const teamId = player?.committed_team_id;
  const team = getCFBTeam(teamId);
  const teamLogo = getCFBTeamLogo(teamId, isDark);

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => {
        if (loading) return null;

        return (
          <CustomHeaderTitle
            logo={teamLogo}
            teamColor={team?.color ?? "#1D428A"}
            onBack={() => router.back()}
            isTeamScreen={!!team}
            teamCode={team?.code}
            isPlayerScreen
            league="CFB"
          />
        );
      },
    });
  }, [navigation, player?.committed_team_id, isDark, loading]);

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  if (error || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <RecruitHeader
        player={player}
        avatarUrl={player.image_url}
        isDark={isDark}
      />
      <StarRating recruit={player} isDark={isDark} />
      {player.predicted_school && (
        <PredictionRing
          prediction={player.predicted_school}
          predictedSchools={player.predicted_schools}
          teamId={
            player.committed_team_id ||
            player.predicted_team_id ||
            player.projected_team_id
          }
          percentage={Number(player.prediction_percentage.replace("%", ""))}
          delay={500}
          duration={1400}
          size={200}
          isDark={isDark}
        />
      )}
      <OfferList recruit={player} isDark={isDark} />
    </ScrollView>
  );
}
