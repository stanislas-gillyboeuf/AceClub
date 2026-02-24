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
  FileText,
  Hand,
  X,
  Check,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useMe, usePreferences, useUpdateProfile, useDeleteAccount } from "@/hooks/use-user";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth-client";
import { clearAuthData } from "@/lib/auth-api";
import { queryClient } from "@/lib/query-client";
import { uploadService } from "@/services/upload";
import { getSkillLevels } from "@/lib/skill-levels";

import { SectionCard } from "@/components/ui/section-card";
import { FormField } from "@/components/ui/form-field";
import { SettingsRow } from "@/components/ui/settings-row";
import { ToggleRow } from "@/components/ui/toggle-row";
import { RadioGroup } from "@/components/ui/radio-group";
import { EditableAvatar } from "@/features/settings/components/editable-avatar";
import { consumePendingClubSelection } from "@/lib/pending-club-selection";
import Button from "@/components/ui/button";

import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { Sport } from "@/types/common";
import type { Organization } from "@/types/organization";

type Gender = "male" | "female" | "other";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
];

const now = new Date();
const MIN_AGE = 13;
const MAX_AGE = 100;
const maxBirthdate = new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate());
const minBirthdate = new Date(now.getFullYear() - MAX_AGE, now.getMonth(), now.getDate());
const defaultBirthdate = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());

/** Parse "YYYY-MM-DD" or ISO string into a Date */
function parseDateOfBirth(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Format Date to "YYYY-MM-DD" for the API */
function formatDateOfBirth(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function Settings() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: user } = useMe();
  const { data: preferences } = usePreferences();
  const updateProfile = useUpdateProfile();

  // Form state
  const [name, setName] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultBirthdate);
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");
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

  // Toggles — synced with real OS permissions
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const checkPermissions = useCallback(async () => {
    const { status: notifStatus } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(notifStatus === "granted");

    const { status: locStatus } = await Location.getForegroundPermissionsAsync();
    setLocationEnabled(locStatus === "granted");
  }, []);

  // Check on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Re-check when returning from OS settings
  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  // Delete account
  const deleteAccount = useDeleteAccount();

  // Initialize form from user data
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setSelectedGender(user.gender ?? null);
      const parsed = parseDateOfBirth(user.dateOfBirth);
      if (parsed) {
        setDateOfBirth(parsed);
        setHasDateOfBirth(true);
      }
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
      gender: user?.gender ?? null,
      dateOfBirth: user?.dateOfBirth ?? null,
      sport: (preferences?.sport as Sport) ?? null,
      skillLevel: preferences?.skillLevel ?? null,
      organizationId: preferences?.organizationId ?? null,
      image: user?.image ?? null,
    }),
    [user, preferences]
  );

  const currentDateOfBirthStr = hasDateOfBirth ? formatDateOfBirth(dateOfBirth) : null;

  const hasChanges =
    name !== originalValues.name ||
    selectedGender !== originalValues.gender ||
    currentDateOfBirthStr !== originalValues.dateOfBirth ||
    selectedSport !== originalValues.sport ||
    selectedSkillLevel !== originalValues.skillLevel ||
    selectedOrganization?.id !== originalValues.organizationId ||
    selectedImageUri !== null;

  const canSave =
    hasChanges &&
    name.trim().length > 0 &&
    !isSaving;

  // Sport change resets skill level
  const handleSportChange = (sport: Sport) => {
    setSelectedSport(sport);
    const levels = getSkillLevels(sport);
    if (levels.length > 0) {
      setSelectedSkillLevel(levels[0].value);
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

      if (trimmedName && trimmedName !== originalValues.name) payload.name = trimmedName;
      if (selectedGender && selectedGender !== originalValues.gender) payload.gender = selectedGender;
      if (currentDateOfBirthStr && currentDateOfBirthStr !== originalValues.dateOfBirth) payload.dateOfBirth = currentDateOfBirthStr;
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
              try { await authClient.signOut(); } catch {}
              await clearAuthData();
              queryClient.clear();
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
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setNotificationsEnabled(true);
      } else {
        // Permission denied — open OS settings
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        } else {
          Linking.openSettings();
        }
      }
    } else {
      // Can't revoke programmatically — open OS settings
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationEnabled(true);
      } else {
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        } else {
          Linking.openSettings();
        }
      }
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
                <Check
                  size={24}
                  color={colors.accentGreen}
                  strokeWidth={2.5}
                  style={{ opacity: canSave ? 1 : 0.4 }}
                />
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
          </SectionCard>

          {/* Gender */}
          <SectionCard title="Genre">
            <RadioGroup<Gender>
              options={GENDER_OPTIONS}
              selected={selectedGender}
              onSelect={setSelectedGender}
            />
          </SectionCard>

          {/* Date of Birth */}
          <SectionCard title="Date de naissance">
            {Platform.OS === "ios" ? (
              <View style={styles.datePickerRow}>
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setDateOfBirth(selectedDate);
                      setHasDateOfBirth(true);
                    }
                  }}
                  maximumDate={maxBirthdate}
                  minimumDate={minBirthdate}
                  locale="fr-FR"
                  style={{ height: 150 }}
                />
              </View>
            ) : (
              <>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={({ pressed }) => [
                    styles.dateButton,
                    { backgroundColor: semanticColors.cardBackground[scheme] },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ color: semanticColors.labelPrimary[scheme], fontSize: 16 }}>
                    {hasDateOfBirth
                      ? dateOfBirth.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                      : "Sélectionner une date"
                    }
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDateOfBirth(selectedDate);
                        setHasDateOfBirth(true);
                      }
                    }}
                    maximumDate={maxBirthdate}
                    minimumDate={minBirthdate}
                  />
                )}
              </>
            )}
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
          <Button
            label="Supprimer mon compte"
            onPress={handleDeleteAccount}
            variant="destructive"
          />

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
  datePickerRow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
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
