import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface PartnerSlotRowProps {
  label: string;
  name: string | null;
  onPress: () => void;
  onRemove: () => void;
}

export function PartnerSlotRow({ label, name, onPress, onRemove }: PartnerSlotRowProps) {
  const scheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: semanticColors.systemGray6[scheme],
          borderColor: name ? colors.accentGreen : semanticColors.borderColor[scheme],
          borderStyle: name ? "solid" : "dashed",
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: name ? colors.accentGreen : semanticColors.cardBackground[scheme],
            borderColor: name ? colors.accentGreen : semanticColors.borderColor[scheme],
          },
        ]}
      >
        <Text style={[styles.avatarText, { color: name ? colors.white : semanticColors.labelSecondary[scheme] }]}>
          {name ? initials(name) : "+"}
        </Text>
      </View>
      <Text style={[styles.text, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
        {name ?? `${label} — ajouter`}
      </Text>
      {name && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={[styles.remove, { color: semanticColors.labelTertiary[scheme] }]}>✕</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "600",
  },
  text: {
    flex: 1,
    fontWeight: "700",
    fontSize: 13,
  },
  remove: {
    fontSize: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
