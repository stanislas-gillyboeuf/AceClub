import { useState, useCallback } from "react";
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useCompleteOnboarding } from "@/hooks/use-user";
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
import { NotificationStep } from "@/features/onboarding/components/notification-step";
import { LocationStep } from "@/features/onboarding/components/location-step";
import { ProgressBar } from "@/features/onboarding/components/progress-bar";
import { NavButtons } from "@/features/onboarding/components/nav-buttons";

type Gender = "male" | "female" | "other";

const TOTAL_STEPS = 9; // 0=name, 1=gender, 2=birthdate, 3=club, 4=sport, 5=level, 6=photo, 7=notifications, 8=location

// Default date: 20 years ago
const defaultBirthdate = new Date(
  new Date().getFullYear() - 20,
  new Date().getMonth(),
  new Date().getDate()
);

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  // Data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultBirthdate);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
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

  const getButtonLabel = useCallback((): string => {
    switch (currentStep) {
      case 0:
        return "C'est parti";
      case 3:
        return "Valider mon club";
      default:
        return "Continuer";
    }
  }, [currentStep]);

  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return firstName.trim().length >= 2;
      case 1:
        return !!selectedGender;
      case 2:
        return true; // dateOfBirth always has a default value
      case 3:
        return !!selectedOrganization && (!selectedOrganization.pinEnabled || isPinVerified);
      case 4:
        return !!selectedSport;
      case 5:
        return !!selectedSkillLevel;
      case 6:
        return true; // photo is optional
      case 7:
        return true; // notifications always skippable
      case 8:
        return true; // location always skippable
      default:
        return false;
    }
  }, [currentStep, firstName, selectedGender, selectedOrganization, isPinVerified, selectedSport, selectedSkillLevel]);

  const goNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < TOTAL_STEPS - 1) {
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
    if (!selectedOrganization || !selectedSport || !selectedSkillLevel || !selectedGender) return;

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
        sport: selectedSport,
        skillLevel: selectedSkillLevel,
        gender: selectedGender,
        dateOfBirth: formatDateForAPI(dateOfBirth),
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

  const handleSelectSport = useCallback((sport: Sport) => {
    setSelectedSport(sport);
    setSelectedSkillLevel(null);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStep
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
          />
        );
      case 1:
        return (
          <GenderStep
            selectedGender={selectedGender}
            onSelect={setSelectedGender}
            firstName={firstName}
          />
        );
      case 2:
        return (
          <BirthdateStep
            dateOfBirth={dateOfBirth}
            onDateChange={setDateOfBirth}
          />
        );
      case 3:
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
      case 4:
        return (
          <SportStep
            selectedSport={selectedSport}
            onSelect={handleSelectSport}
            firstName={firstName}
            clubName={selectedOrganization?.name ?? null}
          />
        );
      case 5:
        return selectedSport ? (
          <LevelStep
            sport={selectedSport}
            selectedLevel={selectedSkillLevel}
            onSelect={setSelectedSkillLevel}
          />
        ) : null;
      case 6:
        return (
          <PhotoStep
            imageUri={profileImageUri}
            onImageSelected={setProfileImageUri}
            firstName={firstName}
          />
        );
      case 7:
        return <NotificationStep onComplete={goNext} />;
      case 8:
        return <LocationStep onComplete={goNext} />;
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={["#EDF5F0", "#FAFAFA"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ProgressBar currentStep={currentStep} />

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

          {currentStep <= 6 && (
            <NavButtons
              canGoBack={currentStep > 0}
              canGoNext={canGoNext()}
              label={getButtonLabel()}
              isSubmitting={isSubmitting}
              onBack={goBack}
              onNext={goNext}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
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
