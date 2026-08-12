import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { courtColors, courtFonts } from "../../theme";

interface DarkChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function DarkChip({ label, active, onPress, style }: DarkChipProps) {
  return (
    <Pressable onPress={onPress} style={style}>
      <Text
        style={[
          styles.chip,
          {
            backgroundColor: active ? courtColors.ball : courtColors.ink2,
            color: active ? courtColors.ink : courtColors.chalk,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 14,
    overflow: "hidden",
  },
});
