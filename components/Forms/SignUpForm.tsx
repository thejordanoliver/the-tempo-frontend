import { LEAGUE_CONFIG, type FavoriteSportId } from "@/constants/leagues";
import { useFavoriteTeamsContext } from "@/contexts/FavoriteTeamsContext";
import FavoriteSportsSelector from "components/Favorites/FavoriteSportsSelector";
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { formStyles } from "styles/FormStyles";
import type { FavoriteTeamKey } from "types/favorites";
import type { LeagueType } from "types/types";

import { getNBATeamLogo } from "@/constants/teams";
import { getCBTeamLogo } from "@/constants/teamsCB";
import { getCBBTeamLogo } from "@/constants/teamsCBB";
import { getCFBTeamLogo } from "@/constants/teamsCFB";
import { getMLBTeamLogo } from "@/constants/teamsMLB";
import { getNFLTeamLogo } from "@/constants/teamsNFL";
import { getNHLTeamLogo } from "@/constants/teamsNHL";
import { getSBTeamLogo } from "@/constants/teamsSB";
import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getWNBATeamLogo } from "@/constants/teamsWNBA";
import Button from "../Buttons/Button";
import SelectionCard from "../Favorites/SelectionCard";
import TabBar from "../TabBars/TabBar";

export type SignupData = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  favoriteTeams: FavoriteTeamKey[];
  favoriteSports: FavoriteSportId[];
  profileImage: string | null;
  bannerImage: string | null;
};

export type SignupStepsProps = {
  signupData: SignupData;
  signupStep: number;
  onChangeSignupData: (data: Partial<SignupData>) => void;
  onNextStep: () => void;
  onToggleFavorite: (league: string, id: string) => void;
  onOpenImagePickerFor: (target: "profile" | "banner") => void;
  isGridView: boolean;
  fadeAnim: Animated.Value;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
};

const TOTAL_STEPS = 4;
const FAVORITES_TABS = ["teams", "leagues"] as const;
const COLLEGE_LEAGUES = new Set(["cfb", "cbb", "wcbb", "cb", "sb"]);

const getTeamLogo = (
  league: string | null,
  id: number,
  useAltLogo: boolean,
): ImageSourcePropType | undefined => {
  switch (league) {
    case "cfb":
      return getCFBTeamLogo(id, useAltLogo);

    case "cbb":
      return getCBBTeamLogo(id, useAltLogo);

    case "wcbb":
      return getWCBBTeamLogo(id, useAltLogo);

    case "mlb":
      return getMLBTeamLogo(id, useAltLogo);

    case "cb":
      return getCBTeamLogo(id, useAltLogo);

    case "sb":
      return getSBTeamLogo(id, useAltLogo);

    case "nba":
      return getNBATeamLogo(id, useAltLogo);

    case "wnba":
      return getWNBATeamLogo(id, useAltLogo);

    case "nfl":
      return getNFLTeamLogo(id, useAltLogo);

    case "nhl":
      return getNHLTeamLogo(id, useAltLogo);

    default:
      return undefined;
  }
};

type FavoritesTab = (typeof FAVORITES_TABS)[number];

