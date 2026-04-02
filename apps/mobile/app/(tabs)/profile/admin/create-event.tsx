import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ImagePlus,
  Eye,
  Users,
  Building2,
  Ticket,
  Link,
} from "lucide-react-native";

import { useCreateEvent } from "@/hooks/use-event";
import { useMyOrganizations } from "@/hooks/use-organization";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateEventFormStore } from "@/store/create-event-form";
import { uploadService } from "@/services/upload";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { LocationPicker } from "@/features/events/components/LocationPicker";
import { EVENT_STATUS_CONFIG, VISIBILITY_OPTIONS } from "@/features/events/lib/event-status";
import { formatShortDate, formatTime } from "@/lib/format";
import type { EventVisibility, EventStatus } from "@/types/event";

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
  const [showStartPicker, setShowStartPicker] = useState(Platform.OS === "ios");
  const [showEndPicker, setShowEndPicker] = useState(Platform.OS === "ios");
  const [capacityText, setCapacityText] = useState(
    maxParticipants ? String(maxParticipants) : "",
  );

  // Auto-set organization to user's club
  useEffect(() => {
    if (primaryOrg && !organization) {
      setOrganization(primaryOrg);
    }
  }, [primaryOrg, organization, setOrganization]);

  const handlePickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
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
    !!organization &&
    (isFree || paymentLink.trim().length > 0) &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      let coverImageUrl: string | undefined;

      if (coverImageUri) {
        const fileName = `event_cover_${Date.now()}.jpg`;
        const result = await uploadService.uploadUserImage(
          coverImageUri,
          fileName,
          "image/jpeg",
        );
        coverImageUrl = result.imageUrl;
      }

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
        price: isFree ? undefined : (parseInt(price, 10) || undefined),
        paymentLink: isFree ? undefined : (paymentLink.trim() || undefined),
        visibility,
        status,
        organizationId: organization!.id,
      });

      reset();
      router.dismiss();
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de créer l'event.");
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
                Début
              </Text>
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display="compact"
                onChange={(_, d) => d && setStartDate(d)}
                minimumDate={new Date()}
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
                Début
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
              minimumDate={new Date()}
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

        {/* Club organisateur (auto-sélectionné) */}
        <GlassView style={styles.rowCard}>
          <Building2
            size={20}
            color={organization ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
            strokeWidth={1.5}
          />
          <Text
            style={[
              styles.rowLabel,
              {
                color: organization
                  ? semanticColors.labelPrimary[scheme]
                  : semanticColors.labelSecondary[scheme],
                flex: 1,
              },
            ]}
            numberOfLines={1}
          >
            {organization?.name ?? (orgs ? "Aucun club" : "Chargement...")}
          </Text>
        </GlassView>

        {/* Lieu */}
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
              Visibilité
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
              Capacité
            </Text>
            <TextInput
              value={capacityText}
              onChangeText={handleCapacityChange}
              placeholder="Illimité"
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

          {/* Gratuit / Payant toggle */}
          <View style={styles.optionRow}>
            <Ticket
              size={20}
              color={semanticColors.labelSecondary[scheme]}
              strokeWidth={1.5}
            />
            <Text
              style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}
            >
              Entrée
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

              {/* Price */}
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
                    €
                  </Text>
                </View>
              </View>

              <View
                style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]}
              />

              {/* Payment link */}
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
  coverContainer: {
    borderRadius: radii.lg,
    overflow: "hidden",
    aspectRatio: 1,
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
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
