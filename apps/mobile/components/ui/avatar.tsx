import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/constants/theme";

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size: number;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Avatar({ imageUrl, name, size }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = size * 0.35;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
