import { useState, useCallback } from "react";
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import { useCompleteOnboarding } from "@/hooks/use-user";
import { uploadService } from "@/services/upload";
import { colors } from "@/constants/theme";
import type { Organization } from "@/types/organization";
import type { Sport } from "@/types/common";

import { WelcomeStep } from "@/features/onboarding/components/welcome-step";
import { ClubStep } from "@/features/onboarding/components/club-step";
import { SportStep } from "@/features/onboarding/components/sport-step";
import { LevelStep } from "@/features/onboarding/components/level-step";
import { PhotoStep } from "@/features/onboarding/components/photo-step";
import { PhoneStep } from "@/features/onboarding/components/phone-step";
import { ProgressBar } from "@/features/onboarding/components/progress-bar";
import { NavButtons } from "@/features/onboarding/components/nav-buttons";

const TOTAL_STEPS = 6; // 0=welcome, 1=club, 2=sport, 3=level, 4=photo, 5=phone

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  // Data
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // PIN
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completeOnboarding = useCompleteOnboarding();

  const canGoNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return !!selectedOrganization && (!selectedOrganization.pinEnabled || isPinVerified);
      case 2:
        return !!selectedSport;
      case 3:
        return !!selectedSkillLevel;
      case 4:
        return true; // photo is optional
      case 5:
        return phoneNumber.replace(/\D/g, "").length >= 6;
      default:
        return false;
    }
  }, [currentStep, selectedOrganization, isPinVerified, selectedSport, selectedSkillLevel, phoneNumber]);

  const goNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  };

  const goBack = useCallback(() => {
    if (currentStep > 1) {
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

      const cleanPhone = "+33" + phoneNumber.replace(/\D/g, "");

      const payload = {
        organizationId: selectedOrganization.id,
        sport: selectedSport,
        skillLevel: selectedSkillLevel,
        phoneNumber: cleanPhone,
        ...(imageUrl && { imageUrl }),
        ...(verifiedPin && { pin: verifiedPin }),
      };
      console.log("[onboarding] Sending payload:", JSON.stringify(payload, null, 2));

      await completeOnboarding.mutateAsync(payload);

      await authClient.updateUser({ onboardingCompleted: true });
      router.replace("/(tabs)/feed");
    } catch (error: any) {
      console.log("[onboarding] Error:", error.message ?? error);
      Alert.alert("Erreur", "Une erreur est survenue. Reessaie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOrg = useCallback((org: Organization) => {
    setSelectedOrganization(org);
  }, []);

  const handlePinVerified = useCallback((pin: string) => {
    setIsPinVerified(true);
    setVerifiedPin(pin);
    setPinError(null);
  }, []);

  const handlePinError = useCallback((error: string) => {
    setPinError(error);
  }, []);

  const handleSelectSport = useCallback((sport: Sport) => {
    setSelectedSport(sport);
    // Reset level when sport changes
    setSelectedSkillLevel(null);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onStart={() => setCurrentStep(1)} />;
      case 1:
        return (
          <ClubStep
            selectedOrganization={selectedOrganization}
            isPinVerified={isPinVerified}
            onSelect={handleSelectOrg}
            onPinVerified={handlePinVerified}
            onPinError={handlePinError}
            pinError={pinError}
          />
        );
      case 2:
        return (
          <SportStep
            selectedSport={selectedSport}
            onSelect={handleSelectSport}
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
          />
        );
      case 5:
        return (
          <PhoneStep
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {currentStep > 0 && <ProgressBar currentStep={currentStep} />}

        <View style={styles.flex}>{renderStep()}</View>

        {currentStep > 0 && (
          <NavButtons
            canGoBack={currentStep > 1}
            canGoNext={canGoNext()}
            isLastStep={currentStep === TOTAL_STEPS - 1}
            isSubmitting={isSubmitting}
            onBack={goBack}
            onNext={goNext}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  flex: {
    flex: 1,
  },
});
