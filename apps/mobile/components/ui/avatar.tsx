import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/constants/theme";

interface AvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 400;

function getInitials(name?: string | null): string {
  if (!name) return "?";
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

  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [imageUrl]);

  const handleError = () => {
    if (attempt < MAX_RETRIES) {
      setTimeout(() => setAttempt((a) => a + 1), RETRY_DELAY_MS);
    } else {
      setFailed(true);
    }
  };

  if (imageUrl && !failed) {
    return (
      <Image
        key={`${imageUrl}-${attempt}`}
        recyclingKey={imageUrl}
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={handleError}
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
