import { View, Text, Pressable, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { colors } from "@/constants/theme";
import { StepHeader } from "./step-header";
import { NotificationIllustration } from "./notification-illustration";
import Button from "@/components/ui/button";

interface NotificationStepProps {
  onComplete: () => void;
}

export function NotificationStep({ onComplete }: NotificationStepProps) {
  const handleActivate = async () => {
    await Notifications.requestPermissionsAsync();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StepHeader
        icon={Bell}
        title="Reste informe"
        subtitle="Ne rate aucune invitation, message ou mise a jour de tes partenaires."
      />

      <View style={styles.illustrationContainer}>
        <NotificationIllustration />
      </View>

      <View style={styles.footer}>
        <Button label="Activer les notifications" onPress={handleActivate} />
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
