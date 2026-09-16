import { useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Keyboard, View } from "react-native";
import PagerView from "react-native-pager-view";
import ConfirmModal from "components/ConfirmModal";
import CropEditorModal from "components/CropEditorModal";
import { CustomHeader, type AuthHeaderTab } from "components/CustomHeader";
import SignInForm from "components/Forms/SignInForm";
import SignUpForm from "components/Forms/SignUpForm";
import { usePreferences } from "contexts/PreferencesContext";
import { useLoginForm } from "hooks/UserHooks/useLoginForm";
import { usePagerTabScrollProgress } from "hooks/usePagerTabScrollProgress";
import { formStyles } from "styles/FormStyles";

const AUTH_TABS = ["sign in", "sign up"] as const;
const AUTH_PAGE_GUTTER = 16;
const SIGNUP_TITLES = [
  "Create Account",
  "Email & Password",
  "Select Favorites",
  "Upload Images",
  "Review Details",
];

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const styles = formStyles(resolvedColorScheme === "dark");
  const {
    signIn, signUp, cropEditor, alertConfig, closeAlert,
    previousSignupStep, toggleLayout,
  } = useLoginForm();
  const pagerRef = useRef<PagerView>(null);
  const [selectedTab, setSelectedTab] = useState<AuthHeaderTab>("sign in");
  const { scrollProgress, handlePageScroll } = usePagerTabScrollProgress();
  const { signupStep, isGridView } = signUp;
  const isSignup = selectedTab === "sign up";
  const showAuthTabs = !isSignup || signupStep === 0;
  const isSubmitting = signIn.isSubmitting || signUp.isSubmitting;

  const selectTab = useCallback((tab: AuthHeaderTab) => {
    if (isSubmitting) return;
    Keyboard.dismiss();
    pagerRef.current?.setPage(AUTH_TABS.indexOf(tab));
  }, [isSubmitting]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={isSignup ? SIGNUP_TITLES[signupStep] : "Sign In"}
          tabName="Login"
          onBack={previousSignupStep}
          showBackButton={isSignup && signupStep > 0}
          authSelectedTab={selectedTab}
          onAuthTabPress={showAuthTabs ? selectTab : undefined}
          authScrollProgress={scrollProgress}
          isGrid={isGridView}
          onToggleLayout={isSignup && signupStep === 2 ? toggleLayout : undefined}
        />
      ),
    });
  }, [
    navigation, isSignup, signupStep, previousSignupStep, selectedTab,
    showAuthTabs, selectTab, scrollProgress, isGridView, toggleLayout,
  ]);

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.sectionContainer}
        initialPage={0}
        pageMargin={AUTH_PAGE_GUTTER}
        scrollEnabled={showAuthTabs && !isSubmitting && !signUp.isValidating}
        keyboardDismissMode="on-drag"
        onPageScroll={handlePageScroll}
        onPageSelected={({ nativeEvent }) => {
          setSelectedTab(AUTH_TABS[nativeEvent.position]);
        }}
      >
        <View key="sign in" collapsable={false} style={{ width: "100%", height: "100%" }}>
          <SignInForm
            {...signIn}
            onForgotPassword={() => router.push("/forgot-password")}
          />
        </View>
        <View key="sign up" collapsable={false} style={{ width: "100%", height: "100%" }}>
          <SignUpForm {...signUp} />
        </View>
      </PagerView>
      {cropEditor && <CropEditorModal {...cropEditor} />}
      <ConfirmModal
        visible={Boolean(alertConfig)}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        showCancel={alertConfig?.showCancel ?? Boolean(alertConfig?.cancelText)}
        confirmDisabled={alertConfig?.confirmDisabled}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={alertConfig?.onConfirm ?? closeAlert}
      />
    </View>
  );
}
