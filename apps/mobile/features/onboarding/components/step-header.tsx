import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import type { LucideIcon } from "lucide-react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

interface StepHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function StepHeader({ icon: Icon, title, subtitle }: StepHeaderProps) {
  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.duration(400)} style={styles.iconBox}>
        <Icon size={36} color={colors.accentGreen} />
      </Animated.View>
      <Animated.Text entering={FadeIn.delay(200).duration(400)} style={styles.title}>
        {title}
      </Animated.Text>
      <Animated.Text entering={FadeIn.delay(350).duration(400)} style={styles.subtitle}>
        {subtitle}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: "center",
    lineHeight: 22,
  },
});
