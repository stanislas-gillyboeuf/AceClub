import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PlusCircle } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMatch, useUpdateMatchScores } from "@/hooks/use-match";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { SetScoreEditorRow, type EditableSet } from "@/features/matches/components/edit-scores/set-score-editor-row";
import type { MatchDetail } from "@/types/match";

let keyCounter = 0;
function nextKey() {
  return `set-${++keyCounter}`;
}

function getHomeParticipant(detail: MatchDetail) {
  return detail.participants.find((p) => p.side === "home");
}

function getAwayParticipant(detail: MatchDetail) {
  return detail.participants.find((p) => p.side === "away");
}

function initSets(detail: MatchDetail, homeUserId: string, awayUserId: string): EditableSet[] {
  const sorted = [...detail.sets].sort((a, b) => a.setNumber - b.setNumber);

  if (sorted.length === 0) {
    return [{ key: nextKey(), setNumber: 1, homeScore: 0, awayScore: 0 }];
  }

  return sorted.map((set) => ({
    key: nextKey(),
    setNumber: set.setNumber,
    homeScore: set.scores?.find((s) => s.userId === homeUserId)?.games ?? 0,
    awayScore: set.scores?.find((s) => s.userId === awayUserId)?.games ?? 0,
  }));
}

export default function EditScores() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();

  const { data: matchDetail } = useMatch(id);
  const updateScores = useUpdateMatchScores();

  const home = matchDetail ? getHomeParticipant(matchDetail) : undefined;
  const away = matchDetail ? getAwayParticipant(matchDetail) : undefined;
  const homeName = home?.user?.name ?? "Joueur 1";
  const awayName = away?.user?.name ?? "Joueur 2";
  const homeUserId = home?.userId ?? "";
  const awayUserId = away?.userId ?? "";

  const [sets, setSets] = useState<EditableSet[]>(() =>
    matchDetail ? initSets(matchDetail, homeUserId, awayUserId) : [{ key: nextKey(), setNumber: 1, homeScore: 0, awayScore: 0 }]
  );

  const globalScore = useMemo(() => {
    let homeSets = 0;
    let awaySets = 0;
    for (const s of sets) {
      if (s.homeScore > s.awayScore) homeSets++;
      else if (s.awayScore > s.homeScore) awaySets++;
    }
    return `${homeSets} - ${awaySets}`;
  }, [sets]);

  const updateSet = useCallback((key: string, field: "homeScore" | "awayScore", value: number) => {
    setSets((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  }, []);

  const addSet = useCallback(() => {
    setSets((prev) => {
      const nextNumber = (prev.length > 0 ? Math.max(...prev.map((s) => s.setNumber)) : 0) + 1;
      return [...prev, { key: nextKey(), setNumber: nextNumber, homeScore: 0, awayScore: 0 }];
    });
  }, []);

  const removeSet = useCallback((key: string) => {
    setSets((prev) => {
      const filtered = prev.filter((s) => s.key !== key);
      return filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
    });
  }, []);

  const isSaving = updateScores.isPending;

  const handleSave = () => {
    if (!matchDetail || sets.length === 0) return;

    const data = {
      sets: sets.map((s) => ({
        setNumber: s.setNumber,
        scores: [
          { userId: homeUserId, score: s.homeScore },
          { userId: awayUserId, score: s.awayScore },
        ],
      })),
    };

    updateScores.mutate(
      { id: matchDetail.match.id, data },
      {
        onSuccess: () => router.dismiss(),
        onError: (err) => Alert.alert("Erreur", err.message ?? "Impossible de sauvegarder les scores."),
      }
    );
  };

  if (!matchDetail) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <ActivityIndicator size="large" color={colors.accentGreen} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={() => router.dismiss()} disabled={isSaving}>
                    <MaterialIcons name="close" size={24} color={colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={handleSave} disabled={isSaving || sets.length === 0}>
                    <MaterialIcons name="check" size={24} color={isSaving ? colors.gray400 : colors.accentGreen} />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button
              icon="xmark"
              onPress={() => router.dismiss()}
              tintColor={colors.accentGreen}
            />
          </Stack.Toolbar>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              icon="checkmark"
              onPress={handleSave}
              tintColor={colors.accentGreen}
            />
          </Stack.Toolbar>
        </>
      )}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
      >
        {/* Match header */}
        <View style={[styles.headerCard, {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerPlayer}>
              <Avatar imageUrl={home?.user?.image} name={homeName} size={48} />
              <Text
                style={[styles.headerName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {homeName}
              </Text>
            </View>

            <View style={styles.headerScore}>
              <Text style={[styles.globalScore, { color: semanticColors.labelPrimary[scheme] }]}>
                {globalScore}
              </Text>
              <Text style={[styles.setsLabel, { color: semanticColors.labelSecondary[scheme] }]}>
                Sets
              </Text>
            </View>

            <View style={styles.headerPlayer}>
              <Avatar imageUrl={away?.user?.image} name={awayName} size={48} />
              <Text
                style={[styles.headerName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {awayName}
              </Text>
            </View>
          </View>
        </View>

        {/* Editable sets */}
        {sets.map((set) => (
          <SetScoreEditorRow
            key={set.key}
            set={set}
            homeName={homeName}
            awayName={awayName}
            canDelete={sets.length > 1}
            onHomeScoreChange={(v) => updateSet(set.key, "homeScore", v)}
            onAwayScoreChange={(v) => updateSet(set.key, "awayScore", v)}
            onDelete={() => removeSet(set.key)}
          />
        ))}

        {/* Add set button */}
        <Pressable onPress={addSet} style={[styles.addSetButton, {
          backgroundColor: `${colors.accentGreen}1A`,
        }]}>
          <PlusCircle size={16} color={colors.accentGreen} strokeWidth={2} />
          <Text style={[styles.addSetText, { color: colors.accentGreen }]}>
            Ajouter un set
          </Text>
        </Pressable>
      </ScrollView>

      {/* Saving overlay */}
      {isSaving && (
        <View style={styles.overlay}>
          <View style={[styles.overlayCard, {
            backgroundColor: semanticColors.cardBackground[scheme],
          }]}>
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text style={[styles.overlayText, { color: semanticColors.labelSecondary[scheme] }]}>
              Enregistrement...
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.horizontal,
    gap: 16,
    paddingBottom: 40,
  },
  headerCard: {
    padding: spacing.card,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  headerPlayer: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  headerName: {
    fontSize: 14,
    fontWeight: "500",
  },
  headerScore: {
    alignItems: "center",
    gap: 2,
  },
  globalScore: {
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  setsLabel: {
    fontSize: 10,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "500",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderRadius: radii.md,
  },
  overlayText: {
    fontSize: 14,
  },
});
