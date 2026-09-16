import { Colors } from "@/constants/styles";
import { useFavoriteTeamsContext } from "@/contexts/FavoriteTeamsContext";
import { MessageThemeModalStyles } from "@/styles/MessageStyles/MessageThemeModalStyles";
import { Team } from "@/types/team";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import type { RefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import type { MessageThemePreference } from "types/messages";
import {
  DEFAULT_MESSAGE_THEME_PREFERENCE,
  getReadableGradientTextColor,
  normalizeMessageThemePreference,
} from "utils/messageTheme";
import { snapPoints } from "utils/modalUtils";
import Button from "../Buttons/Button";
import CustomActivityIndicator from "../CustomActivityIndicator";

type Props = {
  sheetRef: RefObject<BottomSheetModal | null>;
  visible: boolean;
  isDark: boolean;
  currentPreference: MessageThemePreference;
  isSaving: boolean;
  onClose: () => void;
  onSave: (preference: MessageThemePreference) => Promise<unknown>;
};

const CUSTOM_GRADIENTS = [
  {
    id: "electric-violet",
    name: "Electric Violet",
    primaryColor: "#7C3AED",
    secondaryColor: "#EC4899",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primaryColor: "#0072FF",
    secondaryColor: "#00C6FF",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    primaryColor: "#FF512F",
    secondaryColor: "#F09819",
  },
  {
    id: "aurora",
    name: "Aurora",
    primaryColor: "#00BFA6",
    secondaryColor: "#845EC2",
  },
  {
    id: "midnight",
    name: "Midnight",
    primaryColor: "#141E30",
    secondaryColor: "#4B6CB7",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    primaryColor: "#B76E79",
    secondaryColor: "#F7CAC9",
  },
] as const;

type CustomGradient = (typeof CUSTOM_GRADIENTS)[number];

const colorsMatch = (first: string | null, second: string) =>
  first?.toUpperCase() === second.toUpperCase();

const getTeamKey = (team: Team): string => {
  return `${String(team.league).toUpperCase()}:${String(team.id)}`;
};

const getPreferenceTeamKey = (
  preference: MessageThemePreference,
): string | null => {
  if (
    preference.mode !== "favorite_team" ||
    !preference.league ||
    preference.teamId == null
  ) {
    return null;
  }

  return `${String(preference.league).toUpperCase()}:${String(
    preference.teamId,
  )}`;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const responseError = (error as any).response?.data?.error;
    const responseMessage = (error as any).response?.data?.message;
    const message = (error as any).message;

    return (
      responseError ?? responseMessage ?? message ?? "Theme update failed."
    );
  }

  return "Theme update failed.";
};

