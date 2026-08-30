import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchMembers } from "@/hooks/use-court";
import type { FrequentPartner } from "@/types/court";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface Selection {
  userId?: string;
  guestName?: string;
  name: string;
}

interface PartnerSearchExpandProps {
  organizationId?: string;
  suggestions: FrequentPartner[];
  onSelect: (selection: Selection) => void;
}

export function PartnerSearchExpand({ organizationId, suggestions, onSelect }: PartnerSearchExpandProps) {
  const scheme = useColorScheme();
  const [query, setQuery] = useState("");
  const { data: results } = useSearchMembers(organizationId, query.length >= 2 ? query : undefined);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: semanticColors.systemGray6[scheme], borderColor: semanticColors.borderColor[scheme] },
      ]}
    >
      {suggestions.length > 0 && (
        <View style={styles.avatarRow}>
          {suggestions.map((partner) => (
            <Pressable
              key={partner.userId}
              onPress={() => onSelect({ userId: partner.userId, name: partner.name })}
              style={styles.avatarChip}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: semanticColors.cardBackground[scheme], borderColor: semanticColors.borderColor[scheme] },
                ]}
              >
                <Text style={[styles.avatarText, { color: semanticColors.labelSecondary[scheme] }]}>
                  {initials(partner.name)}
                </Text>
              </View>
              <Text style={[styles.avatarLabel, { color: semanticColors.labelSecondary[scheme] }]} numberOfLines={1}>
                {partner.name.split(" ")[0]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Ou tape un nom…"
        placeholderTextColor={semanticColors.labelTertiary[scheme]}
        style={[
          styles.input,
          {
            backgroundColor: semanticColors.cardBackground[scheme],
            borderColor: semanticColors.borderColor[scheme],
            color: semanticColors.labelPrimary[scheme],
          },
        ]}
        onSubmitEditing={() => {
          if (query.trim().length > 0) onSelect({ guestName: query.trim(), name: query.trim() });
        }}
      />

      {results && results.length > 0 && (
        <View style={styles.results}>
          {results.map((member) => (
            <Pressable
              key={member.userId}
              onPress={() => onSelect({ userId: member.userId, name: member.name })}
              style={styles.resultRow}
            >
              <Text style={[styles.resultText, { color: semanticColors.labelPrimary[scheme] }]}>{member.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
  },
  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 10,
  },
  avatarChip: {
    alignItems: "center",
    gap: 5,
    width: 56,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "600",
    fontSize: 12,
  },
  avatarLabel: {
    fontSize: 9.5,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    fontWeight: "600",
    fontSize: 13.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  results: {
    marginTop: 8,
    gap: 4,
  },
  resultRow: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  resultText: {
    fontWeight: "600",
    fontSize: 13,
  },
});
