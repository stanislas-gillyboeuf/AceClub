import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";
import { authClient } from "@/lib/auth-client";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, withTiming, withDelay } from "react-native-reanimated";
import { onboardingColors } from "../theme";

interface PhotoStepProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onSkip: () => void;
  firstName: string;
}

export function PhotoStep({ imageUri, onImageSelected, onSkip, firstName }: PhotoStepProps) {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name ?? "U";

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text entering={FadeIn.delay(100).duration(400)} style={styles.title}>
          {firstName ? `Montre-nous qui tu es, ${firstName}` : "Montre-nous qui tu es"}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(250).duration(400)} style={styles.subtitle}>
          Tes futurs partenaires veulent savoir à quoi tu ressembles.
        </Animated.Text>
      </View>

      <Animated.View
        entering={() => {
          "worklet";
          return {
            initialValues: { opacity: 0, transform: [{ scale: 0.96 }] },
            animations: {
              opacity: withDelay(300, withTiming(1, { duration: 350 })),
              transform: [{ scale: withDelay(300, withTiming(1, { duration: 400 })) }],
            },
          };
        }}
        style={styles.photoSection}
      >
        <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={16} color={onboardingColors.accentForeground} />
          </View>
        </Pressable>

        <Text style={styles.tapText}>
          {imageUri ? "Appuie pour changer de photo" : "Appuie pour choisir une photo"}
        </Text>

        {!imageUri && (
          <Pressable onPress={onSkip} hitSlop={8} style={styles.skipButton}>
            <Text style={styles.skipText}>Passer pour l&apos;instant</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: onboardingColors.fg,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: onboardingColors.fgDim,
    lineHeight: 22,
  },
  photoSection: {
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 180,
    height: 320,
    borderRadius: 20,
    backgroundColor: onboardingColors.cardBg,
  },
  avatarPlaceholder: {
    width: 180,
    height: 320,
    borderRadius: 20,
    backgroundColor: onboardingColors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    borderStyle: "dashed",
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: "700",
    color: onboardingColors.fg,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: onboardingColors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: onboardingColors.bg,
  },
  tapText: {
    fontSize: 14,
    color: onboardingColors.fgDim,
  },
  skipButton: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: onboardingColors.fg,
    textDecorationLine: "underline",
  },
});
