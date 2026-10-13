import { Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  /** "default": small, muted (most sections). "prominent": bigger, full-contrast label text —
   * used where the title needs to read as a real heading next to a muted action link. */
  variant?: "default" | "prominent";
}

export function SectionHeader({ title, variant = "default" }: SectionHeaderProps) {
  const scheme = useColorScheme();
  const isProminent = variant === "prominent";

  return (
    <Text
      style={[
        styles.title,
        isProminent && styles.titleProminent,
        { color: isProminent ? semanticColors.labelPrimary[scheme] : semanticColors.labelSecondary[scheme] },
      ]}
    >
      {title.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleProminent: {
    fontSize: 15,
    fontWeight: "700",
  },
});
