import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import OfferList from "components/Sports/CFB/Recruiting/OfferLists";
import PredictionRing from "components/Sports/CFB/Recruiting/PredictionRing";
import RecruitHeader from "components/Sports/CFB/Recruiting/RecruitHeader";
import StarRating from "components/Sports/CFB/Recruiting/StarRating";
import { getTeamById } from "constants/teamsCFB";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useFootballRecruit } from "hooks/CFBHooks/useFootballRecruit";
import { FootballRecruit } from "hooks/CFBHooks/useFootballRecruits";
import { useLayoutEffect } from "react";
import { ScrollView, useColorScheme } from "react-native";

export default function RecruitDetailScreen(props: FootballRecruit) {
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  /* ---------------- Route params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  /** FETCH DATA */
  const { data: player, loading, error } = useFootballRecruit(playerId);

  // console.log(JSON.stringify(player, null, 2));
  const team = getTeamById(player?.committed_team_id);
  const predictedTeam = getTeamById(player?.predicted_team_id);
  const isTeamAvailable = !!team;
  const teamColor = team?.color;
  const teamPredictedColor = isDark
    ? team?.secondaryColor || predictedTeam?.secondaryColor
    : team?.color || predictedTeam?.color;
  const teamLogo = team?.logo;
  const teamLogoLight = team?.logoLight;

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    if (!player) return;

    const team = getTeamById(player.committed_team_id);
    const isTeamAvailable = !!team;

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={
            isTeamAvailable
              ? team?.logoLight || team?.logo
              : require("assets/College_Logos/NCAA.png")
          }
          teamColor={team?.color ?? "#1D428A"}
          onBack={() => router.back()}
          isTeamScreen={true}
          isPlayerScreen
        />
      ),
    });
  }, [navigation, isDark, player?.committed_team_id]);

  if (loading) return null;
  if (!player) return null;

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
