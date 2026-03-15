import { View, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Building2, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { colors, radii } from "@/constants/theme";

interface OrgLogoEditorProps {
  logoUri: string | null | undefined;
  onPick: (asset: ImagePicker.ImagePickerAsset) => void;
}

export function OrgLogoEditor({ logoUri, onPick }: OrgLogoEditorProps) {
  const handlePress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0]);
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {logoUri ? (
        <Image
          source={{ uri: logoUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.placeholder}>
          <Building2 size={40} color={colors.accentGreen} strokeWidth={1.5} />
        </View>
      )}
      <View style={styles.cameraBadge}>
        <Camera size={16} color="#FFFFFF" strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const LOGO_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignSelf: "center",
  },
  image: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radii.md,
  },
  placeholder: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radii.md,
    backgroundColor: `${colors.accentGreen}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
});
