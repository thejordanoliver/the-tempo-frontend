import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useDebounce } from "hooks/useDebounce";
import { useGiphySearch } from "hooks/useGiphySearch";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type GifItem = {
  id: string;
  images: {
    original: { url: string };
    fixed_width_small: { url: string };
  };
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onGifSelected: (gifUrl: string) => void;
  gifsCount: number;
};

export const GiphySearchModal: React.FC<Props> = ({
  visible,
  onClose,
  onGifSelected,
  gifsCount,
}) => {
  const [query, setQuery] = useState("");

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const debouncedQuery = useDebounce(query.trim(), 400);
  const { data: results, loading, hasMore, searchGifs } = useGiphySearch();

  useEffect(() => {
    if (!visible) return;

    searchGifs(debouncedQuery || "NBA", true);
  }, [debouncedQuery, searchGifs, visible]);

  useEffect(() => {
    if (visible) return;

    setQuery("");
  }, [visible]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      searchGifs(debouncedQuery || "NBA", false);
    }
  }, [debouncedQuery, hasMore, loading, searchGifs]);

  const handleGifSelect = useCallback(
    (gif: GifItem) => {
      if (gifsCount >= 8) {
        Alert.alert("Limit reached", "You can only add up to 8 GIFs.");
        return;
      }

      Keyboard.dismiss();
      onGifSelected(gif.images.original.url);
    },
    [gifsCount, onGifSelected],
  );

  const renderItem = useCallback(
    ({ item }: { item: GifItem }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleGifSelect(item)}
        style={styles.gifContainer}
      >
        <Image
          source={{ uri: item.images.fixed_width_small.url }}
          style={styles.gifImage}
          contentFit="cover"
        />
      </TouchableOpacity>
    ),
    [handleGifSelect, styles.gifContainer, styles.gifImage],
  );

  const keyExtractor = useCallback((item: GifItem) => item.id, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <BlurView
          intensity={100}
          tint={
            isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"
          }
          style={StyleSheet.absoluteFill}
        />

        <Pressable style={styles.backdropPressable} onPress={handleClose} />

        <View style={styles.container}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>GIFs</Text>
              <Text style={styles.subtitle}>Search and add a GIF</Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.85}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons
              name="search"
              size={18}
              color={isDark ? Colors.lightGray : Colors.darkGray}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search GIFs"
              placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <FlatList
            data={results as GifItem[]}
            keyExtractor={keyExtractor}
            numColumns={3}
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={() =>
              !loading && debouncedQuery.length >= 3 ? (
                <Text style={styles.emptyText}>No GIFs found.</Text>
              ) : null
            }
            ListFooterComponent={() =>
              loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : null
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdropPressable: {
      ...StyleSheet.absoluteFillObject,
    },
    container: {
      height: "88%",
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,

      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },
    dragHandle: {
      width: 42,
      height: 4,
      borderRadius: 999,
      alignSelf: "center",
      marginBottom: 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
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
    searchRow: {
      minHeight: 46,
      borderRadius: 14,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    searchInput: {
      flex: 1,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
      paddingVertical: 10,
    },
    listContent: {
      paddingBottom: 28,
    },
    columnWrapper: {
      gap: 8,
    },
    gifContainer: {
      flex: 1 / 3,
      aspectRatio: 1,
      marginBottom: 8,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: isDark ? Colors.dark.itemBackground : Colors.lightGray,
    },
    gifImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 24,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    loadingText: {
      textAlign: "center",
      paddingVertical: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
  });