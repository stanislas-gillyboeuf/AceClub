import { useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/avatar";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateMatchRequest } from "@/hooks/use-match-intent";
import { formatShortDate, formatTime } from "@/lib/format";
import { formatSkillLevel } from "@/lib/skill-levels";
import type { MatchIntentWithUser } from "@/types/match-intent";

const PADEL_TEAMMATE_SLOTS = 3;

interface PartnerRequestCardProps {
  item: MatchIntentWithUser;
}

export function PartnerRequestCard({ item }: PartnerRequestCardProps) {
  const scheme = useColorScheme();
  const router = useRouter();
  const createRequest = useCreateMatchRequest();
  const [pendingSlot, setPendingSlot] = useState<number | "tennis" | null>(null);

  const sport = (item.intent.sport ?? item.user?.sport) === "padel" ? "padel" : "tennis";
  const isPadel = sport === "padel";
  const accent = isPadel ? colors.accentOrange : colors.accentGreen;
  const displayName = item.user?.name ?? "Joueur";
  const level = formatSkillLevel(item.user?.skillLevel, item.user?.sport);

  const dateLabel = item.intent.isFlexibleDate
    ? "Discutons par message de la date"
    : item.intent.date
      ? `${formatShortDate(item.intent.date)}${item.intent.time ? ` · ${formatTime(item.intent.time)}` : ""}`
      : "Date à définir";

  const sendRequest = async (slotIndex: number | undefined, key: number | "tennis") => {
    setPendingSlot(key);
    try {
      const result = await createRequest.mutateAsync({
        matchIntentId: item.intent.id,
        data: { slotIndex },
      });
      if (result.conversationId) {
        router.push(`/conversation/${result.conversationId}`);
      }
    } catch {
      Alert.alert("Erreur", "Impossible d'envoyer la demande. Réessaie.");
    } finally {
      setPendingSlot(null);
    }
  };

  const confirmJoin = (message: string, slotIndex: number | undefined, key: number | "tennis") => {
    Alert.alert("Rejoindre", message, [
      { text: "Non", style: "cancel" },
      { text: "Oui", onPress: () => sendRequest(slotIndex, key) },
    ]);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        },
      ]}
    >
      <View style={styles.header}>
        <Avatar imageUrl={item.user?.image} name={item.user?.name} size={40} />
        <Text style={[styles.sportLabel, { color: accent }]}>{isPadel ? "PADEL" : "TENNIS"}</Text>
      </View>

      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
          {displayName}
        </Text>
        {level && (
          <Text style={[styles.level, { color: semanticColors.labelSecondary[scheme] }]}>{level}</Text>
        )}
      </View>

      <Text style={[styles.date, { color: semanticColors.labelSecondary[scheme] }]} numberOfLines={2}>
        {dateLabel}
      </Text>

      {isPadel ? (
        <View style={styles.slotsContainer}>
          {Array.from({ length: PADEL_TEAMMATE_SLOTS }, (_, i) => {
            const teammate = item.teammates?.find((t) => t.slotIndex === i) ?? null;
            const isMine = item.myRequestSlotIndex === i && item.myRequestStatus === "pending";
            const isBusy = pendingSlot === i;
            return (
              <View
                key={i}
                style={[styles.slotRow, { borderColor: semanticColors.borderColor[scheme] }]}
              >
                <Text style={[styles.slotLabel, { color: semanticColors.labelSecondary[scheme] }]}>
                  Joueur {i + 2}
                </Text>
                {teammate ? (
                  <View style={styles.slotFilled}>
                    <Avatar imageUrl={teammate.image} name={teammate.name} size={24} />
                    <Text
                      style={[styles.slotName, { color: semanticColors.labelPrimary[scheme] }]}
                      numberOfLines={1}
                    >
                      {teammate.name ?? "Joueur"}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    disabled={isMine || createRequest.isPending}
                    onPress={() =>
                      confirmJoin(`Envoyer une demande pour rejoindre en tant que Joueur ${i + 2} ?`, i, i)
                    }
                    style={({ pressed }) => [
                      styles.pill,
                      { backgroundColor: isMine ? semanticColors.systemGray5[scheme] : accent },
                      pressed && { transform: [{ scale: 0.96 }] },
                    ]}
                  >
                    {isBusy ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.pillText, isMine && { color: semanticColors.labelSecondary[scheme] }]}>
                        {isMine ? "Envoyée" : "Rejoindre"}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.tennisAction}>
          <Pressable
            disabled={item.myRequestStatus === "pending" || createRequest.isPending}
            onPress={() => confirmJoin(`Envoyer une demande à ${displayName} ?`, undefined, "tennis")}
            style={({ pressed }) => [
              styles.pill,
              styles.pillLarge,
              {
                backgroundColor:
                  item.myRequestStatus === "pending" ? semanticColors.systemGray5[scheme] : accent,
              },
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            {pendingSlot === "tennis" ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.pillText,
                  item.myRequestStatus === "pending" && { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {item.myRequestStatus === "pending" ? "Demande envoyée" : "Accepter"}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.card,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sportLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    flexShrink: 1,
  },
  level: {
    fontSize: 14,
    fontWeight: "500",
  },
  date: {
    fontSize: 14,
  },
  tennisAction: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  pill: {
    minWidth: 96,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pillLarge: {
    minWidth: 140,
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  slotsContainer: {
    marginTop: 4,
    gap: 8,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  slotFilled: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slotName: {
    fontSize: 14,
    fontWeight: "500",
    maxWidth: 120,
  },
});
