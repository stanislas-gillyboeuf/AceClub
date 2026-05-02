import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Building2, Trash2 } from "lucide-react-native";

import { useEvent, useUpdateEvent, useUpdateEventStatus, useDeleteEvent } from "@/hooks/use-event";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { LocationPicker } from "@/features/events/components/LocationPicker";
import { EventCoverPicker } from "@/features/events/components/event-form/event-cover-picker";
import { EventStatusSelector } from "@/features/events/components/event-form/event-status-selector";
import { EventDateRangeField } from "@/features/events/components/event-form/event-date-range-field";
import { EventOptionsSection } from "@/features/events/components/event-form/event-options-section";
import { EventPricingSection } from "@/features/events/components/event-form/event-pricing-section";
import { uploadEventCover } from "@/features/events/hooks/use-event-cover-upload";
import type { EventVisibility, EventStatus } from "@/types/event";

export default function EditEvent() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId ?? "");
  const updateEvent = useUpdateEvent();
  const updateEventStatus = useUpdateEventStatus();
  const deleteEvent = useDeleteEvent();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [address, setAddress] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<EventVisibility>("public");
  const [status, setStatus] = useState<EventStatus>("on_sale");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capacityText, setCapacityText] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (event && !hasLoaded) {
      setName(event.name);
      setDescription(event.description ?? "");
      setCoverImageUri(event.coverImage);
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      setAddress(event.address ?? "");
      setLocationLatitude(event.latitude ?? null);
      setLocationLongitude(event.longitude ?? null);
      setMaxParticipants(event.maxParticipants);
      setCapacityText(event.maxParticipants ? String(event.maxParticipants) : "");
      setVisibility(event.visibility);
      setStatus(event.status);
      setIsFree(event.isFree);
      setPrice(event.price ? String(event.price) : "");
      setPaymentLink(event.paymentLink ?? "");
      setHasLoaded(true);
    }
  }, [event, hasLoaded]);

  const handleCapacityChange = (text: string) => {
    setCapacityText(text);
    const n = parseInt(text, 10);
    setMaxParticipants(isNaN(n) || n <= 0 ? null : n);
  };

  const canSubmit =
    name.trim().length > 0 &&
    startDate < endDate &&
    (isFree || paymentLink.trim().length > 0) &&
    !isSubmitting &&
    !deleteEvent.isPending;

  const handleSubmit = async () => {
    if (!canSubmit || !eventId) return;
    setIsSubmitting(true);

    try {
      const coverImageUrl = coverImageUri ? await uploadEventCover(coverImageUri) : undefined;

      await updateEvent.mutateAsync({
        eventId,
        name: name.trim(),
        description: description.trim() || undefined,
        coverImage: coverImageUrl,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        address: address.trim() || undefined,
        latitude: locationLatitude ?? undefined,
        longitude: locationLongitude ?? undefined,
        maxParticipants: maxParticipants,
        isFree,
        price: isFree ? undefined : parseInt(price, 10) || undefined,
        paymentLink: isFree ? undefined : paymentLink.trim() || undefined,
        visibility,
      });

      if (status !== event?.status) {
        await updateEventStatus.mutateAsync({ eventId, status });
      }

      router.dismiss();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de modifier l'event.";
      Alert.alert("Erreur", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer l'event",
      "Cette action est irreversible. Tous les participants seront desincrits.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (!eventId) return;
            try {
              await deleteEvent.mutateAsync(eventId);
              router.dismiss();
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Impossible de supprimer l'event.";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ],
    );
  };

  if (isLoading || !hasLoaded) {
    return (
      <>
        <Stack.Screen options={{ title: "Modifier l'event" }} />
        <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <ActivityIndicator size="large" color={colors.accentGreen} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Modifier l'event" }} />

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
        />

        <GlassView style={styles.rowCard}>
          <Building2
            size={20}
            color={event?.organizationName ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
            strokeWidth={1.5}
          />
          <Text
            style={[
              styles.rowLabel,
              {
                color: event?.organizationName
                  ? semanticColors.labelPrimary[scheme]
                  : semanticColors.labelSecondary[scheme],
                flex: 1,
              },
            ]}
            numberOfLines={1}
          >
            {event?.organizationName ?? "Aucun club"}
          </Text>
        </GlassView>

        <LocationPicker
          address={address}
          latitude={locationLatitude}
          longitude={locationLongitude}
          onLocationChange={({ address: addr, latitude: lat, longitude: lng }) => {
            setAddress(addr);
            setLocationLatitude(lat);
            setLocationLongitude(lng);
          }}
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
          label="Enregistrer"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
        />

        <Pressable
          onPress={handleDelete}
          disabled={deleteEvent.isPending}
          style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
        >
          <Trash2 size={18} color={colors.red500} strokeWidth={1.5} />
          <Text style={styles.deleteText}>
            {deleteEvent.isPending ? "Suppression..." : "Supprimer l'event"}
          </Text>
        </Pressable>

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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  rowCard: {
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  rowLabel: {
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.red500,
  },
});
