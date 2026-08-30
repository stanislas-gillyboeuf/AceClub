import { useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { Stack, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateMatchIntent } from "@/hooks/use-match-intent";
import { usePreferences } from "@/hooks/use-user";
import {
  useCreateIntentFormStore,
  combineDateAndTime,
  isTimeValid,
} from "@/store/create-intent-form";
import { useCreateIntentStepperStore } from "@/store/create-intent-stepper";
import { StepperNav } from "@/components/ui/stepper-nav";
import Stepper, { useIntentStepperActions } from "./steps/stepper";
import { colors, semanticColors } from "@/constants/theme";

export default function CreateIntent() {
  const scheme = useColorScheme();
  const createIntent = useCreateMatchIntent();
  const { data: preferences } = usePreferences();
  const isPadel = preferences?.sport === "padel";

  const {
    canGoPrev,
    isLastStep,
    isFirstStep,
    next,
    prev,
    currentStep,
  } = useIntentStepperActions();
  const setTotalSteps = useCreateIntentStepperStore((s) => s.setTotalSteps);

  const intentType = useCreateIntentFormStore((s) => s.intentType);
  const date = useCreateIntentFormStore((s) => s.date);
  const time = useCreateIntentFormStore((s) => s.time);
  const isFlexibleDate = useCreateIntentFormStore((s) => s.isFlexibleDate);
  const duration = useCreateIntentFormStore((s) => s.duration);
  const description = useCreateIntentFormStore((s) => s.description);
  const teammates = useCreateIntentFormStore((s) => s.teammates);
  const resetForm = useCreateIntentFormStore((s) => s.reset);
  const resetStepper = useCreateIntentStepperStore((s) => s.reset);

  const isCreating = createIntent.isPending;

  useEffect(() => {
    setTotalSteps(isPadel ? 5 : 4);
  }, [isPadel, setTotalSteps]);

  // Step validation — index 3 is "Coéquipiers" (padel only, optional) or "Description" (tennis)
  const canProceed = (() => {
    switch (currentStep) {
      case 0: // Activity type - always valid (has default)
        return true;
      case 1: // Date & time
        return isFlexibleDate || isTimeValid(date, time);
      case 2: // Duration
        return duration !== null;
      case 3: // Teammates (padel, optional) or Description (tennis, optional)
        return true;
      case 4: // Description (padel only) - always valid (optional)
        return true;
      default:
        return false;
    }
  })();

  const handleDismiss = useCallback(() => {
    resetForm();
    resetStepper();
    router.dismiss();
  }, [resetForm, resetStepper]);

  useEffect(() => {
    return () => {
      resetForm();
      resetStepper();
    };
  }, [resetForm, resetStepper]);

  const handleCreate = useCallback(() => {
    const combined = combineDateAndTime(date, time);
    const dateStr = `${combined.getFullYear()}-${String(combined.getMonth() + 1).padStart(2, "0")}-${String(combined.getDate()).padStart(2, "0")}`;
    const timeStr = `${String(combined.getHours()).padStart(2, "0")}:${String(combined.getMinutes()).padStart(2, "0")}`;
    const teammateUserIds = isPadel
      ? teammates.filter((t): t is NonNullable<typeof t> => t !== null).map((t) => t.id)
      : undefined;

    createIntent.mutate(
      {
        ...(isFlexibleDate ? {} : { date: dateStr, time: timeStr }),
        isFlexibleDate,
        duration: duration ?? 90,
        type: intentType,
        description: description.trim() || undefined,
        teammateUserIds,
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          handleDismiss();
        },
        onError: () => {
          Alert.alert("Erreur", "Impossible de créer la dispo.");
        },
      }
    );
  }, [date, time, isFlexibleDate, duration, intentType, description, teammates, isPadel, createIntent, handleDismiss]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleCreate();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      next();
    }
  }, [isLastStep, next, handleCreate]);

  const stepTitle = (
    isPadel
      ? ["Type d'activité", "Quand ?", "Durée", "Coéquipiers", "Description"]
      : ["Type d'activité", "Quand ?", "Durée", "Description"]
  )[currentStep];

  return (
    <>
      <Stack.Screen
        options={{
          title: stepTitle ?? "Nouvelle dispo",
          headerTransparent: true,
        }}
      />

      {Platform.OS === "ios" && (
        <>
          {!isFirstStep && (
            <Stack.Toolbar placement="left">
              <Stack.Toolbar.Button
                icon="chevron.left"
                variant="prominent"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  prev();
                }}
                tintColor={colors.accentGreen}
              />
            </Stack.Toolbar>
          )}
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              icon="xmark"
              onPress={handleDismiss}
            />
          </Stack.Toolbar>
        </>
      )}

      <ScrollView
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
      >
        <Stepper isPadel={isPadel} />
      </ScrollView>

      <StepperNav
        canGoPrev={canGoPrev}
        canProceed={canProceed}
        isLastStep={isLastStep}
        isFirstStep={isFirstStep}
        isLoading={isCreating}
        onBack={prev}
        onNext={handleNext}
        onCancel={handleDismiss}
        lastStepLabel="Publier"
      />

      {isCreating && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: semanticColors.cardBackground[scheme] },
            ]}
          >
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text
              style={[
                styles.overlayText,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Publication...
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderRadius: 12,
  },
  overlayText: {
    fontSize: 14,
  },
});
