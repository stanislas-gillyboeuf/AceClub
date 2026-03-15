import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { colors } from "@/constants/theme";
import { NotificationIllustration } from "./notification-illustration";
import Button from "@/components/ui/button";
import Animated, { FadeIn } from "react-native-reanimated";

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
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          Reste informé
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          Ne rate aucune invitation, message ou mise à jour de tes partenaires.
        </Animated.Text>
      </View>

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
  header: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.37,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.gray500,
    lineHeight: 22,
  },
  illustrationContainer: {
    flex: 1,
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
