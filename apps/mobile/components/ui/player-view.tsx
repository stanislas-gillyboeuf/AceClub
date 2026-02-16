import { View, Text, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

interface PlayerViewProps {
  name: string;
  imageUrl?: string | null;
  avatarSize?: number;
  isWinner?: boolean;
  showCrown?: boolean;
}

export function PlayerView({
  name,
  imageUrl,
  avatarSize = 36,
  isWinner = false,
  showCrown = true,
}: PlayerViewProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Avatar imageUrl={imageUrl} name={name} size={avatarSize} />
      <View style={styles.nameRow}>
        <Text
          style={[
            styles.name,
            {
              fontWeight: isWinner ? "700" : "400",
              color: semanticColors.labelPrimary[scheme],
            },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
        {isWinner && showCrown && (
          <Crown size={12} color="#FFD700" fill="#FFD700" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    flexShrink: 1,
  },
});
