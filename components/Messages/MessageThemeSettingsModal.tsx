import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { MessageThemePreference } from "types/messages";
import type { LeagueTeam } from "types/types";
import {
  DEFAULT_MESSAGE_THEME_PREFERENCE,
  normalizeMessageThemePreference,
} from "utils/messageTheme";
import { favoriteTeamsList } from "utils/teams";

type MessageThemeSettingsModalProps = {
  visible: boolean;
  isDark: boolean;
  currentPreference: MessageThemePreference;
  isSaving: boolean;
  onClose: () => void;
  onSave: (preference: MessageThemePreference) => Promise<unknown>;
};

const getTeamKey = (team: LeagueTeam) => `${team.league}:${team.id}`;

const getPreferenceTeamKey = (preference: MessageThemePreference) => {
  if (
    preference.mode !== "favorite_team" ||
    !preference.league ||
    preference.teamId == null
  ) {
    return null;
  }

  return `${String(preference.league).toUpperCase()}:${preference.teamId}`;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;

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

export default function MessageThemeSettingsModal({
  visible,
  isDark,
  currentPreference,
  isSaving,
  onClose,
  onSave,
}: MessageThemeSettingsModalProps) {
  const styles = useMemo(() => messageThemeModalStyles(isDark), [isDark]);
  const { favorites, isLoading, ready } = useFavoriteTeamsContext();
  const [draftPreference, setDraftPreference] =
    useState<MessageThemePreference>(DEFAULT_MESSAGE_THEME_PREFERENCE);
  const [saveError, setSaveError] = useState<string | null>(null);

  const favoriteTeams = useMemo(
    () =>
      favorites
        .map((favoriteKey) => {
          const [league, id] = favoriteKey.split(":");

          if (!league || id == null) return null;

          return (
            favoriteTeamsList.find(
              (team) =>
                String(team.league).toUpperCase() ===
                  String(league).toUpperCase() && String(team.id) === id,
            ) ?? null
          );
        })
        .filter((team): team is LeagueTeam => Boolean(team)),
    [favorites],
  );

  const selectedTeamKey = getPreferenceTeamKey(draftPreference);
  const isFavoriteSelectionIncomplete =
    draftPreference.mode === "favorite_team" &&
    (!draftPreference.league || draftPreference.teamId == null);

  useEffect(() => {
    if (!visible) return;

    setDraftPreference(normalizeMessageThemePreference(currentPreference));
    setSaveError(null);
  }, [currentPreference, visible]);

  const handleSelectDefault = () => {
    setDraftPreference(DEFAULT_MESSAGE_THEME_PREFERENCE);
    setSaveError(null);
  };

  const handleSelectTeam = (team: LeagueTeam) => {
    setDraftPreference({
      mode: "favorite_team",
      league: team.league,
      teamId: team.id,
      primaryColor: team.color ?? null,
      secondaryColor: team.secondaryColor ?? null,
    });
    setSaveError(null);
  };

  const handleSave = async () => {
    if (isSaving || isFavoriteSelectionIncomplete) return;

    try {
      setSaveError(null);
      await onSave(draftPreference);
      onClose();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={36}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Message Theme</Text>
              <Text style={styles.subtitle}>This chat</Text>
            </View>

            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close message theme settings"
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
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
              accessibilityState={{
                selected: draftPreference.mode === "default",
              }}
            >
              <View style={styles.defaultIcon}>
                <View
                  style={[styles.defaultSwatch, styles.defaultSwatchDark]}
                />
                <View
                  style={[styles.defaultSwatch, styles.defaultSwatchLight]}
                />
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
              <Text style={styles.sectionTitle}>Favorite Teams</Text>
            </View>

            {!ready || isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator
                  size="small"
                  color={isDark ? Colors.white : Colors.black}
                />
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
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.logoWrap}>
                      <Image
                        source={team.logoLight ?? team.logo}
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

                    <View style={styles.swatchRow}>
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: primaryColor },
                        ]}
                      />
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: secondaryColor },
                        ]}
                      />
                    </View>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={isDark ? Colors.white : Colors.black}
                      />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {!!saveError && <Text style={styles.errorText}>{saveError}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={onClose}
              disabled={isSaving}
              style={[styles.actionButton, styles.cancelButton]}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={handleSave}
              disabled={isSaving || isFavoriteSelectionIncomplete}
              style={[
                styles.actionButton,
                styles.saveButton,
                (isSaving || isFavoriteSelectionIncomplete) &&
                  styles.actionButtonDisabled,
              ]}
              accessibilityRole="button"
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? Colors.black : Colors.white}
                />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const messageThemeModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDark ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.22)",
    },

    sheet: {
      maxHeight: "82%",
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 24,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },

    title: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    scroll: {
      maxHeight: 440,
    },

    scrollContent: {
      gap: 8,
      paddingBottom: 8,
    },

    optionRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    optionSelected: {
      borderColor: isDark ? Colors.white : Colors.black,
    },

    optionPressed: {
      opacity: 0.78,
    },

    optionBody: {
      flex: 1,
      minWidth: 0,
    },

    optionTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    optionMeta: {
      marginTop: 2,
      fontSize: 11,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    defaultIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      flexDirection: "row",
    },

    defaultSwatch: {
      flex: 1,
    },

    defaultSwatchDark: {
      backgroundColor: Colors.black,
    },

    defaultSwatchLight: {
      backgroundColor: Colors.white,
    },

    sectionHeader: {
      paddingTop: 8,
      paddingHorizontal: 2,
    },

    sectionTitle: {
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    loadingRow: {
      minHeight: 72,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyState: {
      minHeight: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    emptyTitle: {
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    logoWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    logo: {
      width: 30,
      height: 30,
    },

    swatchRow: {
      flexDirection: "row",
      gap: 4,
    },

    colorSwatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    errorText: {
      marginTop: 10,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
    },

    actionButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },

    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: "transparent",
    },

    saveButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    actionButtonDisabled: {
      opacity: 0.4,
    },

    cancelText: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    saveText: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.black : Colors.white,
    },
  });
