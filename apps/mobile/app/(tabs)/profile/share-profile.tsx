import { useState } from "react";
import { View, Text, StyleSheet, Share, Alert } from "react-native";
import { Stack } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import {
  useCreateProfileShareToken,
  useRevokeProfileShareToken,
} from "@/hooks/use-profile-share";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import Button from "@/components/ui/button";

/** Lets a player generate a revocable link (and its QR code) that opens their minimal public
 * profile for anyone who scans it or taps it — "Ajouter à un match" / "Envoyer un message" from
 * there, without exposing their club or contact details. */
export default function ShareProfileScreen() {
  const scheme = useColorScheme();
  const createToken = useCreateProfileShareToken();
  const revokeToken = useRevokeProfileShareToken();
  const [current, setCurrent] = useState<{ token: string; deepLink: string } | null>(null);

  const handleCreate = () => {
    createToken.mutate(undefined, {
      onSuccess: (res) => setCurrent(res),
      onError: () => Alert.alert("Erreur", "Impossible de créer le lien."),
    });
  };

  const handleRevoke = () => {
    if (!current) return;
    revokeToken.mutate(current.token, {
      onSuccess: () => setCurrent(null),
      onError: () => Alert.alert("Erreur", "Impossible de révoquer le lien."),
    });
  };

  const handleShare = () => {
    if (!current) return;
    Share.share({ message: current.deepLink });
  };

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen options={{ title: "Mon profil partageable" }} />
      <Text style={[styles.description, { color: semanticColors.labelSecondary[scheme] }]}>
        Créez un lien pour que d'autres joueurs vous ajoutent à un match ou vous contactent,
        sans révéler votre club. Vous pouvez le révoquer à tout moment.
      </Text>

      {current ? (
        <View style={styles.qrSection}>
          <View style={styles.qrCard}>
            <QRCode value={current.deepLink} size={220} />
          </View>
          <View style={styles.actions}>
            <Button label="Partager le lien" onPress={handleShare} fullWidth />
            <Button
              label="Révoquer ce lien"
              variant="destructive"
              onPress={handleRevoke}
              loading={revokeToken.isPending}
              fullWidth
            />
          </View>
        </View>
      ) : (
        <Button
          label="Créer un lien"
          onPress={handleCreate}
          loading={createToken.isPending}
          fullWidth
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: "center", gap: 24 },
  description: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  qrSection: { width: "100%", alignItems: "center", gap: 24 },
  qrCard: {
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  actions: { width: "100%", gap: 12 },
});
