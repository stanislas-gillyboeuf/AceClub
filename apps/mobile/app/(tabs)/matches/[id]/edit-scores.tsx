import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "@/tw";
import {
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Plus, Trash2 } from "lucide-react-native";
import { useMatchDetail, useUpdateMatchScores } from "@/hooks/useMatch";
import { ScoreStepper } from "@/components/match/ScoreStepper";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getHomeParticipant, getAwayParticipant } from "@/lib/match-utils";

interface SetScoreState {
  setNumber: number;
  homeScore: number;
  awayScore: number;
}

export default function EditScoresScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useMatchDetail(id);
  const updateScores = useUpdateMatchScores();

  const [sets, setSets] = useState<SetScoreState[]>([]);

  const home = data ? getHomeParticipant(data.participants) : undefined;
  const away = data ? getAwayParticipant(data.participants) : undefined;

  // Initialize from existing data
  useEffect(() => {
    if (data?.sets && data.sets.length > 0) {
      const initial = data.sets
        .sort((a, b) => a.setNumber - b.setNumber)
        .map((set) => ({
          setNumber: set.setNumber,
          homeScore: set.scores.find((s) => s.side === "home")?.games ?? 0,
          awayScore: set.scores.find((s) => s.side === "away")?.games ?? 0,
        }));
      setSets(initial);
    } else {
      setSets([{ setNumber: 1, homeScore: 0, awayScore: 0 }]);
    }
  }, [data]);

  const addSet = useCallback(() => {
    if (sets.length >= 5) return;
    setSets((prev) => [
      ...prev,
      { setNumber: prev.length + 1, homeScore: 0, awayScore: 0 },
    ]);
  }, [sets.length]);

  const removeSet = useCallback(
    (index: number) => {
      if (sets.length <= 1) return;
      setSets((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next.map((s, i) => ({ ...s, setNumber: i + 1 }));
      });
    },
    [sets.length]
  );

  const updateSetScore = useCallback(
    (index: number, field: "homeScore" | "awayScore", value: number) => {
      setSets((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!home || !away) return;

    const payload = {
      sets: sets.map((s) => ({
        setNumber: s.setNumber,
        scores: [
          { userId: home.userId, score: s.homeScore },
          { userId: away.userId, score: s.awayScore },
        ],
      })),
    };

    updateScores.mutate(
      { id, data: payload },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert("Erreur", "Impossible de sauvegarder les scores"),
      }
    );
  }, [id, sets, home, away, updateScores, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark">
        <View className="px-horizontal pt-4 gap-4">
          <Skeleton height={24} width="50%" />
          <Skeleton height={200} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={24} color="#34C759" />
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>
        <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
          Scores
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={updateScores.isPending}
          hitSlop={8}
        >
          {updateScores.isPending ? (
            <ActivityIndicator size="small" color="#34C759" />
          ) : (
            <Text className="text-primary dark:text-primary-dark font-sans-semibold">
              Sauver
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Player headers */}
        <View className="flex-row items-center justify-around py-2">
          <View className="items-center gap-1">
            <Avatar
              imageUrl={home?.user?.image}
              name={home?.user?.name ?? "N/A"}
              size={48}
            />
            <Text className="text-sm font-sans-semibold text-label-primary dark:text-label-primary-dark">
              {home?.user?.name?.split(" ")[0] ?? "Domicile"}
            </Text>
          </View>
          <Text className="text-lg font-sans-bold text-label-secondary">
            VS
          </Text>
          <View className="items-center gap-1">
            <Avatar
              imageUrl={away?.user?.image}
              name={away?.user?.name ?? "N/A"}
              size={48}
            />
            <Text className="text-sm font-sans-semibold text-label-primary dark:text-label-primary-dark">
              {away?.user?.name?.split(" ")[0] ?? "Extérieur"}
            </Text>
          </View>
        </View>

        {/* Sets */}
        {sets.map((set, index) => (
          <View
            key={set.setNumber}
            className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark"
          >
            {/* Set header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-sans-semibold text-label-primary dark:text-label-primary-dark">
                Set {set.setNumber}
              </Text>
              {sets.length > 1 && (
                <Pressable onPress={() => removeSet(index)} hitSlop={8}>
                  <Trash2 size={16} color="#FF3B30" />
                </Pressable>
              )}
            </View>

            {/* Score steppers */}
            <View className="flex-row items-center justify-around">
              <ScoreStepper
                value={set.homeScore}
                onChange={(v) => updateSetScore(index, "homeScore", v)}
                label={home?.user?.name?.split(" ")[0]}
              />
              <Text className="text-lg font-sans-bold text-label-secondary">
                -
              </Text>
              <ScoreStepper
                value={set.awayScore}
                onChange={(v) => updateSetScore(index, "awayScore", v)}
                label={away?.user?.name?.split(" ")[0]}
              />
            </View>
          </View>
        ))}

        {/* Add set button */}
        {sets.length < 5 && (
          <Pressable
            onPress={addSet}
            className="flex-row items-center justify-center gap-2 py-3 rounded-md border border-dashed border-border dark:border-border-dark"
          >
            <Plus size={18} color="#34C759" />
            <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
              Ajouter un set
            </Text>
          </Pressable>
        )}

        {/* Save button (bottom) */}
        <Pressable
          onPress={handleSave}
          disabled={updateScores.isPending}
          className="flex-row items-center justify-center gap-2 bg-primary dark:bg-primary-dark rounded-sm h-button"
        >
          {updateScores.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-sans-semibold text-base">
              Sauvegarder les scores
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
