import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, radii } from "@/constants/theme";

interface FormFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string | null;
}

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
        {label}
      </Text>
      <TextInput
        {...inputProps}
        style={[
          styles.input,
          {
            color: semanticColors.labelPrimary[scheme],
            backgroundColor: semanticColors.cardBackground[scheme],
            borderColor: error ? "#ef4444" : semanticColors.borderColor[scheme],
          },
        ]}
        placeholderTextColor={semanticColors.labelTertiary[scheme]}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  error: {
    fontSize: 13,
    color: "#ef4444",
  },
});
