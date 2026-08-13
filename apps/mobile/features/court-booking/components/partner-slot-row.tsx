import { View, Text, Pressable, StyleSheet } from "react-native";
import { courtColors } from "../theme";

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
  return (
    <Pressable onPress={onPress} style={[styles.row, name ? styles.rowFilled : styles.rowEmpty]}>
      <View style={[styles.avatar, name && styles.avatarFilled]}>
        <Text style={[styles.avatarText, name && styles.avatarTextFilled]}>
          {name ? initials(name) : "+"}
        </Text>
      </View>
      <Text style={styles.text} numberOfLines={1}>
        {name ?? `${label} — ajouter`}
      </Text>
      {name && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>✕</Text>
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
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.line,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rowFilled: {
    borderColor: courtColors.chartreuseDim,
  },
  rowEmpty: {
    borderStyle: "dashed",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: courtColors.ink650,
    borderWidth: 1,
    borderColor: courtColors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFilled: {
    backgroundColor: courtColors.chartreuse,
    borderColor: courtColors.chartreuse,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "600",
    color: courtColors.chalkDim,
  },
  avatarTextFilled: {
    color: courtColors.ink900,
  },
  text: {
    flex: 1,
    fontWeight: "700",
    fontSize: 13,
    color: courtColors.chalk,
  },
  remove: {
    color: courtColors.chalkFaint,
    fontSize: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
