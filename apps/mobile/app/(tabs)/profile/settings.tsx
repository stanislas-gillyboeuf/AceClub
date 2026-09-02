import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Building2, Shield, X, Check } from "lucide-react-native";
import type * as ImagePicker from "expo-image-picker";

import { useMe, usePreferences, useUpdateProfile, useDeleteAccount } from "@/hooks/use-user";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/auth-client";
import { clearAuthData } from "@/lib/auth-api";
import { queryClient } from "@/lib/query-client";
import { uploadService } from "@/services/upload";
import { getSkillLevels } from "@/lib/skill-levels";

import { SectionCard } from "@/components/ui/section-card";
import { SettingsRow } from "@/components/ui/settings-row";
import { EditableAvatar } from "@/features/settings/components/editable-avatar";
import { ProfileInfoSection, type Gender } from "@/features/settings/components/profile-info-section";
import { SportLevelSection } from "@/features/settings/components/sport-level-section";
import { PermissionsSection } from "@/features/settings/components/permissions-section";
import { LegalSection } from "@/features/settings/components/legal-section";
import { useOSPermissions } from "@/features/settings/hooks/use-os-permissions";
import { consumePendingClubSelection } from "@/lib/pending-club-selection";
import Button from "@/components/ui/button";

import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { Sport } from "@/types/common";
import type { Organization } from "@/types/organization";

const now = new Date();
const MIN_AGE = 13;
const MAX_AGE = 100;
const maxBirthdate = new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate());
const minBirthdate = new Date(now.getFullYear() - MAX_AGE, now.getMonth(), now.getDate());
const defaultBirthdate = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());

