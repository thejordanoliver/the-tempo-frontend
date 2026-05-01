import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { useDebounce } from "hooks/useDebounce";
import { useGiphySearch } from "hooks/useGiphySearch";
import React, { useCallback, useEffect } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
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
  const debouncedQuery = useDebounce(query, 400);
  const { data: results, loading, hasMore, searchGifs } = useGiphySearch();

  useEffect(() => {
    searchGifs(debouncedQuery || "NBA", true);
  }, [debouncedQuery]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      searchGifs(debouncedQuery || "NBA", false);
    }
  }, [loading, hasMore, debouncedQuery, searchGifs]);

  const handleGifSelect = useCallback(
    (gif: GifItem) => {
      if (gifsCount >= 8) {
        Alert.alert("Limit reached", "You can only add up to 8 GIFs.");
        return;
      }
      onGifSelected(gif.images.original.url);
      onClose();
    },
    [gifsCount, onGifSelected, onClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: GifItem }) => (
      <TouchableOpacity
        onPress={() => handleGifSelect(item)}
        style={styles.gifContainer}
      >
        <Image
          source={{ uri: item.images.fixed_width_small.url }}
          style={styles.gifImage}
        />
      </TouchableOpacity>
    ),
    [handleGifSelect],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={100}
        tint={isDark ? "dark" : "light"}
        style={styles.modalBackground}
      >
        <View style={[styles.container, { backgroundColor: isDark ? "#222" : "#fff" }]}>
          <View style={styles.header}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? Colors.dark.itemBackground : "#eee",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              placeholder="Search GIFs"
              placeholderTextColor={isDark ? "#aaa" : "#555"}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={results as GifItem[]}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={() =>
              !loading && debouncedQuery.length >= 3 ? (
                <Text style={{ textAlign: "center", marginTop: 20, color: isDark ? "#fff" : "#000" }}>
                  No GIFs found.
                </Text>
              ) : null
            }
            ListFooterComponent={() =>
              loading ? (
                <Text style={{ textAlign: "center", paddingVertical: 10, color: isDark ? "#fff" : "#000" }}>
                  Loading...
                </Text>
              ) : null
            }
          />
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: { flex: 1, justifyContent: "flex-end" },
  container: { height: "90%", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 18, padding: 10, borderRadius: 8 },
  closeButton: { marginLeft: 12 },
  gifContainer: { flex: 1 / 3, aspectRatio: 1, margin: 4 },
  gifImage: { flex: 1, borderRadius: 8 },
});