import { Modal, Pressable, Text, StyleSheet, useWindowDimensions } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface PopoverState {
  x: number;
  y: number;
  label: string;
}

interface WhoBookedPopoverProps {
  popover: PopoverState | null;
  onDismiss: () => void;
}

const POPOVER_WIDTH = 180;

export function WhoBookedPopover({ popover, onDismiss }: WhoBookedPopoverProps) {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  if (!popover) return null;

  const left = Math.max(8, Math.min(popover.x - POPOVER_WIDTH / 2, width - POPOVER_WIDTH - 8));

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[
            styles.bubble,
            {
              left,
              top: Math.max(popover.y - 54, 8),
              width: POPOVER_WIDTH,
              backgroundColor: semanticColors.cardBackground[scheme],
              borderColor: semanticColors.borderColor[scheme],
            },
          ]}
        >
          <Text style={[styles.text, { color: semanticColors.labelPrimary[scheme] }]}>{popover.label}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  bubble: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 13,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  text: {
    fontWeight: "700",
    fontSize: 12.5,
    textAlign: "center",
  },
});
