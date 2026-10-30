import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import SelectionCard from "components/Favorites/SelectionCard";
import SearchBar from "components/SearchBars/SearchBar";
import { activeOpacity } from "constants/styles";
import type { ComponentProps } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collegePollSettingsStyles } from "styles/ExploreStyles/CollegePollSettingsStyles";
import { useTickerTheme } from "./TickerUI";

export type TickerSelectionItem = {
  id: string;
  name: string;
  logo?: ImageSourcePropType;
  primaryColor?: string;
  searchTerms?: string;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  items: TickerSelectionItem[];
  selectedId?: string | null;
  disabled?: boolean;
  onSelect: (id: string) => Promise<boolean>;
  onClose: () => void;
  searchable?: boolean;
  error?: string | null;
};

const selectionSnapPoints = ["80%"];
const columnGap = 10;

export default function TickerSelectionSheet(props: Props) {
  // A fresh mounted instance owns each presentation. Hidden sheets cannot have
  // late command results or dismissal events close a subsequently opened sheet.
  return props.visible ? <ActiveTickerSelectionSheet {...props} /> : null;
}

function ActiveTickerSelectionSheet({
  title,
  subtitle,
  items,
  selectedId,
  disabled = false,
  onSelect,
  onClose,
  searchable = false,
  error,
}: Props) {
  const { isDark, colors, text } = useTickerTheme();
  const sheetStyles = useMemo(
    () => collegePollSettingsStyles(isDark),
    [isDark],
  );
  const { top, bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const mounted = useRef(true);
  const generation = useRef(0);
  const selecting = useRef(false);
  const closing = useRef(false);
  const onCloseRef = useRef(onClose);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (mounted.current && !closing.current) sheetRef.current?.present();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = useCallback(() => {
    if (!mounted.current || closing.current) return;
    closing.current = true;
    generation.current += 1;
    selecting.current = false;
    Keyboard.dismiss();
    sheetRef.current?.dismiss();
    onCloseRef.current();
  }, []);

  const select = useCallback(
    async (id: string) => {
      if (disabled || selecting.current || closing.current) return;
      selecting.current = true;
      setPending(true);
      const request = generation.current;
      try {
        const success = await onSelect(id);
        if (
          mounted.current &&
          !closing.current &&
          request === generation.current &&
          success
        )
          close();
      } catch {
        // Selection errors are surfaced by the caller; keep the picker open.
      } finally {
        if (mounted.current && request === generation.current) {
          selecting.current = false;
          setPending(false);
        }
      }
    },
    [close, disabled, onSelect],
  );

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      `${item.name} ${item.id} ${item.searchTerms ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={isDark ? 0.58 : 0.34}
        pressBehavior="close"
      />
    ),
    [isDark],
  );

  const renderItem = useCallback(
    ({ item }: { item: TickerSelectionItem }) => (
      <SelectionCard
        item={{
          id: item.id,
          league: "ticker",
          name: item.name,
          primaryColor: item.primaryColor,
        }}
        logo={item.logo}
        isSelected={item.id === selectedId}
        itemWidth={Math.max(0, (width - columnGap * 2) / 3)}
        disabled={disabled || pending}
        onPress={() => void select(item.id)}
      />
    ),
    [disabled, pending, select, selectedId, width],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={selectionSnapPoints}
      stackBehavior="push"
      topInset={top}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={close}
      backdropComponent={renderBackdrop}
      handleStyle={sheetStyles.handle}
      handleIndicatorStyle={sheetStyles.handleIndicator}
      backgroundStyle={sheetStyles.background}
    >
      <View
        style={sheetStyles.container}
        onLayout={({ nativeEvent }) =>
          setWidth(Math.max(0, nativeEvent.layout.width - 32))
        }
      >
        <View style={[sheetStyles.header, styles.header]}>
          <Ionicons
            name={searchable ? "people-outline" : "trophy-outline"}
            size={24}
            color={colors.text}
            accessibilityElementsHidden
          />
          <View style={sheetStyles.headerCopy}>
            <Text style={[sheetStyles.title, styles.headerText]}>{title}</Text>
            {subtitle && (
              <Text style={[sheetStyles.subtitle, styles.headerText]}>
                {subtitle}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Close ${title}`}
            onPress={close}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="close"
              size={24}
              color={colors.text}
              accessibilityElementsHidden
            />
          </Pressable>
        </View>
        {searchable && (
          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.icon}
              accessibilityElementsHidden
            />
            <View style={styles.searchField}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                accessibilityLabel={`Search ${title.toLowerCase()}`}
                placeholder="Search by name"
                editable={!pending}
              />
            </View>
          </View>
        )}
        {error && (
          <Text
            accessibilityRole="alert"
            style={[text.errorText, styles.message]}
          >
            {error}
          </Text>
        )}
        {pending && (
          <View style={styles.progress} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.text} />
            <Text style={[text.secondaryText, styles.progressText]}>
              Updating ticker…
            </Text>
          </View>
        )}
        <BottomSheetFlatList<TickerSelectionItem>
          data={width > 0 ? matches : []}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          columnWrapperStyle={styles.columns}
          ItemSeparatorComponent={SelectionRowSeparator}
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            width > 0 ? (
              <Text style={[text.secondaryText, styles.emptyMessage]}>
                {search.trim()
                  ? "No matches. Try another name."
                  : "No options available."}
              </Text>
            ) : null
          }
        />
      </View>
    </BottomSheetModal>
  );
}

function SelectionRowSeparator() {
  return <View style={styles.rowSeparator} />;
}

const styles = StyleSheet.create({
  header: { alignItems: "center" },
  headerText: { textAlign: "left" },
  closeButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: { opacity: activeOpacity },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchField: { flex: 1 },
  message: { paddingBottom: 12 },
  progress: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingBottom: 12,
  },
  progressText: { flex: 1 },
  columns: { gap: columnGap },
  rowSeparator: { height: columnGap },
  emptyMessage: { paddingVertical: 24, textAlign: "center" },
});
