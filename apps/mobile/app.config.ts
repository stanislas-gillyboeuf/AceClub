import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "AceClub",
  slug: "aceclub",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "aceclub",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "dev.aceclub.app",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },
  androidNavigationBar: {
    backgroundColor: "#000000",
    barStyle: "light-content",
  },
  androidStatusBar: {
    barStyle: "light-content",
    backgroundColor: "transparent",
    translucent: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "dev.aceclub.app",
    ...(process.env.GOOGLE_SERVICES_JSON
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON }
      : {}),
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "aceclub" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    "expo-image-picker",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "AceClub utilise ta position pour trouver des joueurs à proximité.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
      },
    ],
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.131274084335-lv3cs6n1eqajr5letmpgm57alipg51gb",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
});
