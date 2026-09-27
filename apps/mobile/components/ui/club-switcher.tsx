import { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { semanticColors, colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ClubOption {
  id: string;
  name: string;
}

interface ClubSwitcherProps {
  clubs: ClubOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Generic club switcher for player-facing screens (feed, discover, matches).
 * Same interaction pattern as `features/court-booking/components/club-selector`,
 * but themed with the app's semantic colors instead of the booking screen's
 * fixed green, so it can sit in any header.
 */
export function ClubSwitcher({ clubs, selectedId, onSelect }: ClubSwitcherProps) {
  const scheme = useColorScheme();
  const [open, setOpen] = useState(false);
  const selected = clubs.find((c) => c.id === selectedId);
  const canSwitch = clubs.length > 1;

  if (!selected) return null;

  return (
    <>
      <Pressable
        onPress={() => canSwitch && setOpen(true)}
        disabled={!canSwitch}
        style={styles.trigger}
        hitSlop={6}
      >
        <Text
          style={[styles.label, { color: semanticColors.labelPrimary[scheme] }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selected.name}
        </Text>
        {canSwitch && <ChevronDown size={14} color={semanticColors.labelSecondary[scheme]} strokeWidth={2.5} />}
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.panelWrap}>
            <View
              style={[
                styles.panel,
                { backgroundColor: semanticColors.cardBackground[scheme], borderColor: semanticColors.borderColor[scheme] },
              ]}
            >
              {clubs.map((club) => (
                <Pressable
                  key={club.id}
                  onPress={() => {
                    onSelect(club.id);
                    setOpen(false);
                  }}
                  style={styles.item}
                >
                  <Text
                    style={[styles.itemText, { color: semanticColors.labelPrimary[scheme] }]}
                    numberOfLines={1}
                  >
                    {club.name}
                  </Text>
                  {club.id === selectedId && <Check size={16} color={colors.accentGreen} strokeWidth={2.5} />}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  backdrop: {
    flex: 1,
  },
  panelWrap: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemText: {
    flex: 1,
    fontWeight: "600",
    fontSize: 14,
  },
});
