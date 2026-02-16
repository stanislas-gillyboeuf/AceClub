import { Pressable, View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";

interface RadioOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
}

export function RadioGroup<T extends string>({
  options,
  selected,
  onSelect,
}: RadioGroupProps<T>) {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => [
              styles.option,
              pressed ? { opacity: 0.6 } : undefined,
            ]}
          >
            {option.icon && <View style={styles.iconContainer}>{option.icon}</View>}
            <Text
              style={[
                styles.label,
                { color: semanticColors.labelPrimary[scheme] },
              ]}
            >
              {option.label}
            </Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected
                    ? colors.accentGreen
                    : semanticColors.labelTertiary[scheme],
                },
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  iconContainer: {
    width: 28,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentGreen,
  },
});
