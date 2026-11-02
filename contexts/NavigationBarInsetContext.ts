import { createContext } from "react";
import { useWindowDimensions } from "react-native";

export const NAVIGATION_BAR_ROW_HEIGHT = 70;
export const NavigationBarInsetContext = createContext(0);

export function useNavigationBarRowHeight() {
  const { fontScale } = useWindowDimensions();
  return Math.max(NAVIGATION_BAR_ROW_HEIGHT, 48 + 18 * fontScale);
}