export default function SignUpForm({
  signupStep,
  signupData,
  onChangeSignupData,
  onNextStep,
  onToggleFavorite,
  onOpenImagePickerFor,
  isGridView,
  fadeAnim,
  isSubmitting,
  onSubmit,
}: SignupStepsProps) {
  const { resolvedColorScheme } = usePreferences();
  const { width: screenWidth } = useWindowDimensions();

  const { allTeams, search, setSearch, filteredTeams } =
    useFavoriteTeamsContext();

  const isDark = resolvedColorScheme === "dark";

  const styles = formStyles(isDark);
  const global = globalStyles(isDark);

  const progress = useRef(new Animated.Value(0)).current;

  const [selectedFavoritesTab, setSelectedFavoritesTab] =
    useState<FavoritesTab>("teams");

  useEffect(() => {
    Animated.timing(progress, {
      toValue: signupStep / TOTAL_STEPS,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, signupStep]);

  useEffect(() => {
    return () => {
      setSearch("");
    };
  }, [setSearch]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const itemWidth = useMemo(() => {
    const numColumns = 3;
    const containerPadding = 40;
    const columnGap = 12;
    const totalSpacing = columnGap * (numColumns - 1);

    return (screenWidth - containerPadding - totalSpacing) / numColumns;
  }, [screenWidth]);

  const showProgress = signupStep > 0;

  const handleTabPress = useCallback(
    (tab: FavoritesTab) => {
      setSearch("");
      setSelectedFavoritesTab(tab);
    },
    [setSearch],
  );

  const handleToggleFavoriteSport = useCallback(
    (sport: FavoriteSportId) => {
      const isFavorite = signupData.favoriteSports.includes(sport);

      onChangeSignupData({
        favoriteSports: isFavorite
          ? signupData.favoriteSports.filter((favorite) => favorite !== sport)
          : [...signupData.favoriteSports, sport],
      });
    },
    [onChangeSignupData, signupData.favoriteSports],
  );

  const findFavoriteTeam = useCallback(
    (league: LeagueType | null, id: string) =>
      allTeams.find((team) => {
        if (team.id == null) {
          return false;
        }

        const leagueMatches = league ? team.league === league : true;

        return leagueMatches && String(team.id) === String(id);
      }),
    [allTeams],
  );

  const renderStep = () => {
    switch (signupStep) {
      // Step 0: Name & Username
      case 0:
        return (
          <View style={styles.formWrapper}>
            <View style={styles.input}>
              <TextInput
                placeholder="Name"
                value={signupData.fullName}
                onChangeText={(value) =>
                  onChangeSignupData({
                    fullName: value,
                  })
                }
                style={styles.inputText}
                placeholderTextColor={Colors.midTone}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
              />
            </View>

            <View style={styles.input}>
              <TextInput
                placeholder="Username"
                value={signupData.username}
                onChangeText={(value) =>
                  onChangeSignupData({
                    username: value.toLowerCase(),
                  })
                }
                style={styles.inputText}
                placeholderTextColor={Colors.midTone}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username-new"
                textContentType="username"
                returnKeyType="next"
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
                onChangeText={(value) =>
                  onChangeSignupData({
                    email: value,
                  })
                }
                style={styles.inputText}
                placeholderTextColor={Colors.midTone}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>

            <View style={styles.input}>
              <TextInput
                placeholder="Password"
                secureTextEntry
                value={signupData.password}
                onChangeText={(value) =>
                  onChangeSignupData({
                    password: value,
                  })
                }
                style={styles.inputText}
                placeholderTextColor={Colors.midTone}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
              />
            </View>

            <View style={styles.input}>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={signupData.confirmPassword}
                onChangeText={(value) =>
                  onChangeSignupData({
                    confirmPassword: value,
                  })
                }
                style={styles.inputText}
                placeholderTextColor={Colors.midTone}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
              />
            </View>
          </View>
        );

      // Step 2: Favorite Teams & Leagues
      case 2:
        return (
          <View style={styles.sectionContainer}>
            <TabBar
              tabs={FAVORITES_TABS}
              selected={selectedFavoritesTab}
              onTabPress={handleTabPress}
              isDark={isDark}
            />

            {selectedFavoritesTab === "teams" ? (
              <FavoriteTeamsSelector
                teams={filteredTeams}
                favorites={signupData.favoriteTeams}
                toggleFavorite={onToggleFavorite}
                isGridView={isGridView}
                fadeAnim={fadeAnim}
                search={search}
                itemWidth={itemWidth}
                setSearch={setSearch}
              />
            ) : (
              <FavoriteSportsSelector
                favorites={signupData.favoriteSports}
                loading={false}
                ready
                saving={isSubmitting}
                error={null}
                onRetry={() => undefined}
                toggleFavorite={handleToggleFavoriteSport}
                isGridView={isGridView}
                fadeAnim={fadeAnim}
                search={search}
                setSearch={setSearch}
                itemWidth={itemWidth}
              />
            )}
          </View>
        );

      // Step 3: Images
      case 3:
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.reviewText}>Banner Image</Text>

            <Pressable
              onPress={() => onOpenImagePickerFor("banner")}
              style={styles.imageUploadBox}
              accessibilityRole="button"
              accessibilityLabel="Select banner image"
            >
              {signupData.bannerImage ? (
                <Image
                  source={{
                    uri: signupData.bannerImage,
                  }}
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
              accessibilityRole="button"
              accessibilityLabel="Select profile picture"
            >
              {signupData.profileImage ? (
                <Image
                  source={{
                    uri: signupData.profileImage,
                  }}
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
          <ScrollView
            contentContainerStyle={styles.reviewContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.reviewText}>Banner Image</Text>
            <View style={styles.imageUploadBox}>
              {signupData.bannerImage && (
                <Image
                  source={{
                    uri: signupData.bannerImage,
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                  }}
                />
              )}
            </View>
            <Text style={styles.reviewText}>Profile Picture</Text>
            <View style={styles.profileImageUploadBox}>
              {signupData.profileImage && (
                <Image
                  source={{
                    uri: signupData.profileImage,
                  }}
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
            <Text style={styles.heading}>Favorite Teams</Text>

            {signupData.favoriteTeams.length === 0 && (
              <View style={global.emptyContainer}>
                <Text style={global.emptyText}>No teams selected</Text>
              </View>
            )}

            {signupData.favoriteTeams.map((favoriteId) => {
              let league: LeagueType | null = null;
              let id: string = favoriteId;

              if (favoriteId.includes(":")) {
                const [favoriteLeague, favoriteTeamId] = favoriteId.split(":");

                league = favoriteLeague as LeagueType;
                id = favoriteTeamId;
              }

              const team = findFavoriteTeam(league, id);

              if (!team) {
                return null;
              }

              const logo = getTeamLogo(league, Number(team.id), true);

              return (
                <SelectionCard
                  key={favoriteId}
                  item={team}
                  logo={logo}
                  isSelected
                  onPress={() => onToggleFavorite(team.league, String(team.id))}
                  isGridView={false}
                  itemWidth={itemWidth}
                  showSportTag={COLLEGE_LEAGUES.has(team.league)}
                />
              );
            })}

            <Text style={styles.heading}>Favorite Leagues</Text>
            {signupData.favoriteSports.length === 0 && (
              <View style={global.emptyContainer}>
                <Text style={global.emptyText}>No leagues selected</Text>
              </View>
            )}
            <View style={styles.favoritesContainer}>
              {signupData.favoriteSports.map((sport) => {
                const config = LEAGUE_CONFIG[sport];

                if (!config) {
                  return null;
                }

                const leagueItem = {
                  id: config.id,
                  name: config.label,
                  league: config.label,
                  color: config.color,
                  logo: config.logo,
                  logoLight: config.logoLight,
                  route: config.route,
                };

                const leagueLogo = config.logoLight ?? config.logo;

                return (
                  <SelectionCard
                    key={sport}
                    item={leagueItem}
                    logo={leagueLogo}
                    isSelected
                    onPress={() => handleToggleFavoriteSport(sport)}
                    isGridView={false}
                    itemWidth={itemWidth}
                  />
                );
              })}
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.sectionContainer}>
      {renderStep()}

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
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>
      )}

      <Button
        isDark={isDark}
        onPress={async () => {
          if (signupStep === TOTAL_STEPS) {
            await onSubmit();
            return;
          }

          onNextStep();
        }}
        disabled={isSubmitting}
      >
        {signupStep === TOTAL_STEPS
          ? isSubmitting
            ? "Creating Account…"
            : "Sign Up"
          : "Next"}
      </Button>
    </View>
  );
}
