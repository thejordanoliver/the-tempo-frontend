// components/SignupSteps.tsx
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { Colors, globalStyles } from "constants/styles";
import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { useEffect, useRef, useState } from "react";

import Button from "components/Button";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { formStyles } from "styles/FormStyles";
import type { LeagueType } from "types/types";
import { favoriteTeamsList } from "utils/teams";

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
  selectedTab: string;
};

const TOTAL_STEPS = 4;

export default function SignUpForm({
  signupStep,
  signupData,
  onChangeSignupData,
  onNextStep,
  onToggleFavorite,
  onOpenImagePickerFor,
  isGridView,
  fadeAnim,
  selectedTab,
  isSubmitting,
  onSubmit,
}: SignupStepsProps) {
  const { resolvedColorScheme } = usePreferences();
  const { width: screenWidth } = useWindowDimensions();
  const isDark = resolvedColorScheme === "dark";
  const styles = formStyles(isDark);
  const global = globalStyles(isDark);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: signupStep / 4,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [signupStep]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const numColumns = 3;
  const containerPadding = 40;
  const columnGap = 12;
  const totalSpacing = columnGap * (numColumns - 1);
  const itemWidth =
    (screenWidth - containerPadding - totalSpacing) / numColumns;
  const [search, setSearch] = useState("");

  const isSignUp = selectedTab === "sign up";
  const showProgress = isSignUp && signupStep > 0;

  return (
    <View style={styles.sectionContainer}>
      {(() => {
        switch (signupStep) {
          // Step 0: Name & Username
          case 0:
            return (
              <View style={styles.formWrapper}>
                <View style={styles.input}>
                  <TextInput
                    placeholder="Name"
                    value={signupData.fullName}
                    onChangeText={(val) =>
                      onChangeSignupData({ fullName: val })
                    }
                    style={styles.inputText}
                    placeholderTextColor={Colors.midTone}
                  />
                </View>
                <View style={styles.input}>
                  <TextInput
                    placeholder="Username"
                    value={signupData.username}
                    onChangeText={(val) =>
                      onChangeSignupData({ username: val.toLowerCase() })
                    }
                    style={styles.inputText}
                    placeholderTextColor={Colors.midTone}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            );

          // Step 1: Email & Password
          case 1:
            return (
              <View style={styles.formWrapper}>
                <View style={styles.input}>
                  <TextInput
                    placeholder="johndoe@example.com"
                    keyboardType="email-address"
                    value={signupData.email}
                    onChangeText={(val) => onChangeSignupData({ email: val })}
                    style={styles.inputText}
                    placeholderTextColor={Colors.midTone}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.input}>
                  <TextInput
                    placeholder="Password"
                    secureTextEntry
                    value={signupData.password}
                    onChangeText={(val) =>
                      onChangeSignupData({ password: val })
                    }
                    style={styles.inputText}
                    placeholderTextColor={Colors.midTone}
                  />
                </View>
                <View style={styles.input}>
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={signupData.confirmPassword}
                    onChangeText={(val) =>
                      onChangeSignupData({ confirmPassword: val })
                    }
                    style={styles.inputText}
                    placeholderTextColor={Colors.midTone}
                  />
                </View>
              </View>
            );

          // Step 2: Favorite Teams
          case 2:
            return (
              <View style={styles.sectionContainer}>
                <FavoriteTeamsSelector
                  teams={favoriteTeamsList}
                  favorites={signupData.favorites}
                  toggleFavorite={onToggleFavorite}
                  isGridView={isGridView}
                  fadeAnim={fadeAnim}
                  search={search}
                  itemWidth={itemWidth}
                  setSearch={setSearch}
                />
              </View>
            );

          // Step 3: Banner & Profile Images
          case 3:
            return (
              <View style={styles.sectionContainer}>
                <Text style={styles.reviewText}>Banner Image</Text>
                <Pressable
                  onPress={() => onOpenImagePickerFor("banner")}
                  style={styles.imageUploadBox}
                >
                  {signupData.bannerImage ? (
                    <Image
                      source={{ uri: signupData.bannerImage }}
                      style={styles.bannerImage}
                    />
                  ) : (
                    <Text style={styles.imagePlaceholder}>
                      Tap to select banner image
                    </Text>
                  )}
                </Pressable>
                <Text style={styles.reviewText}>Profile Picture</Text>

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
              </View>
            );

          // Step 4: Review
          case 4:
            return (
              <ScrollView contentContainerStyle={styles.reviewContainer}>
                <Text style={styles.reviewText}>Banner Image</Text>
                <View style={styles.imageUploadBox}>
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
                <Text style={styles.reviewText}>Profile Picture</Text>
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

                <Text style={styles.heading}>Favorites</Text>
                {signupData.favorites.length > 0 ? (
                  <ScrollView style={styles.favoritesContainer}>
                    {signupData.favorites.map((favId) => {
                      let league: LeagueType | null = null;
                      let id = favId;

                      if (favId.includes(":")) {
                        const parts = favId.split(":");
                        league = parts[0] as LeagueType;
                        id = parts[1];
                      }

                      let team;

                      switch (league) {
                        case "WCBB":
                          team = cbbTeams.find((t) => String(t.wid) === id);
                          break;

                        case "CBB":
                          team = cbbTeams.find((t) => String(t.id) === id);
                          break;

                        case "NFL":
                          team = nflTeams.find((t) => String(t.id) === id);
                          break;

                        case "CFB":
                          team = cfbTeams.find((t) => String(t.id) === id);
                          break;

                        case "NHL":
                          team = nhlTeams.find((t) => String(t.id) === id);
                          break;

                        case "MLB":
                          team = mlbTeams.find((t) => String(t.id) === id);
                          break;
                        case "WNBA":
                          team = wnbaTeams.find((t) => String(t.id) === id);
                          break;

                        default:
                          team =
                            teams.find((t) => String(t.id) === id) ||
                            cbbTeams.find((t) => String(t.wid) === id) ||
                            nflTeams.find((t) => String(t.id) === id) ||
                            cfbTeams.find((t) => String(t.id) === id) ||
                            nhlTeams.find((t) => String(t.id) === id) ||
                            mlbTeams.find((t) => String(t.id) === id) ||
                            wnbaTeams.find((t) => String(t.id) === id);
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
                            source={team.logoLight ? team.logoLight : team.logo}
                            style={styles.logo}
                          />
                          <Text style={styles.teamName}>{team.fullName}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={global.emptyText}> No teams selected</Text>
                )}
              </ScrollView>
            );

          default:
            return null;
        }
      })()}

      {/* Progress Bar — shown from step 1 onwards */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>
              Step {signupStep} of {TOTAL_STEPS}
            </Text>
            <Text style={styles.progressLabel}>
              {Math.round((signupStep / TOTAL_STEPS) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[styles.progressBarFill, { width: progressWidth }]}
            />
          </View>
        </View>
      )}

      <Button
        isDark={isDark}
        children={signupStep === 4 ? "Sign Up" : "Next"}
        onPress={async () => {
          if (signupStep === 4) {
            await onSubmit();
          } else {
            onNextStep();
          }
        }}
        disabled={isSubmitting}
      />
    </View>
  );
}
