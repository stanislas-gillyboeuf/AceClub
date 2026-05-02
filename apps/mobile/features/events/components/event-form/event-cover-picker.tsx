import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { semanticColors, radii } from "@/constants/theme";

interface EventCoverPickerProps {
  imageUri: string | null;
  onPick: (uri: string) => void;
  scheme: "light" | "dark";
}

export function EventCoverPicker({ imageUri, onPick, scheme }: EventCoverPickerProps) {
  const handlePress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0].uri);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <GlassView style={styles.container}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <ImagePlus
              size={32}
              color={semanticColors.labelTertiary[scheme]}
              strokeWidth={1.5}
            />
            <Text style={[styles.placeholderText, { color: semanticColors.labelSecondary[scheme] }]}>
              Ajouter une image de couverture
            </Text>
          </View>
        )}
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    overflow: "hidden",
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
  },
});
