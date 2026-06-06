import { useCBBRecruit } from "@/hooks/BasketballHooks/useCBBRecruit";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PredictionRing from "components/League/Recruiting/CBB/PredictionRing";
import RecruitHeader from "components/League/Recruiting/CBB/RecruitHeader";
import OfferList from "components/League/Recruiting/CFB/OfferLists";
import StarRating from "components/League/Recruiting/CFB/StarRating";
import { globalStyles } from "constants/styles";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
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
  const { data: player, loading, error } = useCBBRecruit(playerId);
  const teamId = player?.committed_team_id ?? 0;
  const predictionPercentage = Number(
    player?.prediction_percentage?.replace("%", ""),
  );
  const team = getCBBTeam(teamId);
  const teamLogo = getCBBTeamLogo(teamId, true);

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => {
        if (loading) return null;

        return (
          <CustomHeaderTitle
            tabName="Athlete"
            logo={teamLogo}
            teamColor={team?.color ?? "#1D428A"}
            onBack={() => router.back()}
            isTeamScreen={!!team}
            teamCode={team?.code}
            isPlayerScreen
            league="CBB"
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
      <RecruitHeader player={player} isDark={isDark} />
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
          percentage={predictionPercentage}
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
