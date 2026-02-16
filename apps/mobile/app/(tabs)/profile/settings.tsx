import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import {
  Building2,
  Dumbbell,
  Bell,
  MapPin,
  Shield,
  KeyRound,
  FileText,
  Hand,
  Trash2,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { useMe, usePreferences, useUpdateProfile } from "@/hooks/use-user";
import { useDeleteAccount } from "@/hooks/use-e2ee";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth-client";
import { clearAuthData } from "@/lib/auth-api";
import { uploadService } from "@/services/upload";
import { getSkillLevels } from "@/lib/skill-levels";

import { SectionCard } from "@/components/ui/section-card";
import { FormField } from "@/components/ui/form-field";
import { SettingsRow } from "@/components/ui/settings-row";
import { ToggleRow } from "@/components/ui/toggle-row";
import { RadioGroup } from "@/components/ui/radio-group";
import { EditableAvatar } from "@/features/settings/components/editable-avatar";
import { consumePendingClubSelection } from "@/lib/pending-club-selection";

import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { Sport } from "@/types/common";
import type { Organization } from "@/types/organization";

const PHONE_ALLOWED_CHARS = /^[+0-9() -]*$/;

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8;
}

export default function Settings() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: user } = useMe();
  const { data: preferences } = usePreferences();
  const updateProfile = useUpdateProfile();

  // Form state
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<string | null>(null);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Delete account
  const deleteAccount = useDeleteAccount();

  // Initialize form from user data
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhoneNumber(user.phoneNumber ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (preferences) {
      setSelectedSport((preferences.sport as Sport) ?? null);
      setSelectedSkillLevel(preferences.skillLevel ?? null);
      if (preferences.organizationId) {
        setSelectedOrganization({
          id: preferences.organizationId,
          name: preferences.organizationName ?? "",
          slug: "",
          createdAt: "",
          pinEnabled: false,
        });
      }
    }
  }, [preferences]);

  // Original values for change detection
  const originalValues = useMemo(
    () => ({
      name: user?.name ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      sport: (preferences?.sport as Sport) ?? null,
      skillLevel: preferences?.skillLevel ?? null,
      organizationId: preferences?.organizationId ?? null,
      image: user?.image ?? null,
    }),
    [user, preferences]
  );

  const hasChanges =
    name !== originalValues.name ||
    phoneNumber !== originalValues.phoneNumber ||
    selectedSport !== originalValues.sport ||
    selectedSkillLevel !== originalValues.skillLevel ||
    selectedOrganization?.id !== originalValues.organizationId ||
    selectedImageUri !== null;

  const canSave =
    hasChanges &&
    name.trim().length > 0 &&
    (!phoneNumber || isValidPhone(phoneNumber)) &&
    !isSaving;

  // Sport change resets skill level
  const handleSportChange = (sport: Sport) => {
    setSelectedSport(sport);
    const levels = getSkillLevels(sport);
    if (levels.length > 0) {
      setSelectedSkillLevel(levels[0].value);
    }
  };

  // Phone number validation
  const handlePhoneChange = (text: string) => {
    if (PHONE_ALLOWED_CHARS.test(text)) {
      setPhoneNumber(text);
    }
  };

  // Image picker
  const handleImageSelected = (asset: ImagePicker.ImagePickerAsset) => {
    setSelectedImageUri(asset.uri);
  };

  // Consume pending club selection when returning from club-selection screen
  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingClubSelection();
      if (selection) {
        setSelectedOrganization(selection.organization);
        if (selection.pin) setPendingPin(selection.pin);
      }
    }, [])
  );

  // Save
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let imageUrl: string | null = null;

      // Upload image if changed
      if (selectedImageUri) {
        setIsUploading(true);
        try {
          const fileName = `profile_${Date.now()}.jpg`;
          const result = await uploadService.uploadUserImage(
            selectedImageUri,
            fileName,
            "image/jpeg"
          );
          imageUrl = result.imageUrl;
        } finally {
          setIsUploading(false);
        }
      }

      // Build payload with only defined (non-null) values
      const payload: Record<string, string> = {};
      const trimmedName = name.trim();
      const trimmedPhone = phoneNumber.trim();

      if (trimmedName && trimmedName !== originalValues.name) payload.name = trimmedName;
      if (trimmedPhone && trimmedPhone !== originalValues.phoneNumber) payload.phoneNumber = trimmedPhone;
      if (selectedSport && selectedSport !== originalValues.sport) payload.sport = selectedSport;
      if (selectedSkillLevel && selectedSkillLevel !== originalValues.skillLevel) payload.skillLevel = selectedSkillLevel;
      if (selectedOrganization?.id && selectedOrganization.id !== originalValues.organizationId) {
        payload.organizationId = selectedOrganization.id;
        if (pendingPin) payload.pin = pendingPin;
      }
      if (imageUrl) payload.image = imageUrl;

      // Update profile
      await updateProfile.mutateAsync(payload);

      setSuccessMessage("Profil mis à jour avec succès");
      setSelectedImageUri(null);
      setPendingPin(null);

      // Go back after a short delay
      setTimeout(() => router.dismiss(), 500);
    } catch (e: any) {
      setErrorMessage(e.message ?? "Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est définitive et irréversible. Toutes vos données seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount.mutateAsync();
              await authClient.signOut();
              await clearAuthData();
              router.replace("/(auth)/sign-in");
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer le compte.");
            }
          },
        },
      ]
    );
  };

  // Notifications toggle
  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      setNotificationsEnabled(true);
    } else {
      // Can't disable programmatically, open settings
      if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
      } else {
        Linking.openSettings();
      }
    }
  };

  // Location toggle
  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      setLocationEnabled(true);
    } else {
      if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
      } else {
        Linking.openSettings();
      }
    }
  };

  // Legal links
  const openTerms = () => {
    Linking.openURL("https://aceclub.app/terms");
  };

  const openPrivacy = () => {
    Linking.openURL("https://aceclub.app/privacy");
  };

  const skillLevels = selectedSport ? getSkillLevels(selectedSport) : [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Paramètres",
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()} hitSlop={8}>
              <X size={24} color={colors.accentGreen} strokeWidth={2} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={!canSave} hitSlop={8}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.accentGreen} />
              ) : (
                <Text
                  style={[
                    styles.saveButton,
                    { opacity: canSave ? 1 : 0.4 },
                  ]}
                >
                  Enregistrer
                </Text>
              )}
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          {/* Error/Success banners */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}
          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <EditableAvatar
              imageUrl={user?.image}
              localImageUri={selectedImageUri}
              name={user?.name ?? "?"}
              size={100}
              isUploading={isUploading}
              onImageSelected={handleImageSelected}
            />
          </View>

          {/* Personal Info */}
          <SectionCard title="Informations personnelles">
            <FormField
              label="Nom complet"
              value={name}
              onChangeText={setName}
              placeholder="Votre nom"
              autoCapitalize="words"
            />
            <View style={{ height: 12 }} />
            <FormField
              label="Numéro de téléphone"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="+33 6 12 34 56 78"
              keyboardType="phone-pad"
              error={
                phoneNumber && !isValidPhone(phoneNumber)
                  ? "Minimum 8 chiffres requis"
                  : null
              }
            />
          </SectionCard>

          {/* Club */}
          <SectionCard title="Club">
            <SettingsRow
              icon={<Building2 size={20} color={colors.accentGreen} strokeWidth={1.5} />}
              label={selectedOrganization?.name ?? "Sélectionner un club"}
              onPress={() => router.push({ pathname: "/(tabs)/profile/club-selection", params: { selectedId: selectedOrganization?.id ?? "" } })}
            />
          </SectionCard>

          {/* Sport */}
          <SectionCard title="Sport">
            <RadioGroup<Sport>
              options={[
                {
                  value: "tennis",
                  label: "Tennis",
                  icon: <Dumbbell size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />,
                },
                {
                  value: "padel",
                  label: "Padel",
                  icon: <Dumbbell size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />,
                },
              ]}
              selected={selectedSport}
              onSelect={handleSportChange}
            />
          </SectionCard>

          {/* Skill Level */}
          {selectedSport && skillLevels.length > 0 && (
            <SectionCard title="Niveau">
              <RadioGroup<string>
                options={skillLevels.map((l) => ({
                  value: l.value,
                  label: l.displayName,
                }))}
                selected={selectedSkillLevel}
                onSelect={setSelectedSkillLevel}
              />
            </SectionCard>
          )}

          {/* Notifications */}
          <SectionCard title="Notifications">
            <ToggleRow
              icon={<Bell size={20} color={colors.accentOrange} strokeWidth={1.5} />}
              label="Notifications push"
              description="Recevez des alertes pour les matchs et invitations"
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
            />
          </SectionCard>

          {/* Location */}
          <SectionCard title="Localisation">
            <ToggleRow
              icon={<MapPin size={20} color={colors.accentGreen} strokeWidth={1.5} />}
              label="Accès à la localisation"
              description="Permet de trouver des joueurs proches de vous"
              value={locationEnabled}
              onValueChange={handleLocationToggle}
            />
          </SectionCard>

          {/* E2EE */}
          <SectionCard title="Chiffrement de bout en bout">
            <SettingsRow
              icon={<Shield size={20} color={colors.accentGreen} strokeWidth={1.5} />}
              label="Sauvegarder ma clé"
              onPress={() => router.push("/(tabs)/profile/e2ee-backup")}
            />
            <View
              style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
            />
            <SettingsRow
              icon={<KeyRound size={20} color={colors.accentGreen} strokeWidth={1.5} />}
              label="Récupérer ma clé"
              onPress={() => router.push("/(tabs)/profile/e2ee-recovery")}
            />
          </SectionCard>

          {/* Legal */}
          <SectionCard title="Légal">
            <SettingsRow
              icon={<FileText size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />}
              label="Conditions Générales d'Utilisation"
              onPress={openTerms}
            />
            <View
              style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
            />
            <SettingsRow
              icon={<Hand size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />}
              label="Politique de Confidentialité"
              onPress={openPrivacy}
            />
          </SectionCard>

          {/* Danger Zone */}
          <SectionCard title="Zone dangereuse">
            <SettingsRow
              icon={<Trash2 size={20} color="#ef4444" strokeWidth={1.5} />}
              label="Supprimer mon compte"
              onPress={handleDeleteAccount}
              destructive
              showChevron={false}
            />
          </SectionCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.horizontal,
    gap: 16,
    paddingBottom: 40,
  },
  saveButton: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: radii.sm,
  },
  errorBannerText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  successBanner: {
    backgroundColor: `${colors.accentGreen}1A`,
    padding: 12,
    borderRadius: radii.sm,
  },
  successBannerText: {
    color: colors.accentGreen,
    fontSize: 14,
    textAlign: "center",
  },
});
