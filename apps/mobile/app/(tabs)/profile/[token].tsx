import { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useProfileByToken } from "@/hooks/use-profile-share";
import { useBlockedUsers, useBlockUser, useUnblockUser } from "@/hooks/use-block";
import { useFindOrCreateConversation } from "@/hooks/use-conversation";
import { useCreateMatchFormStore } from "@/store/create-match-form";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportUserSheet } from "@/features/matches/components/report-user-sheet";

/** Opened via the "aceclub://profile/<token>" deep link (a scanned QR or shared link) — shows the
 * minimal public profile behind a shareable token and offers to add this player to a match or
 * start a conversation, same actions as any other player found via search. */
export default function SharedProfileScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: profile, isLoading, isError } = useProfileByToken(token ?? "");
  const { data: blockedData } = useBlockedUsers();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const findOrCreateConversation = useFindOrCreateConversation();
  const setAwayUser = useCreateMatchFormStore((s) => s.setAwayUser);
  const [reportVisible, setReportVisible] = useState(false);

  const isBlocked = !!profile && blockedData?.users.some((u) => u.id === profile.id);

  const handleAddToMatch = () => {
    if (!profile) return;
    setAwayUser({ id: profile.id, name: profile.name, image: profile.image ?? null, isGhost: false });
    router.push("/(tabs)/matches/create");
  };

  const handleSendMessage = () => {
    if (!profile) return;
    findOrCreateConversation.mutate(profile.id, {
      onSuccess: (res) => router.push(`/conversation/${res.conversationId}`),
      onError: () => Alert.alert("Erreur", "Impossible d'ouvrir la conversation."),
    });
  };

  const handleToggleBlock = () => {
    if (!profile) return;
    if (isBlocked) {
      unblockUser.mutate(profile.id);
    } else {
      Alert.alert("Bloquer ce joueur ?", "Il ne pourra plus vous trouver ni vous contacter.", [
        { text: "Annuler", style: "cancel" },
        { text: "Bloquer", style: "destructive", onPress: () => blockUser.mutate(profile.id) },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen options={{ title: "Profil" }} />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentGreen} />
        </View>
      ) : isError || !profile ? (
        <EmptyState
          icon="UserX"
          title="Profil introuvable"
          description="Ce lien n'est plus valide."
          containerStyle={styles.centered}
        />
      ) : (
        <View style={styles.content}>
          <Avatar imageUrl={profile.image} name={profile.name} size={96} />
          <Text style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}>
            {profile.name}
          </Text>
          {profile.skillLevel && (
            <Text style={[styles.level, { color: semanticColors.labelSecondary[scheme] }]}>
              Niveau {profile.skillLevel}
            </Text>
          )}

          {!isBlocked && (
            <View style={styles.actions}>
              <Button label="Ajouter à un match" onPress={handleAddToMatch} fullWidth />
              <Button
                label="Envoyer un message"
                variant="secondary"
                onPress={handleSendMessage}
                loading={findOrCreateConversation.isPending}
                fullWidth
              />
            </View>
          )}

          <View style={styles.secondaryActions}>
            <Button
              label={isBlocked ? "Débloquer" : "Bloquer"}
              variant="secondary"
              onPress={handleToggleBlock}
              loading={blockUser.isPending || unblockUser.isPending}
            />
            {!isBlocked && (
              <Button label="Signaler" variant="destructive" onPress={() => setReportVisible(true)} />
            )}
          </View>
        </View>
      )}

      <ReportUserSheet
        visible={reportVisible}
        userId={profile?.id ?? null}
        context="profile"
        onClose={() => setReportVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, alignItems: "center", paddingTop: 48, paddingHorizontal: 24, gap: 8 },
  name: { fontSize: 22, fontWeight: "700", marginTop: 12 },
  level: { fontSize: 15 },
  actions: { width: "100%", gap: 12, marginTop: 32 },
  secondaryActions: { flexDirection: "row", gap: 12, marginTop: 20 },
});
