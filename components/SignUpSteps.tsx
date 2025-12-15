// components/SignupSteps.tsx
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { Colors } from "constants/Colors";
import { teams } from "constants/teams";
import {
  conferenceListMap as cbbConferenceListMap,
  teams as cbbTeams,
} from "constants/teamsCBB";
import { teams as cfbteams, conferenceListMap } from "constants/teamsCFB";
import { teams as mlbteams } from "constants/teamsMLB";
import { teams as nflteams } from "constants/teamsNFL";
import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { getSignupStepsStyles } from "styles/signupStepStyles";
import type { LeagueType, Team, LeagueTeam } from "types/types";
import SearchBar from "./SearchBars/SearchBar";
type SignupData = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  favorites: string[];
  profileImage: string | null;
  bannerImage: string | null;
};

export type SignupStepsProps = {
  signupData: SignupData;
  signupStep: number;
  onChangeSignupData: (data: Partial<SignupData>) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onToggleFavorite: (league: LeagueType, id: string) => void; // ✅ updated
  onOpenImagePickerFor: (target: "profile" | "banner") => void;
  toggleLayout: () => void;
  isGridView: boolean;
  fadeAnim: any;
};

export default function SignupSteps({
  signupStep,
  signupData,
  onChangeSignupData,
  onNextStep,
  onPreviousStep,
  onToggleFavorite,
  onOpenImagePickerFor,
  isGridView,
  fadeAnim,
  toggleLayout,
}: SignupStepsProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getSignupStepsStyles(isDark);
  const { width: screenWidth } = useWindowDimensions();

  const numColumns = 3;
  const containerPadding = 40;
  const columnGap = 12;
  const totalSpacing = columnGap * (numColumns - 1);
  const itemWidth =
    (screenWidth - containerPadding - totalSpacing) / numColumns;

  const [search, setSearch] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        translateX.value = withTiming(0);
        runOnJS(onPreviousStep)();
      } else if (event.translationX < -100) {
        translateX.value = withTiming(0);
        runOnJS(onNextStep)();
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  function normalizeTeam(raw: any, league: LeagueType) {
  return {
    league,
    id: raw.id?.toString() ?? "",
    name: raw.name ?? raw.fullName ?? "",
    fullName: raw.fullName ?? raw.name ?? "",
    logo: raw.logo ?? null,
    logoLight: raw.logoLight ?? raw.logo ?? null,
    color: raw.color ?? "#999",
    secondaryColor: raw.secondaryColor ?? raw.color ?? "#777",
    firstSeason: raw.firstSeason?.toString() ?? "",
    displayName: raw.displayName ?? raw.fullName ?? raw.name ?? "",
    // anything else your LeagueTeam requires
  } satisfies LeagueTeam;
}


const allTeamsRaw = [
  ...teams.map((t) => normalizeTeam(t, "NBA")),
  ...nflteams.map((t) => normalizeTeam(t, "NFL")),
  ...mlbteams.map((t) => normalizeTeam(t, "MLB")),

  ...cfbteams
    .filter((t) => {
      const fbsTeamNames = Object.values(conferenceListMap)
        .flat()
        .map((n) => n.toLowerCase());
      const name = (t.fullName || t.name || "").toLowerCase();
      return fbsTeamNames.some(
        (n) => n.includes(name) || name.includes(n)
      );
    })
    .map((t) => normalizeTeam(t, "CFB")),

  ...cbbTeams
    .filter((t) => {
      const cbbTeamNames = Object.values(cbbConferenceListMap)
        .flat()
        .map((n) => n.toLowerCase());
      const name = (t.fullName || t.name || "").toLowerCase();
      return cbbTeamNames.some(
        (n) => n.includes(name) || name.includes(n)
      );
    })
    .map((t) => normalizeTeam(t, "CBB")),
];


// REMOVE DUPLICATES
const uniqueTeams = Array.from(
  new Map(
    allTeamsRaw.map((t) => [`${t.league}-${t.id}`, t])
  ).values()
);


  switch (signupStep) {
    case 0:
      return (
        <GestureDetector gesture={pan}>
          <Reanimated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Name"
                  value={signupData.fullName}
                  onChangeText={(val) => onChangeSignupData({ fullName: val })}
                  style={styles.input}
                  placeholderTextColor={Colors.midTone}
                />
                <TextInput
                  placeholder="Username"
                  value={signupData.username}
                  onChangeText={(val) =>
                    onChangeSignupData({ username: val.toLowerCase() })
                  }
                  style={styles.input}
                  placeholderTextColor={Colors.midTone}
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Email"
                  keyboardType="email-address"
                  value={signupData.email}
                  onChangeText={(val) => onChangeSignupData({ email: val })}
                  style={styles.input}
                  placeholderTextColor={Colors.midTone}
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  value={signupData.password}
                  onChangeText={(val) => onChangeSignupData({ password: val })}
                  style={styles.input}
                  placeholderTextColor={Colors.midTone}
                />
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={signupData.confirmPassword}
                  onChangeText={(val) =>
                    onChangeSignupData({ confirmPassword: val })
                  }
                  style={styles.input}
                  placeholderTextColor={Colors.midTone}
                />
              </View>
            </ScrollView>
          </Reanimated.View>
        </GestureDetector>
      );

    case 1:
      return (
        <View style={{ flex: 1 }}>
          {/* <View style={styles.titleRow}>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onNextStep}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View> */}
          <SearchBar
            placeholder="Search teams..."
            value={search}
            onChangeText={setSearch}
          />
          <FavoriteTeamsSelector
      teams={uniqueTeams.sort((a, b) => a.name.localeCompare(b.fullName ?? ""))}

            favorites={signupData.favorites}
            toggleFavorite={(league: LeagueType, id: string) =>
              onToggleFavorite(league, id)
            }
            isGridView={isGridView}
            fadeAnim={fadeAnim}
            search={search}
            itemWidth={itemWidth}
          />
        </View>
      );

    case 2:
      return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text
            style={[styles.reviewText, { textAlign: "center", marginTop: 24 }]}
          >
            Banner Image
          </Text>
          <Pressable
            onPress={() => onOpenImagePickerFor("banner")}
            style={[styles.imageUploadBox, { height: 100 }]}
          >
            {signupData.bannerImage ? (
              <Image
                source={{ uri: signupData.bannerImage }}
                style={{ width: "100%", height: "100%", borderRadius: 10 }}
              />
            ) : (
              <Text style={styles.imagePlaceholder}>
                Tap to select banner image
              </Text>
            )}
          </Pressable>
          <Text style={[styles.reviewText, { textAlign: "center" }]}>
            Profile Picture
          </Text>
          <Pressable
            onPress={() => onOpenImagePickerFor("profile")}
            style={styles.profileImageUploadBox}
          >
            {signupData.profileImage ? (
              <Image
                source={{ uri: signupData.profileImage }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.imagePlaceholder}>
                Tap to select profile image
              </Text>
            )}
          </Pressable>
        </ScrollView>
      );

    case 3:
      return (
        <ScrollView>
          <View style={styles.reviewContainer}>
            <Text
              style={[
                styles.reviewText,
                { textAlign: "center", marginTop: 24 },
              ]}
            >
              Banner Image
            </Text>
            <View style={[styles.imageUploadBox]}>
              {signupData.bannerImage && (
                <Image
                  source={{ uri: signupData.bannerImage }}
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                />
              )}
            </View>
            <Text style={[styles.reviewText, { textAlign: "center" }]}>
              Profile Picture
            </Text>
            <View style={[styles.profileImageUploadBox]}>
              {signupData.profileImage && (
                <Image
                  source={{ uri: signupData.profileImage }}
                  style={styles.imagePreview}
                />
              )}
            </View>
            <Text style={styles.heading}>Name</Text>
            <View style={styles.reviewInput}>
              <Text style={styles.reviewText}>{signupData.fullName}</Text>
            </View>
            <Text style={styles.heading}>Username</Text>
            <View style={styles.reviewInput}>
              <Text style={styles.reviewText}>{signupData.username}</Text>
            </View>
            <Text style={styles.heading}>Email</Text>
            <View style={styles.reviewInput}>
              <Text style={styles.reviewText}>{signupData.email}</Text>
            </View>
            <Text style={styles.heading}>Password</Text>
            <View style={styles.reviewInput}>
              <Text style={styles.reviewText}>
                {signupData.password.replace(/./g, "*")}
              </Text>
            </View>

            <Text style={[styles.heading, { marginTop: 16 }]}>Favorites</Text>
            {signupData.favorites.length > 0 ? (
              <ScrollView horizontal={false} style={styles.favoritesScroll}>
                {signupData.favorites.map((favId) => {
                  const team = teams.find((t) => t.id === favId);
                  if (!team) return null;
                  return (
                    <View
                      key={team.id}
                      style={[
                        styles.teamCardList,
                        { backgroundColor: team.color || "#007AFF" },
                      ]}
                    >
                      <Image
                        source={team.logoLight ? team.logoLight : team.logo}
                        style={styles.logo}
                      />
                      <Text style={[styles.teamName, { color: Colors.white }]}>
                        {team.fullName}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.reviewText}>None</Text>
            )}
          </View>
        </ScrollView>
      );

    default:
      return null;
  }
}
