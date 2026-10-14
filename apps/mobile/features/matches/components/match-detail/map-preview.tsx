import { Platform, View, StyleSheet } from "react-native";
import { AppleMaps } from "expo-maps";
import { semanticColors, radii } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export function MapPreview({ latitude, longitude, title }: MapPreviewProps) {
  const scheme = useColorScheme();
  if (Platform.OS !== "ios") return null;

  return (
    <View style={styles.container}>
      <AppleMaps.View
        style={styles.map}
        cameraPosition={{
          coordinates: { latitude, longitude },
          zoom: 14,
        }}
        markers={[
          {
            coordinates: { latitude, longitude },
            title,
            tintColor: semanticColors.accentGreen[scheme],
            systemImage: "tennisball.fill",
          },
        ]}
        uiSettings={{
          compassEnabled: false,
          myLocationButtonEnabled: false,
          scaleBarEnabled: false,
          togglePitchEnabled: false,
        }}
        properties={{
          selectionEnabled: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});
