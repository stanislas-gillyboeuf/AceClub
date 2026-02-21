import { Platform, View, StyleSheet } from "react-native";
import { AppleMaps } from "expo-maps";
import { colors, radii } from "@/constants/theme";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export function MapPreview({ latitude, longitude, title }: MapPreviewProps) {
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
            tintColor: colors.accentGreen,
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
