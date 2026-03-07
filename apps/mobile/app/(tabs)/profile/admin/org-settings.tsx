import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MapPin } from "lucide-react-native";
import type { ImagePickerAsset } from "expo-image-picker";

import { useMyOrganizations, useUpdateOrganization } from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { uploadService } from "@/services/upload";
import { OrgLogoEditor } from "@/features/profile/components/OrgLogoEditor";
import { MapPreview } from "@/features/matches/components/match-detail/map-preview";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";

export default function OrgSettings() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: orgs, isLoading } = useMyOrganizations();
  const updateOrg = useUpdateOrganization();

  const org = orgs?.[0] ?? null;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [pickedAsset, setPickedAsset] = useState<ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (org && !hasLoaded) {
      setName(org.name);
      setAddress(org.address ?? "");
      setLogoUri(org.logo ?? null);
      setHasLoaded(true);
    }
  }, [org, hasLoaded]);

  const handlePickLogo = (asset: ImagePickerAsset) => {
    setPickedAsset(asset);
    setLogoUri(asset.uri);
  };

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !org) return;
    setIsSubmitting(true);

    try {
      let newLogoUrl: string | undefined;

      if (pickedAsset) {
        const fileName = `org_logo_${Date.now()}.jpg`;
        const result = await uploadService.uploadOrgLogo(
          org.id,
          pickedAsset.uri,
          fileName,
          "image/jpeg",
        );
        newLogoUrl = result.url;
      }

      await updateOrg.mutateAsync({
        organizationId: org.id,
        data: {
          name: name.trim(),
          address: address.trim() || null,
          ...(newLogoUrl !== undefined && { logo: newLogoUrl }),
        },
      });

      router.dismiss();
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de modifier le club.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !hasLoaded) {
    return (
      <>
        <Stack.Screen options={{ title: "Paramètres du club" }} />
        <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <ActivityIndicator size="large" color={colors.accentGreen} />
        </View>
      </>
    );
  }

  const hasCoords = org?.latitude != null && org?.longitude != null;

  return (
    <>
      <Stack.Screen options={{ title: "Paramètres du club" }} />

      <ScrollView
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <OrgLogoEditor logoUri={logoUri} onPick={handlePickLogo} />

        {/* Name */}
        <GlassView style={styles.fieldCard}>
          <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
            NOM
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom du club"
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            style={[styles.input, { color: semanticColors.labelPrimary[scheme] }]}
          />
        </GlassView>

        {/* Address */}
        <GlassView style={styles.fieldCard}>
          <Text style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}>
            ADRESSE
          </Text>
          <View style={styles.addressRow}>
            <MapPin
              size={20}
              color={address ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
              strokeWidth={1.5}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Ajouter une adresse"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              style={[styles.addressInput, { color: semanticColors.labelPrimary[scheme] }]}
            />
          </View>
        </GlassView>

        {/* Map */}
        {hasCoords && (
          <MapPreview
            latitude={org!.latitude!}
            longitude={org!.longitude!}
            title={org!.name}
          />
        )}

        {/* Submit */}
        <Button
          label="Enregistrer"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.horizontal,
    gap: 14,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldCard: {
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  input: {
    fontSize: 18,
    fontWeight: "600",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addressInput: {
    fontSize: 16,
    flex: 1,
  },
});
