import { useState, useCallback, useEffect, useMemo } from "react";
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useCompleteOnboarding } from "@/hooks/use-user";
import { useMyOrganizations } from "@/hooks/use-organization";
import { uploadService } from "@/services/upload";
import { consumePendingClubSelection } from "@/lib/pending-club-selection";
import { formatDateForAPI } from "@/lib/date";
import { authClient } from "@/lib/auth-client";
import type { Organization } from "@/types/organization";
import type { Sport } from "@/types/common";

import { NameStep } from "@/features/onboarding/components/name-step";
import { GenderStep } from "@/features/onboarding/components/gender-step";
import { BirthdateStep } from "@/features/onboarding/components/birthdate-step";
import { ClubStep } from "@/features/onboarding/components/club-step";
import { SportStep } from "@/features/onboarding/components/sport-step";
import { LevelStep } from "@/features/onboarding/components/level-step";
import { PhotoStep } from "@/features/onboarding/components/photo-step";
import { ReadyStep } from "@/features/onboarding/components/ready-step";
import { NotificationStep } from "@/features/onboarding/components/notification-step";
import { LocationStep } from "@/features/onboarding/components/location-step";
import { ProgressBar } from "@/features/onboarding/components/progress-bar";
import { NavButtons } from "@/features/onboarding/components/nav-buttons";
import { SegmentProgressBar } from "@/features/onboarding/components/segment-progress-bar";
import { OnboardingNavButtons } from "@/features/onboarding/components/onboarding-nav-buttons";
import { onboardingColors } from "@/features/onboarding/theme";

type Gender = "male" | "female" | "other";

// Default date: 20 years ago
const defaultBirthdate = new Date(
  new Date().getFullYear() - 20,
  new Date().getMonth(),
  new Date().getDate()
);

/** Check if user already has a real name (not an email address) */
function hasValidName(name: string | undefined | null): boolean {
  if (!name || !name.trim()) return false;
  // If the name looks like an email, it's not a real name
  return !name.includes("@");
}

