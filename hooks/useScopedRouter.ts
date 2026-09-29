import { useRouter as useExpoRouter, useSegments } from "expo-router";
import { useMemo } from "react";
import { getTabGroup, scopeHrefToTab } from "utils/tabStackNavigation";

type ExpoRouter = ReturnType<typeof useExpoRouter>;

export function useScopedRouter(): ExpoRouter {
  const router = useExpoRouter();
  const segments = useSegments();
  const tabGroup = getTabGroup(segments as readonly string[]);

  return useMemo(
    () => ({
      ...router,
      push: ((href, options) =>
        router.push(scopeHrefToTab(href, tabGroup), options)) as ExpoRouter["push"],
      navigate: ((href, options) =>
        router.navigate(
          scopeHrefToTab(href, tabGroup),
          options,
        )) as ExpoRouter["navigate"],
      replace: ((href, options) =>
        router.replace(
          scopeHrefToTab(href, tabGroup),
          options,
        )) as ExpoRouter["replace"],
    }),
    [router, tabGroup],
  );
}
