import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import OfferList from "components/League/Recruiting/CFB/OfferLists";
import PredictionRing from "components/League/Recruiting/CFB/PredictionRing";
import RecruitHeader from "components/League/Recruiting/CFB/RecruitHeader";
import StarRating from "components/League/Recruiting/CFB/StarRating";
import { globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCFBRecruit } from "hooks/FootballHooks/useCFBRecruit";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

export default function RecruitDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);

  const { id } = useLocalSearchParams<{ id: string }>();
  const recruitId = Number(id);

  const {
    data: player,
    loading,
    error,
  } = useCFBRecruit(recruitId);

  const displayTeamId = useMemo(() => {
    if (!player) {
      return null;
    }

    return (
      player.committed_team_id ??
      player.predicted_team_id ??
      null
    );
  }, [player]);

  const team = useMemo(
    () => (displayTeamId ? getCFBTeam(displayTeamId) : undefined),
    [displayTeamId],
  );

  const teamLogo = useMemo(
    () =>
      displayTeamId
        ? getCFBTeamLogo(displayTeamId, isDark)
        : undefined,
    [displayTeamId, isDark],
  );

  const predictionPercentage = useMemo(() => {
    const rawPercentage = player?.prediction_percentage;

    if (!rawPercentage) {
      return 0;
    }

    const parsedPercentage = Number(
      rawPercentage.replaceAll("%", "").trim(),
    );

    return Number.isFinite(parsedPercentage)
      ? parsedPercentage
      : 0;
  }, [player?.prediction_percentage]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => {
        if (loading || !player) {
          return null;
        }

        return (
          <CustomHeaderTitle
            logo={teamLogo}
            teamColor={team?.color ?? "#1D428A"}
            onBack={() => router.back()}
            isTeamScreen={Boolean(team)}
            teamCode={team?.code}
            isPlayerScreen
            league="CFB"
          />
        );
      },
    });
  }, [
    loading,
    navigation,
    player,
    router,
    team,
    teamLogo,
  ]);

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {error ?? "Recruit not found"}
        </Text>
      </View>
    );
  }

  const predictionTeamName =
    player.predicted_team_name ??
    player.predicted_schools?.[0]?.team_name ??
    null;

  const predictionTeamId =
    player.predicted_team_id ??
    player.predicted_schools?.[0]?.team_id ??
    player.committed_team_id ??
    null;

  const shouldShowPrediction =
    player.has_prediction &&
    Boolean(predictionTeamName) &&
    Boolean(predictionTeamId);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 100,
      }}
    >
      <RecruitHeader
        player={player}
        isDark={isDark}
      />

      <StarRating
        recruit={player}
        isDark={isDark}
      />

      {shouldShowPrediction && predictionTeamId && (
        <PredictionRing
          prediction={predictionTeamName}
          predictedSchools={player.predicted_schools}
          teamId={predictionTeamId}
          percentage={predictionPercentage}
          delay={500}
          duration={1400}
          size={200}
          isDark={isDark}
        />
      )}

      <OfferList
        recruit={player}
        isDark={isDark}
      />
    </ScrollView>
  );
}