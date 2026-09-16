import { CustomHeader } from "components/CustomHeader";
import ForgotPasswordForm from "components/Forms/ForgotPasswordForm";
import { useNavigation, useRouter } from "expo-router";
import { useForgotPasswordForm } from "hooks/UserHooks/useForgotPasswordForm";
import { useCallback, useLayoutEffect } from "react";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const returnToLogin = useCallback(() => router.replace("/login"), [router]);
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else returnToLogin();
  }, [router, returnToLogin]);
  const form = useForgotPasswordForm(returnToLogin);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title="Forgot Password"
          tabName="Forgot Password"
          onBack={goBack}
        />
      ),
    });
  }, [navigation, goBack]);

  return <ForgotPasswordForm form={form} onBack={goBack} />;
}
