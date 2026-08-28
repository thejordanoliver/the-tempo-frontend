import SearchBar from "@/components/SearchBars/SearchBar";
import { snapPoints } from "@/utils/modalUtils";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useDebounce } from "hooks/useDebounce";
import { useGiphySearch } from "hooks/useGiphySearch";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  onGifSelected: (gifUrl: string, giphyId: string) => void;
  gifsCount: number;
};

export const GiphySearchModal: React.FC<Props> = ({
  visible,
  onClose,
  onGifSelected,
  gifsCount,
}) => {
  const [query, setQuery] = useState("");
  const sheetRef = useRef<BottomSheetModal>(null);
  const { top } = useSafeAreaInsets();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => giphySearchModalStyles(isDark), [isDark]);

  const debouncedQuery = useDebounce(query.trim(), 400);
  const { data: results, loading, hasMore, searchGifs } = useGiphySearch();

  const hasPresentedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      if (hasPresentedRef.current) {
        sheetRef.current?.dismiss();
      }

      return;
    }

    const frame = requestAnimationFrame(() => {
      hasPresentedRef.current = true;
      sheetRef.current?.present();
    });

    return () => cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    searchGifs(debouncedQuery || "SPORTS", true);
  }, [debouncedQuery, searchGifs, visible]);

  useEffect(() => {
    if (visible) return;

    setQuery("");
  }, [visible]);

  const handleDismiss = useCallback(() => {
    hasPresentedRef.current = false;
    setQuery("");
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
      onGifSelected(gif.images.original.url, gif.id);
      sheetRef.current?.dismiss();
    },
    [gifsCount, onGifSelected],
  );

  const renderItem = useCallback(
    ({ item }: { item: GifItem }) => (
      <TouchableOpacity
        activeOpacity={activeOpacity}
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

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>GIFs</Text>
            <Text style={styles.subtitle}>Search and add a GIF</Text>
          </View>
        </View>

        <SearchBar
          placeholder="Search GIFs"
          value={query}
          onChangeText={setQuery}
        />
      </View>
    ),
    [query, styles.header, styles.headerContent, styles.subtitle, styles.title],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      stackBehavior="push"
      topInset={top}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={handleDismiss}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundStyle={styles.backgroundStyle}
    >
      <BottomSheetFlatList
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
        ListHeaderComponent={listHeader}
        ListEmptyComponent={() =>
          !loading && debouncedQuery.length >= 3 ? (
            <Text style={styles.emptyText}>No GIFs found.</Text>
          ) : null
        }
        ListFooterComponent={() =>
          loading ? <Text style={styles.loadingText}>Loading...</Text> : null
        }
      />
    </BottomSheetModal>
  );
};

const giphySearchModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    handleStyle: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    handleIndicatorStyle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.midTone,
    },
    backgroundStyle: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    headerContent: {
      paddingBottom: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    closeButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 46,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
    listContent: {
      paddingHorizontal: 14,
      paddingBottom: 44,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    columnWrapper: {
      gap: 8,
    },
    gifContainer: {
      flex: 1 / 3,
      aspectRatio: 1,
      marginBottom: 8,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.itemBackground : Colors.lightGray,
      overflow: "hidden",
    },
    gifImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
    },
    emptyText: {
      marginTop: 24,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    loadingText: {
      paddingVertical: 12,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });
