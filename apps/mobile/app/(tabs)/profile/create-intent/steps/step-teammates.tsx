import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateIntentFormStore } from "@/store/create-intent-form";
import { UserSearchField } from "@/features/matches/components/user-search-field";
import { semanticColors } from "@/constants/theme";
import { useMe } from "@/hooks/use-user";

export default function StepTeammates() {
  const scheme = useColorScheme();
  const teammates = useCreateIntentFormStore((s) => s.teammates);
  const setTeammate = useCreateIntentFormStore((s) => s.setTeammate);
  const { data: me } = useMe();

  const selectedIds = teammates.filter((t): t is NonNullable<typeof t> => t !== null).map((t) => t.id);
  const excludedIds = me ? [...selectedIds, me.id] : selectedIds;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
        Tes coéquipiers (optionnel)
      </Text>
      <Text style={[styles.subtitle, { color: semanticColors.labelSecondary[scheme] }]}>
        Ajoute les joueurs que tu as déjà pour ton équipe de padel. Les places restantes seront
        ouvertes aux autres joueurs.
      </Text>

      <View style={styles.fields}>
        {[0, 1, 2].map((slotIndex) => (
          <UserSearchField
            key={slotIndex}
            label={`Joueur ${slotIndex + 2}`}
            selectedUser={teammates[slotIndex]}
            onSelect={(user) => setTeammate(slotIndex, user)}
            excludedUserIds={excludedIds}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  fields: {
    gap: 16,
  },
});
