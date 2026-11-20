import SearchBar from "@/components/SearchBars/SearchBar";
import { GiphySearchModalStyles } from "@/styles/MessageStyles/GiphySearchModalStyles";
import { snapPoints } from "@/utils/ui/modalUtils";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
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
  Image,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type GifItem = {
  id: string;
  title?: string;
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
  const styles = useMemo(() => GiphySearchModalStyles(isDark), [isDark]);

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
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (visible) return;

      setQuery("");
    });

    return () => {
      cancelled = true;
    };
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
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.title || "GIF"}`}
        activeOpacity={activeOpacity}
        onPress={() => handleGifSelect(item)}
        style={styles.gifContainer}
      >
        <Image
          source={{ uri: item.images.fixed_width_small.url }}
          style={styles.gifImage}
          resizeMode="cover"
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
            <Text style={styles.emptyText}>No GIFs found</Text>
          ) : null
        }
        ListFooterComponent={() =>
          loading ? <Text style={styles.loadingText}>Loading…</Text> : null
        }
      />
    </BottomSheetModal>
  );
};
