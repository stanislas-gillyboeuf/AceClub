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
import { useMe } from "@/hooks/use-user";
import { useCreateMatch, useUpdateVenue } from "@/hooks/use-match";
import { useCreateMatchFormStore, combineDateAndSlot } from "@/store/create-match-form";
import { useCreateMatchStepperStore } from "@/store/create-match-stepper";
import { StepperNav } from "@/components/ui/stepper-nav";
import Stepper, { useStepperActions } from "./steps/steper";
import { colors, semanticColors } from "@/constants/theme";

export default function CreateMatch() {
  const scheme = useColorScheme();
  const { data: me } = useMe();
  const createMatch = useCreateMatch();
  const updateVenue = useUpdateVenue();

  const {
    canGoNext,
    canGoPrev,
    isLastStep,
    isFirstStep,
    next,
    prev,
    currentStep,
  } = useStepperActions();

  const matchType = useCreateMatchFormStore((s) => s.matchType);
  const awayUser = useCreateMatchFormStore((s) => s.awayUser);
  const venue = useCreateMatchFormStore((s) => s.venue);
  const scheduledDate = useCreateMatchFormStore((s) => s.scheduledDate);
  const selectedSlot = useCreateMatchFormStore((s) => s.selectedSlot);
  const resetForm = useCreateMatchFormStore((s) => s.reset);
  const resetStepper = useCreateMatchStepperStore((s) => s.reset);

  const isOpponentStep = currentStep === 1;

  const isCreating = createMatch.isPending || updateVenue.isPending;

  // Step validation
  const canProceed = (() => {
    switch (currentStep) {
      case 0: // Activity type - always valid (has default)
        return true;
      case 1: // Opponent
        return !!awayUser && !!me && me.id !== awayUser.id;
      case 2: // Venue - optional
        return true;
      case 3: // Date & time
        return !!selectedSlot;
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

  const handleCreate = useCallback(async () => {
    if (!me || !awayUser || !selectedSlot) return;

    const scheduledAt = combineDateAndSlot(scheduledDate, selectedSlot);

    createMatch.mutate(
      {
        createdBy: me.id,
        status: "scheduled",
        type: matchType,
        createdAt: new Date().toISOString(),
        scheduledAt: scheduledAt.toISOString(),
        participants: [
          { userId: me.id, side: "home", isWinner: false },
          { userId: awayUser.id, side: "away", isWinner: false },
        ],
        sets: [],
      },
      {
        onSuccess: (data) => {
          if (venue) {
            updateVenue.mutate(
              { id: data.match.id, venueOrganizationId: venue.id },
              {
                onSettled: () => {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  handleDismiss();
                },
              }
            );
          } else {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            handleDismiss();
          }
        },
        onError: (err) => {
          Alert.alert(
            "Erreur",
            err.message ?? "Impossible de créer le match."
          );
        },
      }
    );
  }, [
    me,
    awayUser,
    selectedSlot,
    scheduledDate,
    matchType,
    venue,
    createMatch,
    updateVenue,
    handleDismiss,
  ]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleCreate();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      next();
    }
  }, [isLastStep, next, handleCreate]);

  const stepTitle = ["Type d'activité", "Adversaire", "Lieu", "Quand ?"][
    currentStep
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: stepTitle ?? "Nouveau match",
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
              variant="prominent"
              onPress={handleDismiss}
              tintColor={colors.accentGreen}
            />
          </Stack.Toolbar>
        </>
      )}

      {isOpponentStep ? (
        <View style={[styles.flexContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <Stepper />
        </View>
      ) : (
        <ScrollView
          style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
        >
          <Stepper />
        </ScrollView>
      )}

      <StepperNav
        canGoPrev={canGoPrev}
        canProceed={canProceed}
        isLastStep={isLastStep}
        isFirstStep={isFirstStep}
        isLoading={isCreating}
        onBack={prev}
        onNext={handleNext}
        onCancel={handleDismiss}
        lastStepLabel="Planifier le match"
      />

      {isCreating && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.overlayCard,
              {
                backgroundColor: semanticColors.cardBackground[scheme],
              },
            ]}
          >
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text
              style={[
                styles.overlayText,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
            >
              Création du match...
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
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
