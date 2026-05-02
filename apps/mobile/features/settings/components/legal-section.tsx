import { View, StyleSheet, Linking } from "react-native";
import { FileText, Hand } from "lucide-react-native";
import { SectionCard } from "@/components/ui/section-card";
import { SettingsRow } from "@/components/ui/settings-row";
import { semanticColors } from "@/constants/theme";

interface LegalSectionProps {
  scheme: "light" | "dark";
}

export function LegalSection({ scheme }: LegalSectionProps) {
  return (
    <SectionCard title="Légal">
      <SettingsRow
        icon={<FileText size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />}
        label="Conditions Générales d'Utilisation"
        onPress={() => Linking.openURL("https://aceclub.app/terms")}
      />
      <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />
      <SettingsRow
        icon={<Hand size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />}
        label="Politique de Confidentialité"
        onPress={() => Linking.openURL("https://aceclub.app/privacy")}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
});
