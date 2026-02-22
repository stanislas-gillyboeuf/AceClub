import { View, Text, Pressable, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import * as Location from "expo-location";
import { colors } from "@/constants/theme";
import { StepHeader } from "./step-header";
import { LocationIllustration } from "./location-illustration";
import Button from "@/components/ui/button";

interface LocationStepProps {
  onComplete: () => void;
}

export function LocationStep({ onComplete }: LocationStepProps) {
  const handleActivate = async () => {
    await Location.requestForegroundPermissionsAsync();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StepHeader
        icon={MapPin}
        title="Trouve des joueurs"
        subtitle="Decouvre les joueurs et clubs autour de toi."
      />

      <View style={styles.illustrationContainer}>
        <LocationIllustration />
      </View>

      <View style={styles.footer}>
        <Button label="Activer la localisation" onPress={handleActivate} />
        <Pressable onPress={onComplete} style={styles.skipButton}>
          <Text style={styles.skipText}>Pas maintenant</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    color: colors.gray500,
    fontWeight: "500",
  },
});
