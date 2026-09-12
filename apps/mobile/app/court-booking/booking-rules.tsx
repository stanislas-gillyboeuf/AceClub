import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { courtColors, courtFontMono } from "@/features/court-booking/theme";
import { useMyOrganizations, useActiveMemberRole } from "@/hooks/use-organization";
import { useCourtSettings, useUpsertSettings } from "@/hooks/use-court";
import Button from "@/components/ui/button";
import type { MemberRole } from "@/types/common";

export default function BookingRulesScreen() {
  const { data: orgs } = useMyOrganizations();
  const { data: memberRole } = useActiveMemberRole();
  const organizationId = orgs?.[0]?.id;
  const isAdmin = ["owner", "admin"].includes((memberRole?.role ?? "") as MemberRole);

  const { data: settings } = useCourtSettings(organizationId);
  const upsertSettings = useUpsertSettings();

  const [openingHour, setOpeningHour] = useState("8");
  const [closingHour, setClosingHour] = useState("22");
  const [weekdayLimited, setWeekdayLimited] = useState(false);
  const [weekdayLimit, setWeekdayLimit] = useState("");
  const [weekendLimited, setWeekendLimited] = useState(false);
  const [weekendLimit, setWeekendLimit] = useState("");
  const [windowLimited, setWindowLimited] = useState(false);
  const [windowLimit, setWindowLimit] = useState("");

  useEffect(() => {
    if (!settings) return;
    setOpeningHour(String(settings.openingHour));
    setClosingHour(String(settings.closingHour));
    setWeekdayLimited(settings.maxBookingsPerWeekWeekday != null);
    setWeekdayLimit(
      settings.maxBookingsPerWeekWeekday != null ? String(settings.maxBookingsPerWeekWeekday) : "",
    );
    setWeekendLimited(settings.maxBookingsPerWeekWeekend != null);
    setWeekendLimit(
      settings.maxBookingsPerWeekWeekend != null ? String(settings.maxBookingsPerWeekWeekend) : "",
    );
    setWindowLimited(settings.bookingWindowDays != null);
    setWindowLimit(settings.bookingWindowDays != null ? String(settings.bookingWindowDays) : "");
  }, [settings]);

  const openingValue = Number(openingHour);
  const closingValue = Number(closingHour);
  const isValid =
    Number.isInteger(openingValue) &&
    Number.isInteger(closingValue) &&
    openingValue >= 0 &&
    openingValue <= 23 &&
    closingValue >= 1 &&
    closingValue <= 24 &&
    closingValue > openingValue &&
    (!weekdayLimited || Number(weekdayLimit) > 0) &&
    (!weekendLimited || Number(weekendLimit) > 0) &&
    (!windowLimited || Number(windowLimit) > 0);

  const handleSubmit = () => {
    if (!organizationId) return;
    upsertSettings.mutate(
      {
        organizationId,
        openingHour: openingValue,
        closingHour: closingValue,
        maxBookingsPerWeekWeekday: weekdayLimited ? Number(weekdayLimit) : null,
        maxBookingsPerWeekWeekend: weekendLimited ? Number(weekendLimit) : null,
        bookingWindowDays: windowLimited ? Number(windowLimit) : null,
      },
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert("Erreur", "Impossible d'enregistrer les règles."),
      },
    );
  };

  if (!isAdmin) {
    return (
      <>
        <Stack.Screen options={{ title: "Règles de réservation" }} />
        <View style={styles.screen}>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Accès réservé</Text>
            <Text style={styles.emptyDescription}>
              Seuls les admins du club peuvent modifier ces règles.
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Règles de réservation" }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>HORAIRES D&apos;OUVERTURE</Text>
        <View style={styles.hourRow}>
          <View style={styles.hourField}>
            <Text style={styles.hourLabel}>Ouverture</Text>
            <TextInput
              value={openingHour}
              onChangeText={setOpeningHour}
              keyboardType="numeric"
              maxLength={2}
              style={styles.hourInput}
            />
            <Text style={styles.hourSuffix}>h</Text>
          </View>
          <View style={styles.hourField}>
            <Text style={styles.hourLabel}>Fermeture</Text>
            <TextInput
              value={closingHour}
              onChangeText={setClosingHour}
              keyboardType="numeric"
              maxLength={2}
              style={styles.hourInput}
            />
            <Text style={styles.hourSuffix}>h</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>QUOTAS HEBDOMADAIRES</Text>

        <LimitField
          label="Réservations en semaine"
          limited={weekdayLimited}
          onToggleLimited={setWeekdayLimited}
          value={weekdayLimit}
          onChangeValue={setWeekdayLimit}
        />
        <LimitField
          label="Réservations en week-end"
          limited={weekendLimited}
          onToggleLimited={setWeekendLimited}
          value={weekendLimit}
          onChangeValue={setWeekendLimit}
        />

        <Text style={styles.sectionLabel}>FENÊTRE DE RÉSERVATION</Text>
        <LimitField
          label="Jours à l'avance (J+N)"
          limited={windowLimited}
          onToggleLimited={setWindowLimited}
          value={windowLimit}
          onChangeValue={setWindowLimit}
        />

        <View style={styles.actions}>
          <Button label="Enregistrer" onPress={handleSubmit} disabled={!isValid} loading={upsertSettings.isPending} />
        </View>
      </ScrollView>
    </>
  );
}

