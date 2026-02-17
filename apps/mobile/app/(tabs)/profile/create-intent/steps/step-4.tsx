import { View, Text, TextInput, StyleSheet } from "react-native";
import { GlassView } from "expo-glass-effect";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateIntentFormStore } from "@/store/create-intent-form";
import { semanticColors, radii } from "@/constants/theme";

export default function Step4() {
  const scheme = useColorScheme();
  const description = useCreateIntentFormStore((s) => s.description);
  const setDescription = useCreateIntentFormStore((s) => s.setDescription);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
      >
        Des précisions ?
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: semanticColors.labelSecondary[scheme] },
        ]}
      >
        Ajoute des précisions : niveau recherché, lieu préféré...
      </Text>

      <GlassView style={styles.inputCard}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Je cherche un partenaire de niveau intermédiaire..."
          placeholderTextColor={semanticColors.labelTertiary[scheme]}
          multiline
          numberOfLines={4}
          style={[
            styles.textInput,
            { color: semanticColors.labelPrimary[scheme] },
          ]}
          textAlignVertical="top"
        />
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
  },
  inputCard: {
    borderRadius: radii.md,
    padding: 12,
    minHeight: 100,
  },
  textInput: {
    fontSize: 16,
    minHeight: 80,
    padding: 0,
  },
});
