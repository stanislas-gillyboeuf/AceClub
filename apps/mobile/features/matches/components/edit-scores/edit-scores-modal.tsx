import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { PlusCircle } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUpdateMatchScores } from "@/hooks/use-match";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { SetScoreEditorRow, type EditableSet } from "./set-score-editor-row";
import type { MatchDetail } from "@/types/match";

interface EditScoresModalProps {
  visible: boolean;
  onClose: () => void;
  matchDetail: MatchDetail;
}

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

export function EditScoresModal({ visible, onClose, matchDetail }: EditScoresModalProps) {
  const scheme = useColorScheme();
  const updateScores = useUpdateMatchScores();

  const home = getHomeParticipant(matchDetail);
  const away = getAwayParticipant(matchDetail);
  const homeName = home?.user?.name ?? "Joueur 1";
  const awayName = away?.user?.name ?? "Joueur 2";
  const homeUserId = home?.userId ?? "";
  const awayUserId = away?.userId ?? "";

  const [sets, setSets] = useState<EditableSet[]>(() => initSets(matchDetail, homeUserId, awayUserId));

  // Recompute global score from editable sets
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
      // Reindex set numbers
      return filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
    });
  }, []);

  const handleSave = () => {
    if (sets.length === 0) return;

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
        onSuccess: () => onClose(),
        onError: (err) => Alert.alert("Erreur", err.message ?? "Impossible de sauvegarder les scores."),
      }
    );
  };

  const isSaving = updateScores.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        {/* Toolbar */}
        <View style={[styles.toolbar, { borderBottomColor: semanticColors.borderColor[scheme] }]}>
          <Pressable onPress={onClose} disabled={isSaving}>
            <Text style={[styles.cancelText, { color: colors.accentGreen, opacity: isSaving ? 0.4 : 1 }]}>
              Annuler
            </Text>
          </Pressable>
          <Text style={[styles.toolbarTitle, { color: semanticColors.labelPrimary[scheme] }]}>
            Modifier les scores
          </Text>
          <Pressable onPress={handleSave} disabled={isSaving || sets.length === 0}>
            <Text style={[styles.saveText, {
              color: colors.accentGreen,
              opacity: isSaving || sets.length === 0 ? 0.4 : 1,
            }]}>
              Enregistrer
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
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
      </SafeAreaView>
    </Modal>
  );
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  cancelText: {
    fontSize: 16,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
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
