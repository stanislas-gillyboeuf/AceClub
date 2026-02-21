import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radii } from "@/constants/theme";
import { Users, Trophy, Calendar } from "lucide-react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import Button from "@/components/ui/button";

interface WelcomeStepProps {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="cover"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.welcomeText}>Bienvenue sur</Text>
          <Text style={styles.appName}>Ace Club</Text>
          <Text style={styles.subtitle}>
            Ton compagnon pour le tennis et le padel
          </Text>
        </Animated.View>
      </View>

      <View style={styles.features}>
        <FeatureRow
          icon={Users}
          iconColor={colors.accentOrange}
          title="Trouve des partenaires"
          description="Connecte-toi avec des joueurs de ton niveau"
          delay={500}
        />
        <FeatureRow
          icon={Trophy}
          iconColor={colors.accentGreen}
          title="Suis tes performances"
          description="Progresse et grimpe dans le classement"
          delay={650}
        />
        <FeatureRow
          icon={Calendar}
          iconColor={colors.accentOrange}
          title="Organise tes matchs"
          description="Planifie et gere tes rencontres facilement"
          delay={800}
        />
      </View>

      <Animated.View entering={FadeInDown.delay(950).duration(500)} style={styles.bottomSection}>
        <Button label="C'est parti !" onPress={onStart} />
      </Animated.View>
    </View>
  );
}

function FeatureRow({
  icon: Icon,
  iconColor,
  title,
  description,
  delay,
}: {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      style={styles.featureRow}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${iconColor}15` }]}>
        <Icon size={24} color={iconColor} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  topSection: {
    alignItems: "center",
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 110,
    height: 110,
  },
  welcomeText: {
    fontSize: 18,
    color: colors.gray500,
    textAlign: "center",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.accentGreen,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: "center",
    marginTop: 6,
  },
  features: {
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    gap: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.gray500,
    lineHeight: 19,
  },
  bottomSection: {
    paddingTop: 8,
  },
});
