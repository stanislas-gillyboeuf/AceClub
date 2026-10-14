import { View, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Building2, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { semanticColors, radii } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface OrgLogoEditorProps {
  logoUri: string | null | undefined;
  onPick: (asset: ImagePicker.ImagePickerAsset) => void;
}

export function OrgLogoEditor({ logoUri, onPick }: OrgLogoEditorProps) {
  const scheme = useColorScheme();
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
        <View
          style={[styles.placeholder, { backgroundColor: `${semanticColors.accentGreen[scheme]}1A` }]}
        >
          <Building2 size={40} color={semanticColors.accentGreen[scheme]} strokeWidth={1.5} />
        </View>
      )}
      <View style={[styles.cameraBadge, { backgroundColor: semanticColors.accentGreen[scheme] }]}>
        <Camera size={16} color={semanticColors.onAccentGreen[scheme]} strokeWidth={2} />
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
    alignItems: "center",
    justifyContent: "center",
  },
});
