import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";

import { useCreateEvent } from "@/hooks/use-event";
import { useMyOrganizations } from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateEventFormStore } from "@/store/create-event-form";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import { semanticColors, spacing, radii } from "@/constants/theme";
import { LocationPicker } from "@/features/events/components/LocationPicker";
import { EventCoverPicker } from "@/features/events/components/event-form/event-cover-picker";
import { EventStatusSelector } from "@/features/events/components/event-form/event-status-selector";
import { EventDateRangeField } from "@/features/events/components/event-form/event-date-range-field";
import { EventOptionsSection } from "@/features/events/components/event-form/event-options-section";
import { EventPricingSection } from "@/features/events/components/event-form/event-pricing-section";
import { EventOrganizationRow } from "@/features/events/components/event-form/event-organization-row";
import { uploadEventCover } from "@/features/events/hooks/use-event-cover-upload";

export default function CreateEvent() {
  const scheme = useColorScheme();
  const router = useRouter();
  const createEvent = useCreateEvent();
  const { data: orgs } = useMyOrganizations();
  const primaryOrg = orgs?.[0] ?? null;

  const {
    name,
    description,
    coverImageUri,
    startDate,
    endDate,
    organization,
    address,
    locationLatitude,
    locationLongitude,
    maxParticipants,
    status,
    visibility,
    isFree,
    price,
    paymentLink,
    setStatus,
    setName,
    setDescription,
    setCoverImageUri,
    setStartDate,
    setEndDate,
    setOrganization,
    setLocation,
    setMaxParticipants,
    setVisibility,
    setIsFree,
    setPrice,
    setPaymentLink,
    reset,
  } = useCreateEventFormStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capacityText, setCapacityText] = useState(
    maxParticipants ? String(maxParticipants) : "",
  );

  useEffect(() => {
    if (primaryOrg && !organization) {
      setOrganization(primaryOrg);
    }
  }, [primaryOrg, organization, setOrganization]);

  const handleCapacityChange = (text: string) => {
    setCapacityText(text);
    const n = parseInt(text, 10);
    setMaxParticipants(isNaN(n) || n <= 0 ? null : n);
  };

  const canSubmit =
    name.trim().length > 0 &&
    startDate < endDate &&
    !!organization &&
    (isFree || paymentLink.trim().length > 0) &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      const coverImageUrl = coverImageUri ? await uploadEventCover(coverImageUri) : undefined;

      await createEvent.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        coverImage: coverImageUrl,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        address: address.trim() || undefined,
        latitude: locationLatitude ?? undefined,
        longitude: locationLongitude ?? undefined,
        maxParticipants: maxParticipants ?? undefined,
        isFree,
        price: isFree ? undefined : parseInt(price, 10) || undefined,
        paymentLink: isFree ? undefined : paymentLink.trim() || undefined,
        visibility,
        status,
        organizationId: organization!.id,
      });

      reset();
      router.dismiss();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de créer l'event.";
      Alert.alert("Erreur", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Nouvel event" }} />

      <ScrollView
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <EventCoverPicker imageUri={coverImageUri} onPick={setCoverImageUri} scheme={scheme} />

        <GlassView style={styles.fieldCard}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom de l'event"
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            style={[styles.nameInput, { color: semanticColors.labelPrimary[scheme] }]}
          />
        </GlassView>

        <EventStatusSelector value={status} onChange={setStatus} scheme={scheme} />

        <EventDateRangeField
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          scheme={scheme}
          minimumStartDate={new Date()}
        />

        <EventOrganizationRow organization={organization} isLoading={!orgs} scheme={scheme} />

        <LocationPicker
          address={address}
          latitude={locationLatitude}
          longitude={locationLongitude}
          onLocationChange={setLocation}
          isOrgAddress={
            !!organization &&
            address === (organization.address ?? "") &&
            address.length > 0
          }
        />

        <GlassView style={styles.fieldCard}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optionnel)"
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            style={[styles.descriptionInput, { color: semanticColors.labelPrimary[scheme] }]}
            multiline
            textAlignVertical="top"
          />
        </GlassView>

        <EventOptionsSection
          visibility={visibility}
          onVisibilityChange={setVisibility}
          capacityText={capacityText}
          onCapacityChange={handleCapacityChange}
          scheme={scheme}
        />

        <EventPricingSection
          isFree={isFree}
          onIsFreeChange={setIsFree}
          price={price}
          onPriceChange={setPrice}
          paymentLink={paymentLink}
          onPaymentLinkChange={setPaymentLink}
          scheme={scheme}
        />

        <Button
          label="Créer l'event"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.horizontal,
    gap: 14,
    paddingBottom: 40,
  },
  fieldCard: {
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "600",
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 80,
  },
});