export default function MessageThemeModal({
  sheetRef,
  visible,
  isDark,
  currentPreference,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const styles = useMemo(() => MessageThemeModalStyles(isDark), [isDark]);

  const { favorites, isLoading, ready, allTeams } = useFavoriteTeamsContext();

  const [draftPreference, setDraftPreference] =
    useState<MessageThemePreference>(DEFAULT_MESSAGE_THEME_PREFERENCE);

  const [saveError, setSaveError] = useState<string | null>(null);

  const favoriteTeams = useMemo(
    () =>
      favorites
        .map((favoriteKey) => {
          const [league, id] = favoriteKey.split(":");

          if (!league || id == null) {
            return null;
          }

          return (
            allTeams.find(
              (team) =>
                String(team.league).toUpperCase() === league.toUpperCase() &&
                String(team.id) === id,
            ) ?? null
          );
        })
        .filter((team): team is Team => Boolean(team)),
    [allTeams, favorites],
  );

  const selectedTeamKey = getPreferenceTeamKey(draftPreference);

  const isFavoriteSelectionIncomplete =
    draftPreference.mode === "favorite_team" &&
    (!draftPreference.league || draftPreference.teamId == null);

  /*
   * Reset the draft whenever the modal opens or the saved
   * preference changes.
   */
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!visible) {
        return;
      }

      setDraftPreference(normalizeMessageThemePreference(currentPreference));
      setSaveError(null);
    });

    return () => {
      cancelled = true;
    };
  }, [currentPreference, visible]);

  const handleClose = () => {
    sheetRef.current?.dismiss();
  };

  const handleSelectDefault = () => {
    setDraftPreference(DEFAULT_MESSAGE_THEME_PREFERENCE);
    setSaveError(null);
  };

  const handleSelectTeam = (team: Team) => {
    setDraftPreference({
      mode: "favorite_team",
      bubbleStyle: draftPreference.bubbleStyle,
      league: team.league,
      teamId: team.id,
      primaryColor: team.color ?? null,
      secondaryColor: team.secondaryColor ?? null,
    });

    setSaveError(null);
  };

  const handleSelectBubbleStyle = (
    bubbleStyle: MessageThemePreference["bubbleStyle"],
  ) => {
    if (draftPreference.mode === "default") return;

    setDraftPreference((current) => ({ ...current, bubbleStyle }));
    setSaveError(null);
  };

  const handleSelectCustomGradient = (gradient: CustomGradient) => {
    setDraftPreference({
      mode: "manual",
      bubbleStyle: "gradient",
      league: null,
      teamId: null,
      primaryColor: gradient.primaryColor,
      secondaryColor: gradient.secondaryColor,
    });
    setSaveError(null);
  };

  const handleSave = async () => {
    if (isSaving || isFavoriteSelectionIncomplete) {
      return;
    }

    try {
      setSaveError(null);
      await onSave(draftPreference);
      sheetRef.current?.dismiss();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={[snapPoints[2]]}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundStyle={styles.backgroundStyle}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Message Theme</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={handleSelectDefault}
            style={({ pressed }) => [
              styles.optionRow,
              draftPreference.mode === "default" && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Use the default message theme"
            accessibilityState={{
              selected: draftPreference.mode === "default",
            }}
          >
            <View style={styles.defaultIcon}>
              <View style={[styles.defaultSwatch, styles.defaultSwatchDark]} />

              <View style={[styles.defaultSwatch, styles.defaultSwatchLight]} />
            </View>

            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Default</Text>

              <Text style={styles.optionMeta}>Tempo</Text>
            </View>

            {draftPreference.mode === "default" && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={isDark ? Colors.white : Colors.black}
              />
            )}
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bubble Style</Text>
          </View>

          <View style={styles.styleOptions}>
            <Pressable
              onPress={() => handleSelectBubbleStyle("solid")}
              disabled={draftPreference.mode === "default"}
              style={({ pressed }) => [
                styles.styleOption,
                draftPreference.bubbleStyle === "solid" &&
                  draftPreference.mode !== "default" &&
                  styles.optionSelected,
                draftPreference.mode === "default" && styles.optionDisabled,
                pressed && styles.optionPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Use solid message bubbles"
              accessibilityState={{
                disabled: draftPreference.mode === "default",
                selected:
                  draftPreference.mode !== "default" &&
                  draftPreference.bubbleStyle === "solid",
              }}
            >
              <View
                style={[
                  styles.bubblePreview,
                  {
                    backgroundColor:
                      draftPreference.primaryColor ?? Colors.midTone,
                  },
                ]}
              />
              <Text style={styles.styleOptionText}>Solid</Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelectBubbleStyle("gradient")}
              disabled={draftPreference.mode === "default"}
              style={({ pressed }) => [
                styles.styleOption,
                draftPreference.bubbleStyle === "gradient" &&
                  draftPreference.mode !== "default" &&
                  styles.optionSelected,
                draftPreference.mode === "default" && styles.optionDisabled,
                pressed && styles.optionPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Use gradient message bubbles"
              accessibilityState={{
                disabled: draftPreference.mode === "default",
                selected:
                  draftPreference.mode !== "default" &&
                  draftPreference.bubbleStyle === "gradient",
              }}
            >
              <View
                style={[
                  styles.bubblePreview,
                  {
                    experimental_backgroundImage: `linear-gradient(135deg, ${
                      draftPreference.primaryColor ?? Colors.midTone
                    } 0%, ${
                      draftPreference.secondaryColor ?? Colors.lightGray
                    } 100%)`,
                  },
                ]}
              />
              <Text style={styles.styleOptionText}>Gradient</Text>
            </Pressable>
          </View>

          {draftPreference.mode === "default" && (
            <Text style={styles.styleHint}>
              Choose a gradient or favorite team to enable bubble styles.
            </Text>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom Gradients</Text>
            <Text style={styles.sectionDescription}>
              Color themes independent of your favorite teams
            </Text>
          </View>

          <View style={styles.customGradientGrid}>
            {CUSTOM_GRADIENTS.map((gradient) => {
              const selected =
                draftPreference.mode === "manual" &&
                draftPreference.bubbleStyle === "gradient" &&
                colorsMatch(
                  draftPreference.primaryColor,
                  gradient.primaryColor,
                ) &&
                colorsMatch(
                  draftPreference.secondaryColor,
                  gradient.secondaryColor,
                );
              const textColor = getReadableGradientTextColor(
                gradient.primaryColor,
                gradient.secondaryColor,
              );

              return (
                <Pressable
                  key={gradient.id}
                  onPress={() => handleSelectCustomGradient(gradient)}
                  style={({ pressed }) => [
                    styles.customGradientOption,
                    {
                      experimental_backgroundImage: `linear-gradient(135deg, ${gradient.primaryColor} 0%, ${gradient.secondaryColor} 100%)`,
                    },
                    selected && styles.customGradientSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Use the ${gradient.name} gradient`}
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[styles.customGradientName, { color: textColor }]}
                  >
                    {gradient.name}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={textColor}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Teams</Text>
          </View>

          {!ready || isLoading ? (
            <View style={styles.loadingRow}>
              <CustomActivityIndicator />
            </View>
          ) : favoriteTeams.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No favorite teams</Text>
            </View>
          ) : (
            favoriteTeams.map((team) => {
              const teamKey = getTeamKey(team);
              const selected = selectedTeamKey === teamKey;

              const primaryColor = team.color ?? Colors.midTone;

              const secondaryColor = team.secondaryColor ?? Colors.lightGray;

              return (
                <Pressable
                  key={teamKey}
                  onPress={() => handleSelectTeam(team)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${team.fullName ?? team.name} colors`}
                  accessibilityState={{ selected }}
                >
                  <View style={styles.logoWrap}>
                    <Image
                      source={isDark ? team.logoLight || team.logo : team.logo}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.optionBody}>
                    <Text style={styles.optionTitle}>
                      {team.fullName ?? team.name}
                    </Text>

                    <Text style={styles.optionMeta}>{team.league}</Text>
                  </View>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={isDark ? Colors.white : Colors.black}
                    />
                  )}
                  <View style={styles.swatchRow}>
                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: primaryColor,
                        },
                      ]}
                    />

                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: secondaryColor,
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {!!saveError && <Text style={styles.errorText}>{saveError}</Text>}

        <View style={styles.buttonContainer}>
          <Button
            isDark={isDark}
            onPress={handleClose}
            disabled={isLoading || isSaving}
            variant="outline"
            style={styles.button}
          >
            Cancel
          </Button>

          <Button
            isDark={isDark}
            onPress={handleSave}
            disabled={
              isLoading || isSaving || isFavoriteSelectionIncomplete
            }
            variant="filled"
            style={styles.button}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}
