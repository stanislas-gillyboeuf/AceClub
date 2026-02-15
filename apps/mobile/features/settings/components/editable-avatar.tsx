import { Pressable, View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/constants/theme";

interface EditableAvatarProps {
  imageUrl?: string | null;
  localImageUri?: string | null;
  name: string;
  size?: number;
  isUploading?: boolean;
  onImageSelected: (result: ImagePicker.ImagePickerAsset) => void;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function EditableAvatar({
  imageUrl,
  localImageUri,
  name,
  size = 100,
  isUploading = false,
  onImageSelected,
}: EditableAvatarProps) {
  const displayUri = localImageUri ?? imageUrl;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès à vos photos pour changer votre photo de profil.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0]);
    }
  };

  return (
    <Pressable onPress={pickImage} disabled={isUploading} style={styles.container}>
      {displayUri ? (
        <Image
          source={{ uri: displayUri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.3 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Camera badge */}
      <View style={styles.cameraBadge}>
        {isUploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Camera size={14} color="#FFFFFF" strokeWidth={2} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  image: {
    backgroundColor: `${colors.accentGreen}26`,
  },
  placeholder: {
    backgroundColor: `${colors.accentGreen}26`,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.accentGreen,
    fontWeight: "600",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