interface LimitFieldProps {
  label: string;
  limited: boolean;
  onToggleLimited: (limited: boolean) => void;
  value: string;
  onChangeValue: (value: string) => void;
}

function LimitField({ label, limited, onToggleLimited, value, onChangeValue }: LimitFieldProps) {
  return (
    <View style={styles.limitField}>
      <View style={styles.limitHeader}>
        <Text style={styles.limitLabel}>{label}</Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => onToggleLimited(false)}
            style={[styles.toggleOption, !limited && styles.toggleOptionActive]}
          >
            <Text style={[styles.toggleText, !limited && styles.toggleTextActive]}>Illimité</Text>
          </Pressable>
          <Pressable
            onPress={() => onToggleLimited(true)}
            style={[styles.toggleOption, limited && styles.toggleOptionActive]}
          >
            <Text style={[styles.toggleText, limited && styles.toggleTextActive]}>Limité</Text>
          </Pressable>
        </View>
      </View>
      {limited && (
        <TextInput
          value={value}
          onChangeText={onChangeValue}
          placeholder="Nombre de réservations"
          placeholderTextColor={courtColors.chalkDim}
          keyboardType="numeric"
          style={styles.limitInput}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: courtColors.ink900,
  },
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
    color: courtColors.chalkDim,
    marginTop: 8,
  },
  hourRow: {
    flexDirection: "row",
    gap: 16,
  },
  hourField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: courtColors.ink700,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: courtColors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hourLabel: {
    flex: 1,
    fontWeight: "500",
    fontSize: 13,
    color: courtColors.chalk,
  },
  hourInput: {
    fontFamily: courtFontMono,
    fontSize: 16,
    color: courtColors.chartreuse,
    minWidth: 28,
    textAlign: "right",
  },
  hourSuffix: {
    fontFamily: courtFontMono,
    fontSize: 16,
    color: courtColors.chartreuse,
  },
  limitField: {
    backgroundColor: courtColors.ink700,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: courtColors.line,
    padding: 14,
    gap: 10,
  },
  limitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  limitLabel: {
    flex: 1,
    fontWeight: "500",
    fontSize: 14,
    color: courtColors.chalk,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: courtColors.ink900,
    borderRadius: 8,
    padding: 2,
  },
  toggleOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  toggleOptionActive: {
    backgroundColor: courtColors.chartreuse,
  },
  toggleText: {
    fontWeight: "600",
    fontSize: 12,
    color: courtColors.chalkDim,
  },
  toggleTextActive: {
    color: courtColors.ink900,
  },
  limitInput: {
    backgroundColor: courtColors.ink900,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: courtColors.line,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontFamily: courtFontMono,
    fontSize: 15,
    color: courtColors.chalk,
  },
  actions: {
    marginTop: 10,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 6,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: courtColors.chalk,
  },
  emptyDescription: {
    fontSize: 13.5,
    color: courtColors.chalkDim,
    textAlign: "center",
  },
});
