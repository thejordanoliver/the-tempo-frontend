import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const isNative = Platform.OS !== "web";

export const getSecureAccessToken = async () => {
  if (isNative) {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

    if (token) {
      return token;
    }
  }

  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getSecureRefreshToken = async () => {
  if (isNative) {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (token) {
      return token;
    }
  }

  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const saveSecureTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  if (isNative) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);

    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    return;
  }

  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
};

export const clearSecureTokens = async () => {
  if (isNative) {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  }

  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};
