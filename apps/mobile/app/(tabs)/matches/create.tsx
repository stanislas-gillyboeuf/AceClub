import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PlusCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMe } from "@/hooks/use-user";
import { useCreateMatch } from "@/hooks/use-match";
import { Avatar } from "@/components/ui/avatar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { UserSearchField } from "@/features/matches/components/user-search-field";
import {
  SetScoreEditorRow,
  type EditableSet,
} from "@/features/matches/components/edit-scores/set-score-editor-row";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { UserSearchItem } from "@/types/user";

type MatchType = "match" | "training";
type MatchStatus = "scheduled" | "ongoing" | "finished";
type WinnerSide = "home" | "away" | null;

const MATCH_TYPE_OPTIONS: { value: MatchType; label: string }[] = [
  { value: "match", label: "Match" },
  { value: "training", label: "Entrainement" },
];

const MATCH_STATUS_OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: "scheduled", label: "Planifie" },
  { value: "ongoing", label: "En cours" },
  { value: "finished", label: "Termine" },
];

const WINNER_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "Aucun" },
  { value: "home", label: "Domicile" },
  { value: "away", label: "Exterieur" },
];

let keyCounter = 0;
function nextKey() {
  return `create-set-${++keyCounter}`;
}

export default function CreateMatch() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { data: me, isLoading: isLoadingMe } = useMe();
  const createMatch = useCreateMatch();

  // Form state
  const [matchType, setMatchType] = useState<MatchType>("match");
  const [status, setStatus] = useState<MatchStatus>("scheduled");
  const [awayUser, setAwayUser] = useState<UserSearchItem | null>(null);
  const [sets, setSets] = useState<EditableSet[]>([
    { key: nextKey(), setNumber: 1, homeScore: 0, awayScore: 0 },
  ]);
  const [winnerSide, setWinnerSide] = useState<WinnerSide>(null);
  const [startedAt, setStartedAt] = useState(new Date());
  const [finishedAt, setFinishedAt] = useState(new Date());

  const isCreating = createMatch.isPending;

  const homeName = me?.name ?? "Domicile";
  const awayName = awayUser?.name ?? "Exterieur";

  // Validation
  const isValid = useMemo(() => {
    if (!me || !awayUser) return false;
    if (me.id === awayUser.id) return false;
    if (status === "scheduled") return true;
    if (sets.length === 0) return false;
    for (const s of sets) {
      if (s.homeScore < 0 || s.awayScore < 0) return false;
    }
    if (status === "finished" && finishedAt < startedAt) return false;
    return true;
  }, [me, awayUser, status, sets, startedAt, finishedAt]);

  // Set management
  const updateSet = useCallback(
    (key: string, field: "homeScore" | "awayScore", value: number) => {
      setSets((prev) =>
        prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const addSet = useCallback(() => {
    setSets((prev) => {
      if (prev.length >= 5) return prev;
      const nextNumber =
        (prev.length > 0 ? Math.max(...prev.map((s) => s.setNumber)) : 0) + 1;
      return [
        ...prev,
        { key: nextKey(), setNumber: nextNumber, homeScore: 0, awayScore: 0 },
      ];
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const removeSet = useCallback((key: string) => {
    setSets((prev) => {
      const filtered = prev.filter((s) => s.key !== key);
      return filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Submit
  const handleCreate = useCallback(async () => {
    if (!me || !awayUser || !isValid) return;

    const now = new Date();
    let creationDate = now;

    const scheduledDate =
      status === "scheduled" ? startedAt.toISOString() : undefined;
    const startDate =
      status === "ongoing" || status === "finished"
        ? startedAt.toISOString()
        : undefined;
    const endDate =
      status === "finished" ? finishedAt.toISOString() : undefined;

    if (startDate && new Date(startDate) < now) {
      creationDate = new Date(startDate);
    }
    if (endDate && new Date(endDate) < creationDate) {
      creationDate = new Date(endDate);
    }

    const participants = [
      { userId: me.id, side: "home" as const, isWinner: winnerSide === "home" },
      {
        userId: awayUser.id,
        side: "away" as const,
        isWinner: winnerSide === "away",
      },
    ];

    const setsData =
      status === "scheduled"
        ? []
        : sets.map((s) => ({
            setNumber: s.setNumber,
            scores: [
              { userId: me.id, score: s.homeScore },
              { userId: awayUser.id, score: s.awayScore },
            ],
          }));

    createMatch.mutate(
      {
        createdBy: me.id,
        status,
        type: matchType,
        createdAt: creationDate.toISOString(),
        scheduledAt: scheduledDate,
        startedAt: startDate,
        finishedAt: endDate,
        participants,
        sets: setsData,
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.dismiss();
        },
        onError: (err) => {
          Alert.alert("Erreur", err.message ?? "Impossible de creer le match.");
        },
      }
    );
  }, [
    me,
    awayUser,
    isValid,
    status,
    matchType,
    startedAt,
    finishedAt,
    winnerSide,
    sets,
    createMatch,
    router,
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nouveau match",
          headerLeft:
            Platform.OS === "android"
              ? () => (
                  <Pressable
                    onPress={() => router.dismiss()}
                    disabled={isCreating}
                  >
                    <Text style={{ color: colors.accentGreen, fontSize: 16 }}>
                      Annuler
                    </Text>
                  </Pressable>
                )
              : undefined,
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable
                    onPress={handleCreate}
                    disabled={!isValid || isCreating}
                  >
                    <Text
                      style={{
                        color:
                          isValid && !isCreating
                            ? colors.accentGreen
                            : colors.gray400,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Creer
                    </Text>
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
              onPress={handleCreate}
              disabled={!isValid || isCreating}
              tintColor={colors.accentGreen}
            />
          </Stack.Toolbar>
        </>
      )}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.scrollContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
      >
        {/* Type */}
        <SectionCard title="Type" scheme={scheme}>
          <SegmentedControl
            options={MATCH_TYPE_OPTIONS}
            selected={matchType}
            onSelect={setMatchType}
          />
        </SectionCard>

        {/* Status */}
        <SectionCard title="Statut du match" scheme={scheme}>
          <SegmentedControl
            options={MATCH_STATUS_OPTIONS}
            selected={status}
            onSelect={setStatus}
          />
        </SectionCard>

        {/* Participants */}
        <SectionCard title="Participants" scheme={scheme}>
          {/* Home player (current user) */}
          <View style={styles.participantBlock}>
            <Text
              style={[
                styles.participantLabel,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Joueur Domicile
            </Text>
            {isLoadingMe ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.accentGreen} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: semanticColors.labelSecondary[scheme] },
                  ]}
                >
                  Chargement...
                </Text>
              </View>
            ) : me ? (
              <View style={styles.userRow}>
                <Avatar imageUrl={me.image} name={me.name} size={36} />
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      { color: semanticColors.labelPrimary[scheme] },
                    ]}
                    numberOfLines={1}
                  >
                    {me.name}
                  </Text>
                  <Text
                    style={[
                      styles.youBadge,
                      { color: semanticColors.labelSecondary[scheme] },
                    ]}
                  >
                    Vous
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={{ color: colors.red500 }}>
                Erreur de chargement
              </Text>
            )}
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: semanticColors.borderColor[scheme] },
            ]}
          />

          {/* Away player (search) */}
          <UserSearchField
            label="Joueur Exterieur"
            selectedUser={awayUser}
            onSelect={setAwayUser}
            excludedUserIds={me ? [me.id] : []}
          />
        </SectionCard>

        {/* Sets (only if not scheduled) */}
        {status !== "scheduled" && (
          <View style={styles.setsSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              SETS
            </Text>
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
            {sets.length < 5 && (
              <Pressable
                onPress={addSet}
                style={[
                  styles.addSetButton,
                  { backgroundColor: `${colors.accentGreen}1A` },
                ]}
              >
                <PlusCircle
                  size={16}
                  color={colors.accentGreen}
                  strokeWidth={2}
                />
                <Text
                  style={[styles.addSetText, { color: colors.accentGreen }]}
                >
                  Ajouter un set
                </Text>
              </Pressable>
            )}
            <Text
              style={[
                styles.setsFooter,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Un match de ping-pong peut avoir jusqu'a 5 sets.
            </Text>
          </View>
        )}

        {/* Winner (only if finished) */}
        {status === "finished" && (
          <SectionCard title="Vainqueur" scheme={scheme}>
            <SegmentedControl
              options={WINNER_OPTIONS}
              selected={
                winnerSide === null ? "none" : winnerSide
              }
              onSelect={(value) => {
                setWinnerSide(value === "none" ? null : (value as WinnerSide));
              }}
            />
          </SectionCard>
        )}

        {/* Dates */}
        <SectionCard title="Dates" scheme={scheme}>
          {status === "scheduled" && (
            <DateRow
              label="Date prevue"
              date={startedAt}
              onChange={setStartedAt}
              scheme={scheme}
            />
          )}
          {(status === "ongoing" || status === "finished") && (
            <DateRow
              label="Debut du match"
              date={startedAt}
              onChange={setStartedAt}
              scheme={scheme}
            />
          )}
          {status === "finished" && (
            <>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: semanticColors.borderColor[scheme] },
                ]}
              />
              <DateRow
                label="Fin du match"
                date={finishedAt}
                onChange={setFinishedAt}
                minimumDate={startedAt}
                scheme={scheme}
              />
            </>
          )}
        </SectionCard>
      </ScrollView>

      {/* Creating overlay */}
      {isCreating && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: semanticColors.cardBackground[scheme] },
            ]}
          >
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text
              style={[
                styles.overlayText,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Creation du match...
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

// --- Section Card wrapper ---

function SectionCard({
  title,
  scheme,
  children,
}: {
  title: string;
  scheme: "light" | "dark";
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          { color: semanticColors.labelSecondary[scheme] },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: semanticColors.cardBackground[scheme],
            borderColor: semanticColors.borderColor[scheme],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

// --- Date Row with native DateTimePicker ---

function DateRow({
  label,
  date,
  onChange,
  minimumDate,
  scheme,
}: {
  label: string;
  date: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  scheme: "light" | "dark";
}) {
  return (
    <View style={styles.dateRow}>
      <Text
        style={[
          styles.dateLabel,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
      >
        {label}
      </Text>
      <DateTimePicker
        value={date}
        mode="datetime"
        display="compact"
        onChange={(_, selectedDate) => {
          if (selectedDate) onChange(selectedDate);
        }}
        minimumDate={minimumDate}
        accentColor={colors.accentGreen}
        themeVariant={scheme}
        locale="fr-FR"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.horizontal,
    gap: 24,
    paddingBottom: 60,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: spacing.card,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    gap: 12,
  },
  participantBlock: {
    gap: 4,
  },
  participantLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
  },
  youBadge: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  setsSection: {
    gap: 12,
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
  setsFooter: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateLabel: {
    fontSize: 15,
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
