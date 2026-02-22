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
import { authClient } from "@/lib/auth-client";
import type { Organization } from "@/types/organization";
import type { Sport } from "@/types/common";

import { NameStep } from "@/features/onboarding/components/name-step";
import { ClubStep } from "@/features/onboarding/components/club-step";
import { SportStep } from "@/features/onboarding/components/sport-step";
import { LevelStep } from "@/features/onboarding/components/level-step";
import { PhotoStep } from "@/features/onboarding/components/photo-step";
import { ProgressBar } from "@/features/onboarding/components/progress-bar";
import { NavButtons } from "@/features/onboarding/components/nav-buttons";

const TOTAL_STEPS = 5; // 0=name, 1=club, 2=sport, 3=level, 4=photo

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  // Data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      case 1:
        return "Valider mon club";
      case 4:
        return profileImageUri ? "Commencer à jouer" : "Passer";
      default:
        return "Continuer";
    }
  }, [currentStep, profileImageUri]);

  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return firstName.trim().length >= 2;
      case 1:
        return !!selectedOrganization && (!selectedOrganization.pinEnabled || isPinVerified);
      case 2:
        return !!selectedSport;
      case 3:
        return !!selectedSkillLevel;
      case 4:
        return true; // photo is optional
      default:
        return false;
    }
  }, [currentStep, firstName, selectedOrganization, isPinVerified, selectedSport, selectedSkillLevel]);

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
    if (!selectedOrganization || !selectedSport || !selectedSkillLevel) return;

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
      case 2:
        return (
          <SportStep
            selectedSport={selectedSport}
            onSelect={handleSelectSport}
            firstName={firstName}
            clubName={selectedOrganization?.name ?? null}
          />
        );
      case 3:
        return selectedSport ? (
          <LevelStep
            sport={selectedSport}
            selectedLevel={selectedSkillLevel}
            onSelect={setSelectedSkillLevel}
          />
        ) : null;
      case 4:
        return (
          <PhotoStep
            imageUri={profileImageUri}
            onImageSelected={setProfileImageUri}
            firstName={firstName}
          />
        );
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

          <NavButtons
            canGoBack={currentStep > 0}
            canGoNext={canGoNext()}
            label={getButtonLabel()}
            isSubmitting={isSubmitting}
            onBack={goBack}
            onNext={goNext}
          />
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
