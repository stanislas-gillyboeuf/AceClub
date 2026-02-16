import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radii } from "@/constants/theme";
import { Camera } from "lucide-react-native";
import { StepHeader } from "./step-header";
import { authClient } from "@/lib/auth-client";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

interface PhotoStepProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
}

export function PhotoStep({ imageUri, onImageSelected }: PhotoStepProps) {
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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <StepHeader
        icon={Camera}
        title="Ta photo de profil"
        subtitle="Les autres joueurs pourront te reconnaitre"
      />

      <View style={styles.photoSection}>
        <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={16} color={colors.white} />
          </View>
        </Pressable>

        <Text style={styles.tapText}>
          {imageUri
            ? "Appuie pour changer de photo"
            : "Appuie pour choisir une photo"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoSection: {
    alignItems: "center",
    paddingTop: 16,
    gap: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${colors.accentGreen}15`,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: `${colors.accentGreen}30`,
    borderStyle: "dashed",
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.accentGreen,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tapText: {
    fontSize: 15,
    color: colors.gray400,
  },
});
