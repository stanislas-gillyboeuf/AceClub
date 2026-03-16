import { useState, useCallback, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AppleMaps } from "expo-maps";
import { MapPin } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { geocodeAddress, reverseGeocode } from "@/lib/geocoding";

interface LocationPickerProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (location: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  }) => void;
  /** Show "Adresse du club" subtitle */
  isOrgAddress?: boolean;
}

export function LocationPicker({
  address,
  latitude,
  longitude,
  onLocationChange,
  isOrgAddress,
}: LocationPickerProps) {
  const scheme = useColorScheme();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Clean up debounce timer and abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const handleAddressChange = useCallback(
    (text: string) => {
      onLocationChange({ address: text, latitude: null, longitude: null });

      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();

      if (text.trim().length < 5) return;

      debounceRef.current = setTimeout(async () => {
        abortRef.current = new AbortController();
        setIsGeocoding(true);
        const result = await geocodeAddress(text.trim(), abortRef.current.signal);
        setIsGeocoding(false);

        if (result) {
          onLocationChange({
            address: text,
            latitude: result.latitude,
            longitude: result.longitude,
          });
        }
      }, 800);
    },
    [onLocationChange],
  );

  const handleMapPress = useCallback(
    async (coords: { latitude: number; longitude: number }) => {
      onLocationChange({
        address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setIsGeocoding(true);
      const result = await reverseGeocode(coords.latitude, coords.longitude, abortRef.current.signal);
      setIsGeocoding(false);

      if (result) {
        onLocationChange({
          address: result,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
    },
    [address, onLocationChange],
  );

  return (
    <GlassView style={styles.fieldCard}>
      <Text
        style={[
          styles.sectionLabel,
          { color: semanticColors.labelSecondary[scheme] },
        ]}
      >
        LIEU
      </Text>
      <View style={styles.optionRow}>
        <MapPin
          size={20}
          color={address ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
          strokeWidth={1.5}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.inputRow}>
            <TextInput
              value={address}
              onChangeText={handleAddressChange}
              placeholder="Ajouter une adresse"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              style={[
                styles.addressInput,
                { color: semanticColors.labelPrimary[scheme] },
              ]}
            />
            {isGeocoding && (
              <ActivityIndicator
                size="small"
                color={semanticColors.labelTertiary[scheme]}
              />
            )}
          </View>
          {isOrgAddress && address.length > 0 && (
            <Text
              style={[
                styles.addressSubtitle,
                { color: semanticColors.labelTertiary[scheme] },
              ]}
            >
              Adresse du club
            </Text>
          )}
        </View>
      </View>

      {/* iOS: Interactive map */}
      {Platform.OS === "ios" && (
        <IOSMapPicker
          latitude={latitude}
          longitude={longitude}
          address={address}
          onMapPress={handleMapPress}
        />
      )}
    </GlassView>
  );
}

const IOSMapPicker = memo(function IOSMapPicker({
  latitude,
  longitude,
  address,
  onMapPress,
}: {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onMapPress: (coords: { latitude: number; longitude: number }) => void;
}) {
  // Default to Paris if no coords
  const lat = latitude ?? 48.8566;
  const lng = longitude ?? 2.3522;
  const hasCoords = latitude != null && longitude != null;

  return (
    <View style={styles.mapContainer}>
      <AppleMaps.View
        style={styles.map}
        cameraPosition={{
          coordinates: { latitude: lat, longitude: lng },
          zoom: hasCoords ? 15 : 5,
        }}
        markers={
          hasCoords
            ? [
                {
                  coordinates: { latitude: lat, longitude: lng },
                  title: address || "Lieu de l'event",
                  tintColor: colors.accentGreen,
                  systemImage: "mappin.circle.fill",
                },
              ]
            : []
        }
        uiSettings={{
          compassEnabled: false,
          myLocationButtonEnabled: false,
          scaleBarEnabled: false,
          togglePitchEnabled: false,
        }}
        onMapClick={(e) => {
          const { latitude: lat, longitude: lng } = e.coordinates;
          if (lat != null && lng != null) {
            onMapPress({ latitude: lat, longitude: lng });
          }
        }}
      />
      {!hasCoords && (
        <View style={styles.mapHint} pointerEvents="none">
          <Text style={styles.mapHintText}>
            Touchez la carte pour placer le lieu
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fieldCard: {
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressInput: {
    fontSize: 16,
    flex: 1,
  },
  addressSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: {
    height: 200,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  mapHint: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  mapHintText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
});
