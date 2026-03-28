// components/SignupSteps.tsx
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { Colors } from "constants/Styles";
import { teams } from "constants/teams";
import {
  conferenceListMap as cbbConferenceListMap,
  cbbTeams,
} from "constants/teamsCBB";
import { cfbTeams, conferenceListMap } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nhlTeams } from "constants/teamsNHL";
import { useEffect, useRef, useState } from "react";

import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

import { formStyles } from "styles/FormStyles";
import type { LeagueTeam, LeagueType } from "types/types";
import SearchBar from "./SearchBars/SearchBar";
import { nflTeams } from "constants/teamsNFL";

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
  onToggleFavorite: (league: LeagueType, id: string) => void;
  onOpenImagePickerFor: (target: "profile" | "banner") => void;
  toggleLayout: () => void;
  isGridView: boolean;
  fadeAnim: any;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
};

export default function SignUpForm({
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
  isSubmitting,
  onSubmit,
}: SignupStepsProps) {
  const isDark = useColorScheme() === "dark";
  const styles = formStyles(isDark);

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: signupStep / 4,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [signupStep]);

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const { width: screenWidth } = useWindowDimensions();

  const numColumns = 3;
  const containerPadding = 40;
  const columnGap = 12;
  const totalSpacing = columnGap * (numColumns - 1);
  const itemWidth =
    (screenWidth - containerPadding - totalSpacing) / numColumns;

  const [search, setSearch] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  function normalizeTeam(raw: any, league: LeagueType) {
    const team: LeagueTeam = {
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
      isAllStar: raw.isAllStar ?? false,
    };

    // Skip All-Star teams entirely
    if (team.isAllStar) return null;
    return team;
  }

  // Then map and filter nulls:
  const allTeamsRaw = [
    ...teams.map((t) => normalizeTeam(t, "NBA")).filter(Boolean),
    ...nflTeams.map((t) => normalizeTeam(t, "NFL")).filter(Boolean),
    ...nhlTeams.map((t) => normalizeTeam(t, "NHL")).filter(Boolean),
    ...mlbTeams.map((t) => normalizeTeam(t, "MLB")).filter(Boolean),
    ...cfbTeams
      .filter((t) => {
        const fbsTeamNames = Object.values(conferenceListMap)
          .flat()
          .map((n) => n.toLowerCase());
        const name = (t.fullName || t.name || "").toLowerCase();
        return fbsTeamNames.some((n) => n.includes(name) || name.includes(n));
      })
      .map((t) => normalizeTeam(t, "CFB"))
      .filter(Boolean),
    ...cbbTeams
      .filter((t) => {
        const cbbTeamNames = Object.values(cbbConferenceListMap)
          .flat()
          .map((n) => n.toLowerCase());
        const name = (t.fullName || t.name || "").toLowerCase();
        return cbbTeamNames.some((n) => n.includes(name) || name.includes(n));
      })
      .map((t) => normalizeTeam(t, "CBB"))
      .filter(Boolean),
  ];

  // After creating allTeamsRaw
  const uniqueTeams = Array.from(
    new Map(
      allTeamsRaw
        .filter((t): t is LeagueTeam => t !== null) // <-- type guard to remove nulls
        .map((t) => [`${t.league}-${t.id}`, t]),
    ).values(),
  );

  return (
    <View style={{ flex: 1 }}>
      {/* STEP CONTENT */}
      <View style={styles.formContainer}>
        {(() => {
          switch (signupStep) {
            // Step 0: Name & Username
            case 0:
              return (
                <View style={styles.formWrapper}>
                  <TextInput
                    placeholder="Name"
                    value={signupData.fullName}
                    onChangeText={(val) =>
                      onChangeSignupData({ fullName: val })
                    }
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
                </View>
              );

            // Step 1: Email & Password
            case 1:
              return (
                <View style={styles.formWrapper}>
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
                    onChangeText={(val) =>
                      onChangeSignupData({ password: val })
                    }
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
              );

            // Step 2: Favorite Teams
            case 2:
              return (
                <View style={{ flex: 1 }}>
                  <SearchBar
                    placeholder="Search teams..."
                    value={search}
                    onChangeText={setSearch}
                  />
                  <FavoriteTeamsSelector
                    teams={uniqueTeams.sort((a, b) =>
                      a.name.localeCompare(b?.fullName ?? ""),
                    )}
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

            // Step 3: Banner & Profile Images
            case 3:
              return (
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                  <Text
                    style={[
                      styles.reviewText,
                      { textAlign: "center", marginTop: 24 },
                    ]}
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
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 10,
                        }}
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

            // Step 4: Review
            case 4:
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
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 10,
                          }}
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
                      <Text style={styles.reviewText}>
                        {signupData.fullName}
                      </Text>
                    </View>
                    <Text style={styles.heading}>Username</Text>
                    <View style={styles.reviewInput}>
                      <Text style={styles.reviewText}>
                        {signupData.username}
                      </Text>
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

                    <Text style={[styles.heading, { marginTop: 16 }]}>
                      Favorites
                    </Text>
                    {signupData.favorites.length > 0 ? (
                      <ScrollView
                        horizontal={false}
                        style={styles.favoritesScroll}
                      >
                        {signupData.favorites.map((favId) => {
                          const [league, id] = favId.split(":") as [
                            LeagueType,
                            string,
                          ];
                          let team;
                          if (league === "CBB") {
                            team = cbbTeams.find((t) => String(t.wid) === id);
                          } else {
                            team = teams.find((t) => String(t.id) === id);
                          }
                          if (!team) return null;
                          return (
                            <View
                              key={favId}
                              style={[
                                styles.teamCardList,
                                { backgroundColor: team.color || "#007AFF" },
                              ]}
                            >
                              <Image
                                source={
                                  team.logoLight ? team.logoLight : team.logo
                                }
                                style={styles.logo}
                              />
                              <Text
                                style={[
                                  styles.teamName,
                                  { color: Colors.white },
                                ]}
                              >
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
        })()}
      </View>

      
      {/* NEXT / SIGN UP BUTTON */}
      <Pressable
        onPress={async () => {
          if (signupStep === 4) {
            await onSubmit();
          } else {
            onNextStep();
          }
        }}
        style={styles.button}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {signupStep === 4 ? "Sign Up" : "Next"}
        </Text>
      </Pressable>
    </View>
  );
}