export default function Onboarding() {
  const { data: session } = authClient.useSession();

  // Parse existing name from session (Apple/Google may have provided it)
  const existingName = session?.user?.name;
  const skipNameStep = hasValidName(existingName);
  const skipBirthdateStep = !!session?.user?.dateOfBirth;

  // A profile claimed via reconciliation (features/auth/lib/run-reconciliation.ts) already
  // attached a club membership — no need to ask again.
  const { data: myOrganizations } = useMyOrganizations();
  const skipClubStep = (myOrganizations?.length ?? 0) > 0;

  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [skillLevels, setSkillLevels] = useState<Partial<Record<Sport, string>>>({});

  // Build steps list dynamically — skip name/birthdate/club if already known, and insert one
  // "level" step per selected sport (a dual-sport player rates both).
  const steps = useMemo(() => {
    const base = ["name", "gender", "birthdate", "club", "sport"] as const;
    const levelSteps = selectedSports.map((s) => `level-${s}` as const);
    const rest = ["photo", "ready", "notifications", "location"] as const;
    const allSteps = [...base, ...levelSteps, ...rest];
    return allSteps.filter((s) => {
      if (s === "name") return !skipNameStep;
      if (s === "birthdate") return !skipBirthdateStep;
      if (s === "club") return !skipClubStep;
      return true;
    });
  }, [skipNameStep, skipBirthdateStep, skipClubStep, selectedSports]);

  const [currentStep, setCurrentStep] = useState(0);

  // If the steps list shrinks (e.g. player deselects a sport after already picking its
  // level) while sitting past the new end, clamp back onto the last valid step.
  useEffect(() => {
    setCurrentStep((s) => Math.min(s, steps.length - 1));
  }, [steps.length]);

  // Name state — pre-filled from session when it loads (Apple/Google may have provided it)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameInitialized, setNameInitialized] = useState(false);

  // Sync name from session once it loads (session is async)
  useEffect(() => {
    if (nameInitialized || !hasValidName(existingName)) return;
    const parts = existingName!.split(" ");
    setFirstName(parts[0]);
    setLastName(parts.slice(1).join(" "));
    setNameInitialized(true);
  }, [existingName, nameInitialized]);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultBirthdate);
  // Skipping the birthdate step (skipBirthdateStep above) must not silently overwrite the
  // already-known date with the defaultBirthdate placeholder on submit — session loads async,
  // so this syncs once it's available (same pattern as the name sync above).
  useEffect(() => {
    if (session?.user?.dateOfBirth) {
      setDateOfBirth(new Date(session.user.dateOfBirth));
    }
  }, [session?.user?.dateOfBirth]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  // The club step is skipped (skipClubStep above) once this loads — pre-fill it so submission
  // still has an organizationId, since the step that would normally set it never runs.
  useEffect(() => {
    if (!selectedOrganization && skipClubStep && myOrganizations?.[0]) {
      setSelectedOrganization(myOrganizations[0]);
    }
  }, [selectedOrganization, skipClubStep, myOrganizations]);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  // PIN
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completeOnboarding = useCompleteOnboarding();
  const { refetch: refetchSession } = authClient.useSession();

  // Consume pending club selection when returning from club-selection formSheet
  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingClubSelection();
      if (selection) {
        setSelectedOrganization(selection.organization);
        // PIN will be entered inline in ClubStep, reset pin state
        setIsPinVerified(false);
        setVerifiedPin(null);
      }
    }, [])
  );

  const currentStepName = steps[currentStep];

  const getButtonLabel = useCallback((): string => {
    switch (currentStepName) {
      case "name":
        return "C'est parti";
      case "club":
        return "Valider mon club";
      default:
        return "Continuer";
    }
  }, [currentStepName]);

  const canGoNext = useCallback((): boolean => {
    switch (currentStepName) {
      case "name":
        return firstName.trim().length >= 2;
      case "gender":
        return !!selectedGender;
      case "birthdate":
        return true;
      case "club":
        return !!selectedOrganization && (!selectedOrganization.pinEnabled || isPinVerified);
      case "sport":
        return selectedSports.length > 0;
      case "photo":
        return true;
      case "ready":
        return true;
      case "notifications":
        return true;
      case "location":
        return true;
      default:
        if (currentStepName?.startsWith("level-")) {
          const sport = currentStepName.slice("level-".length) as Sport;
          return !!skillLevels[sport];
        }
        return false;
    }
  }, [currentStepName, firstName, selectedGender, selectedOrganization, isPinVerified, selectedSports, skillLevels]);

  const goNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  };

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      Haptics.selectionAsync();
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    const [primarySport, secondarySport] = selectedSports;
    if (!selectedOrganization || !primarySport || !skillLevels[primarySport] || !selectedGender) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (profileImageUri) {
        const result = await uploadService.uploadUserImage(
          profileImageUri,
          "profile.jpg",
          "image/jpeg"
        );
        imageUrl = result.imageUrl;
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload = {
        name: fullName,
        organizationId: selectedOrganization.id,
        sport: primarySport,
        skillLevel: skillLevels[primarySport]!,
        gender: selectedGender,
        dateOfBirth: formatDateForAPI(dateOfBirth),
        ...(secondarySport && skillLevels[secondarySport]
          ? { secondarySport, secondarySkillLevel: skillLevels[secondarySport] }
          : {}),
        ...(imageUrl && { imageUrl }),
        ...(verifiedPin && { pin: verifiedPin }),
      };
      console.log("[onboarding] Sending payload:", JSON.stringify(payload, null, 2));

      await completeOnboarding.mutateAsync(payload);
      // Refresh Better Auth reactive session so onboardingCompleted is true
      await refetchSession();
      router.replace("/(tabs)/feed");
    } catch (error: any) {
      console.log("[onboarding] Error:", error.message ?? error);
      Alert.alert("Erreur", "Une erreur est survenue. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectSportOption = useCallback((option: "tennis" | "padel" | "both") => {
    setSelectedSports(option === "both" ? ["tennis", "padel"] : [option]);
  }, []);

  const handleSkillLevelChange = useCallback((sport: Sport, level: string) => {
    setSkillLevels((prev) => ({ ...prev, [sport]: level }));
  }, []);

  const renderStep = () => {
    switch (currentStepName) {
      case "name":
        return (
          <NameStep
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
          />
        );
      case "gender":
        return (
          <GenderStep
            selectedGender={selectedGender}
            onSelect={setSelectedGender}
            firstName={firstName}
          />
        );
      case "birthdate":
        return (
          <BirthdateStep
            dateOfBirth={dateOfBirth}
            onDateChange={setDateOfBirth}
          />
        );
      case "club":
        return (
          <ClubStep
            firstName={firstName}
            selectedOrganization={selectedOrganization}
            isPinVerified={isPinVerified}
            onPinVerified={(pin) => {
              setIsPinVerified(true);
              setVerifiedPin(pin);
            }}
          />
        );
      case "sport":
        return (
          <SportStep
            selectedSports={selectedSports}
            onSelectOption={handleSelectSportOption}
            firstName={firstName}
            clubName={selectedOrganization?.name ?? null}
          />
        );
      case "photo":
        return (
          <PhotoStep
            imageUri={profileImageUri}
            onImageSelected={setProfileImageUri}
            onSkip={goNext}
            firstName={firstName}
          />
        );
      case "ready":
        return <ReadyStep onComplete={goNext} />;
      case "notifications":
        return <NotificationStep onComplete={goNext} />;
      case "location":
        return <LocationStep onComplete={goNext} />;
      default:
        if (currentStepName?.startsWith("level-")) {
          const sport = currentStepName.slice("level-".length) as Sport;
          return (
            <LevelStep
              sport={sport}
              selectedLevel={skillLevels[sport] ?? null}
              onSelect={(level) => handleSkillLevelChange(sport, level)}
            />
          );
        }
        return null;
    }
  };

  // The redesigned sport/level/photo/ready screens use their own dark theme, segmented
  // progress bar and nav buttons — everything else (name/gender/birthdate/club,
  // notifications/location) keeps the original light wizard untouched.
  const isPhase1Step =
    currentStepName === "sport" ||
    currentStepName?.startsWith("level-") ||
    currentStepName === "photo" ||
    currentStepName === "ready";
  const segmentIndex: 0 | 1 | 2 | null =
    currentStepName === "sport"
      ? 0
      : currentStepName?.startsWith("level-")
        ? 1
        : currentStepName === "photo"
          ? 2
          : null;
  const showNavButtons =
    currentStepName !== "notifications" && currentStepName !== "location" && currentStepName !== "ready";

  const content = (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {isPhase1Step ? (
          segmentIndex != null && <SegmentProgressBar activeIndex={segmentIndex} />
        ) : (
          <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
        )}

        <View style={styles.flex}>
          <Animated.View
            key={currentStep}
            entering={() => {
              'worklet';
              return {
                initialValues: { opacity: 0 },
                animations: { opacity: withTiming(1, { duration: 300 }) },
              };
            }}
            exiting={() => {
              'worklet';
              return {
                initialValues: { opacity: 1 },
                animations: { opacity: withTiming(0, { duration: 200 }) },
              };
            }}
            style={styles.flex}
          >
            {renderStep()}
          </Animated.View>
        </View>

        {showNavButtons &&
          (isPhase1Step ? (
            <OnboardingNavButtons
              canGoBack={currentStep > 0}
              canGoNext={canGoNext()}
              label={getButtonLabel()}
              isSubmitting={isSubmitting}
              onBack={goBack}
              onNext={goNext}
            />
          ) : (
            <NavButtons
              canGoBack={currentStep > 0}
              canGoNext={canGoNext()}
              label={getButtonLabel()}
              isSubmitting={isSubmitting}
              onBack={goBack}
              onNext={goNext}
            />
          ))}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (isPhase1Step) {
    return <View style={[styles.gradient, { backgroundColor: onboardingColors.bg }]}>{content}</View>;
  }

  return (
    <LinearGradient colors={["#EDF5F0", "#FAFAFA"]} style={styles.gradient}>
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