function parseDateOfBirth(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateOfBirth(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function Settings() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: user } = useMe();
  const { data: preferences } = usePreferences();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const osPermissions = useOSPermissions();

  const [name, setName] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultBirthdate);
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [skillLevels, setSkillLevels] = useState<Partial<Record<Sport, string>>>({});
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setSelectedGender((user.gender as Gender) ?? null);
      const parsed = parseDateOfBirth(user.dateOfBirth);
      if (parsed) {
        setDateOfBirth(parsed);
        setHasDateOfBirth(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (preferences) {
      const sports: Sport[] = [];
      const levels: Partial<Record<Sport, string>> = {};
      if (preferences.sport) {
        sports.push(preferences.sport as Sport);
        levels[preferences.sport as Sport] = preferences.skillLevel;
      }
      if (preferences.secondarySport) {
        sports.push(preferences.secondarySport as Sport);
        if (preferences.secondarySkillLevel) {
          levels[preferences.secondarySport as Sport] = preferences.secondarySkillLevel;
        }
      }
      setSelectedSports(sports);
      setSkillLevels(levels);
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

  const originalValues = useMemo(
    () => ({
      name: user?.name ?? "",
      gender: (user?.gender as Gender | null) ?? null,
      dateOfBirth: user?.dateOfBirth ?? null,
      sport: (preferences?.sport as Sport) ?? null,
      skillLevel: preferences?.skillLevel ?? null,
      secondarySport: (preferences?.secondarySport as Sport) ?? null,
      secondarySkillLevel: preferences?.secondarySkillLevel ?? null,
      organizationId: preferences?.organizationId ?? null,
      image: user?.image ?? null,
    }),
    [user, preferences]
  );

  const originalSports = useMemo(
    () => [originalValues.sport, originalValues.secondarySport].filter((s): s is Sport => !!s),
    [originalValues.sport, originalValues.secondarySport]
  );

  const originalLevelFor = useCallback(
    (sport: Sport) => {
      if (sport === originalValues.sport) return originalValues.skillLevel;
      if (sport === originalValues.secondarySport) return originalValues.secondarySkillLevel;
      return null;
    },
    [originalValues]
  );

  const currentDateOfBirthStr = hasDateOfBirth ? formatDateOfBirth(dateOfBirth) : null;

  const sportsChanged =
    [...selectedSports].sort().join(",") !== [...originalSports].sort().join(",") ||
    selectedSports.some((s) => (skillLevels[s] ?? null) !== originalLevelFor(s));

  const hasChanges =
    name !== originalValues.name ||
    selectedGender !== originalValues.gender ||
    currentDateOfBirthStr !== originalValues.dateOfBirth ||
    sportsChanged ||
    selectedOrganization?.id !== originalValues.organizationId ||
    selectedImageUri !== null;

  const canSave =
    hasChanges &&
    name.trim().length > 0 &&
    selectedSports.length > 0 &&
    selectedSports.every((s) => !!skillLevels[s]) &&
    !isSaving;

  const handleToggleSport = (sport: Sport) => {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        // Always keep at least one sport selected.
        return prev.length > 1 ? prev.filter((s) => s !== sport) : prev;
      }
      return [...prev, sport];
    });
    setSkillLevels((prev) => {
      if (prev[sport]) return prev;
      const levels = getSkillLevels(sport);
      return levels.length > 0 ? { ...prev, [sport]: levels[0].value } : prev;
    });
  };

  const handleSkillLevelChange = (sport: Sport, value: string) => {
    setSkillLevels((prev) => ({ ...prev, [sport]: value }));
  };

  const handleDateOfBirthChange = (date: Date) => {
    setDateOfBirth(date);
    setHasDateOfBirth(true);
  };

  const handleImageSelected = (asset: ImagePicker.ImagePickerAsset) => {
    setSelectedImageUri(asset.uri);
  };

  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingClubSelection();
      if (selection) {
        setSelectedOrganization(selection.organization);
        if (selection.pin) setPendingPin(selection.pin);
      }
    }, [])
  );

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let imageUrl: string | null = null;

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

      const payload: Record<string, string | null> = {};
      const trimmedName = name.trim();

      if (trimmedName && trimmedName !== originalValues.name) payload.name = trimmedName;
      if (selectedGender && selectedGender !== originalValues.gender) payload.gender = selectedGender;
      if (currentDateOfBirthStr && currentDateOfBirthStr !== originalValues.dateOfBirth) payload.dateOfBirth = currentDateOfBirthStr;
      if (sportsChanged) {
        const [primarySport, secondarySport] = selectedSports;
        if (primarySport) {
          payload.sport = primarySport;
          payload.skillLevel = skillLevels[primarySport] ?? null;
        }
        // Explicit null clears the second sport when the player drops back to one.
        payload.secondarySport = secondarySport ?? null;
        if (secondarySport) payload.secondarySkillLevel = skillLevels[secondarySport] ?? null;
      }
      if (selectedOrganization?.id && selectedOrganization.id !== originalValues.organizationId) {
        payload.organizationId = selectedOrganization.id;
        if (pendingPin) payload.pin = pendingPin;
      }
      if (imageUrl) payload.image = imageUrl;

      await updateProfile.mutateAsync(payload);

      setSuccessMessage("Profil mis à jour avec succès");
      setSelectedImageUri(null);
      setPendingPin(null);

      setTimeout(() => router.dismiss(), 500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la mise à jour du profil";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

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
              try {
                await authClient.signOut();
              } catch {}
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

          <ProfileInfoSection
            name={name}
            onNameChange={setName}
            gender={selectedGender}
            onGenderChange={setSelectedGender}
            dateOfBirth={dateOfBirth}
            hasDateOfBirth={hasDateOfBirth}
            onDateOfBirthChange={handleDateOfBirthChange}
            minBirthdate={minBirthdate}
            maxBirthdate={maxBirthdate}
            scheme={scheme}
          />

          <SectionCard title="Club">
            <SettingsRow
              icon={<Building2 size={20} color={colors.accentGreen} strokeWidth={1.5} />}
              label={selectedOrganization?.name ?? "Sélectionner un club"}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/profile/club-selection",
                  params: { selectedId: selectedOrganization?.id ?? "" },
                })
              }
            />
          </SectionCard>

          <SportLevelSection
            sports={selectedSports}
            onToggleSport={handleToggleSport}
            skillLevels={skillLevels}
            onSkillLevelChange={handleSkillLevelChange}
            scheme={scheme}
          />

          <PermissionsSection
            notificationsEnabled={osPermissions.notificationsEnabled}
            locationEnabled={osPermissions.locationEnabled}
            onNotificationsToggle={osPermissions.handleNotificationsToggle}
            onLocationToggle={osPermissions.handleLocationToggle}
          />

          <LegalSection scheme={scheme} />

          {user?.role === "admin" && (
            <SectionCard title="Administration">
              <SettingsRow
                icon={<Shield size={20} color={colors.accentOrange} strokeWidth={1.5} />}
                label="Gestion de la plateforme"
                onPress={() => router.push("/(tabs)/profile/admin")}
              />
            </SectionCard>
          )}

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
  avatarSection: {
    alignItems: "center",
    paddingVertical: 8,
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
