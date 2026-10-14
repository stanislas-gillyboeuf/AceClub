import { View, Text, StyleSheet } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { LucideIcon } from "lucide-react-native";
import Animated, { FadeIn, withTiming, withDelay } from "react-native-reanimated";

interface StepHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function StepHeader({ icon: Icon, title, subtitle }: StepHeaderProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Animated.View
        entering={() => {
          'worklet';
          return {
            initialValues: { opacity: 0, transform: [{ scale: 0.85 }] },
            animations: {
              opacity: withTiming(1, { duration: 350 }),
              transform: [{ scale: withTiming(1, { duration: 400 }) }],
            },
          };
        }}
        style={[styles.iconBox, { backgroundColor: `${semanticColors.accentGreen[scheme]}15` }]}
      >
        <Icon size={36} color={semanticColors.accentGreen[scheme]} />
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
