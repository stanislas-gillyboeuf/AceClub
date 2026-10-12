import { View, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

interface AvatarStackProps {
  avatars: { imageUrl?: string | null; name?: string | null }[];
  size?: number;
}

/** A handful of overlapping avatars (event/match participant previews). */
export function AvatarStack({ avatars, size = 24 }: AvatarStackProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.row}>
      {avatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.ring,
            {
              width: size + 4,
              height: size + 4,
              borderRadius: (size + 4) / 2,
              borderColor: semanticColors.cardBackground[scheme],
              marginLeft: index === 0 ? 0 : -size * 0.4,
              zIndex: avatars.length - index,
            },
          ]}
        >
          <Avatar imageUrl={avatar.imageUrl} name={avatar.name} size={size} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  ring: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
