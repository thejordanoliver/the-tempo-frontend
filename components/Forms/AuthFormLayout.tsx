import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHeaderHeight } from "expo-router/react-navigation";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthFormLayoutProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
}>;

export default function AuthFormLayout({
  children,
  contentContainerStyle,
  keyboardAware = false,
}: AuthFormLayoutProps) {
  const headerHeight = useHeaderHeight();
  const { resolvedColorScheme } = usePreferences();

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: resolvedColorScheme === "dark" ? Colors.black : Colors.white,
      }}
    >
      {keyboardAware ? (
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          enableOnAndroid
          enableAutomaticScroll
          enableResetScrollToCoords={false}
          extraScrollHeight={24}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="never"
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={headerHeight}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
