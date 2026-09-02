import { Pressable, View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";

interface CheckboxOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CheckboxGroupProps<T extends string> {
  options: CheckboxOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
}

export function CheckboxGroup<T extends string>({
  options,
  selected,
  onToggle,
}: CheckboxGroupProps<T>) {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => onToggle(option.value)}
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
                styles.checkbox,
                {
                  borderColor: isSelected
                    ? colors.accentGreen
                    : semanticColors.labelTertiary[scheme],
                  backgroundColor: isSelected ? colors.accentGreen : "transparent",
                },
              ]}
            >
              {isSelected && <Check size={14} color={colors.white} strokeWidth={2.5} />}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
