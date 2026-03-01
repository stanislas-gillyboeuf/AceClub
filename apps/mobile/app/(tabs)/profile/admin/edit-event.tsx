import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ImagePlus,
  MapPin,
  Eye,
  Users,
  Building2,
  Ticket,
  Link,
  Trash2,
} from "lucide-react-native";

import { useEvent, useUpdateEvent, useUpdateEventStatus, useDeleteEvent } from "@/hooks/use-event";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { uploadService } from "@/services/upload";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { EVENT_STATUS_CONFIG, VISIBILITY_OPTIONS } from "@/features/events/lib/event-status";
import { formatShortDate, formatTime } from "@/lib/format";
import type { EventVisibility, EventStatus } from "@/types/event";

export default function EditEvent() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId ?? "");
  const updateEvent = useUpdateEvent();
  const updateEventStatus = useUpdateEventStatus();
  const deleteEvent = useDeleteEvent();

  // Local state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [address, setAddress] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<EventVisibility>("public");
  const [status, setStatus] = useState<EventStatus>("on_sale");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(Platform.OS === "ios");
  const [showEndPicker, setShowEndPicker] = useState(Platform.OS === "ios");
  const [capacityText, setCapacityText] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Pre-fill form when event data loads
  useEffect(() => {
    if (event && !hasLoaded) {
      setName(event.name);
      setDescription(event.description ?? "");
      setCoverImageUri(event.coverImage);
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      setAddress(event.address ?? "");
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

  const handlePickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverImageUri(result.assets[0].uri);
    }
  };

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
      let coverImageUrl: string | undefined;

      if (coverImageUri) {
        if (coverImageUri.startsWith("http")) {
          coverImageUrl = coverImageUri;
        } else {
          const fileName = `event_cover_${Date.now()}.jpg`;
          const result = await uploadService.uploadUserImage(
            coverImageUri,
            fileName,
            "image/jpeg",
          );
          coverImageUrl = result.imageUrl;
        }
      }

      await updateEvent.mutateAsync({
        eventId,
        name: name.trim(),
        description: description.trim() || undefined,
        coverImage: coverImageUrl,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        address: address.trim() || undefined,
        maxParticipants: maxParticipants,
        isFree,
        price: isFree ? undefined : (parseInt(price, 10) || undefined),
        paymentLink: isFree ? undefined : (paymentLink.trim() || undefined),
        visibility,
      });

      // Update status if changed
      if (status !== event?.status) {
        await updateEventStatus.mutateAsync({ eventId, status });
      }

      router.dismiss();
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de modifier l'event.");
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
            } catch (e: any) {
              Alert.alert("Erreur", e.message ?? "Impossible de supprimer l'event.");
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
        {/* Cover Image */}
        <Pressable onPress={handlePickCover}>
          <GlassView style={styles.coverContainer}>
            {coverImageUri ? (
              <Image
                source={{ uri: coverImageUri }}
                style={styles.coverImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <ImagePlus
                  size={32}
                  color={semanticColors.labelTertiary[scheme]}
                  strokeWidth={1.5}
                />
                <Text
                  style={[
                    styles.coverPlaceholderText,
                    { color: semanticColors.labelSecondary[scheme] },
                  ]}
                >
                  Ajouter une image de couverture
                </Text>
              </View>
            )}
          </GlassView>
        </Pressable>

        {/* Event Name */}
        <GlassView style={styles.fieldCard}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom de l'event"
            placeholderTextColor={semanticColors.labelTertiary[scheme]}
            style={[styles.nameInput, { color: semanticColors.labelPrimary[scheme] }]}
          />
        </GlassView>

        {/* Status */}
        <GlassView style={styles.fieldCard}>
          <Text
            style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}
          >
            STATUT
          </Text>
          <View style={styles.statusGrid}>
            {EVENT_STATUS_CONFIG.map((opt) => {
              const isActive = status === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setStatus(opt.value)}
                  style={[
                    styles.statusChip,
                    isActive && { backgroundColor: `${opt.color}20` },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: isActive ? opt.color : semanticColors.labelSecondary[scheme] },
                      isActive && { fontWeight: "700" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassView>

        {/* Date Section */}
        <GlassView style={styles.fieldCard}>
          <Text
            style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}
          >
            DATES
          </Text>

          {Platform.OS === "ios" ? (
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, { color: semanticColors.labelPrimary[scheme] }]}>
                Debut
              </Text>
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display="compact"
                onChange={(_, d) => d && setStartDate(d)}
                locale="fr-FR"
                accentColor={colors.accentGreen}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setShowStartPicker(true)}
              style={styles.dateRow}
            >
              <Text style={[styles.dateLabel, { color: semanticColors.labelPrimary[scheme] }]}>
                Debut
              </Text>
              <Text style={[styles.dateValue, { color: semanticColors.labelSecondary[scheme] }]}>
                {formatShortDate(startDate.toISOString())} · {formatTime(startDate.toISOString())}
              </Text>
            </Pressable>
          )}
          {showStartPicker && Platform.OS === "android" && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              onChange={(_, d) => {
                setShowStartPicker(false);
                if (d) setStartDate(d);
              }}
            />
          )}

          <View
            style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
          />

          {Platform.OS === "ios" ? (
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, { color: semanticColors.labelPrimary[scheme] }]}>
                Fin
              </Text>
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display="compact"
                onChange={(_, d) => d && setEndDate(d)}
                minimumDate={startDate}
                locale="fr-FR"
                accentColor={colors.accentGreen}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setShowEndPicker(true)}
              style={styles.dateRow}
            >
              <Text style={[styles.dateLabel, { color: semanticColors.labelPrimary[scheme] }]}>
                Fin
              </Text>
              <Text style={[styles.dateValue, { color: semanticColors.labelSecondary[scheme] }]}>
                {formatShortDate(endDate.toISOString())} · {formatTime(endDate.toISOString())}
              </Text>
            </Pressable>
          )}
          {showEndPicker && Platform.OS === "android" && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              onChange={(_, d) => {
                setShowEndPicker(false);
                if (d) setEndDate(d);
              }}
              minimumDate={startDate}
            />
          )}
        </GlassView>

        {/* Club organisateur (read-only) */}
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

        {/* Lieu */}
        <GlassView style={styles.fieldCard}>
          <Text
            style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}
          >
            LIEU
          </Text>
          <View style={styles.optionRow}>
            <MapPin
              size={20}
              color={address ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
              strokeWidth={1.5}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Adresse du lieu (optionnel)"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              style={[styles.addressInput, { color: semanticColors.labelPrimary[scheme] }]}
            />
          </View>
        </GlassView>

        {/* Description */}
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

        {/* Options */}
        <GlassView style={styles.fieldCard}>
          <Text
            style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}
          >
            OPTIONS
          </Text>

          {/* Visibility */}
          <View style={styles.optionRow}>
            <Eye
              size={20}
              color={semanticColors.labelSecondary[scheme]}
              strokeWidth={1.5}
            />
            <Text
              style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}
            >
              Visibilite
            </Text>
            <View style={styles.visibilityPicker}>
              {VISIBILITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setVisibility(opt.value)}
                  style={[
                    styles.visibilityOption,
                    visibility === opt.value && styles.visibilityOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      {
                        color:
                          visibility === opt.value
                            ? "#FFFFFF"
                            : semanticColors.labelSecondary[scheme],
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
          />

          {/* Capacity */}
          <View style={styles.optionRow}>
            <Users
              size={20}
              color={semanticColors.labelSecondary[scheme]}
              strokeWidth={1.5}
            />
            <Text
              style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}
            >
              Capacite
            </Text>
            <TextInput
              value={capacityText}
              onChangeText={handleCapacityChange}
              placeholder="Illimite"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              keyboardType="number-pad"
              style={[styles.capacityInput, { color: semanticColors.labelPrimary[scheme] }]}
            />
          </View>
        </GlassView>

        {/* Tarif */}
        <GlassView style={styles.fieldCard}>
          <Text
            style={[styles.sectionLabel, { color: semanticColors.labelSecondary[scheme] }]}
          >
            TARIF
          </Text>

          <View style={styles.optionRow}>
            <Ticket
              size={20}
              color={semanticColors.labelSecondary[scheme]}
              strokeWidth={1.5}
            />
            <Text
              style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}
            >
              Entree
            </Text>
            <View style={styles.visibilityPicker}>
              <Pressable
                onPress={() => setIsFree(true)}
                style={[
                  styles.visibilityOption,
                  isFree && styles.visibilityOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    {
                      color: isFree
                        ? "#FFFFFF"
                        : semanticColors.labelSecondary[scheme],
                    },
                  ]}
                >
                  Gratuit
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsFree(false)}
                style={[
                  styles.visibilityOption,
                  !isFree && styles.paidOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    {
                      color: !isFree
                        ? "#FFFFFF"
                        : semanticColors.labelSecondary[scheme],
                    },
                  ]}
                >
                  Payant
                </Text>
              </Pressable>
            </View>
          </View>

          {!isFree && (
            <>
              <View
                style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
              />

              <View style={styles.optionRow}>
                <Text
                  style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1, marginLeft: 30 }]}
                >
                  Prix
                </Text>
                <View style={styles.priceInputRow}>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0"
                    placeholderTextColor={semanticColors.labelTertiary[scheme]}
                    keyboardType="number-pad"
                    style={[styles.priceInput, { color: semanticColors.labelPrimary[scheme] }]}
                  />
                  <Text
                    style={[styles.priceSuffix, { color: semanticColors.labelSecondary[scheme] }]}
                  >
                    EUR
                  </Text>
                </View>
              </View>

              <View
                style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
              />

              <View style={styles.optionRow}>
                <Link
                  size={20}
                  color={semanticColors.labelSecondary[scheme]}
                  strokeWidth={1.5}
                />
                <TextInput
                  value={paymentLink}
                  onChangeText={setPaymentLink}
                  placeholder="Lien de paiement (Lydia, PayPal...)"
                  placeholderTextColor={semanticColors.labelTertiary[scheme]}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.addressInput, { color: semanticColors.labelPrimary[scheme] }]}
                />
              </View>
            </>
          )}
        </GlassView>

        {/* Submit */}
        <Button
          label="Enregistrer"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
        />

        {/* Delete */}
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
  coverContainer: {
    borderRadius: radii.lg,
    overflow: "hidden",
    height: 180,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  coverPlaceholderText: {
    fontSize: 14,
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
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
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
  addressInput: {
    fontSize: 16,
    flex: 1,
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 80,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  visibilityPicker: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  visibilityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  visibilityOptionActive: {
    backgroundColor: colors.accentGreen,
    borderRadius: 8,
  },
  paidOptionActive: {
    backgroundColor: colors.accentOrange,
    borderRadius: 8,
  },
  visibilityText: {
    fontSize: 13,
    fontWeight: "600",
  },
  capacityInput: {
    fontSize: 16,
    textAlign: "right",
    width: 80,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceInput: {
    fontSize: 16,
    textAlign: "right",
    width: 60,
  },
  priceSuffix: {
    fontSize: 16,
    fontWeight: "500",
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
