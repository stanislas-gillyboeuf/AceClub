import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator, Pressable, Linking, Platform } from "react-native";
import { Image } from "expo-image";
import { GlassView } from "@/components/ui/glass-view";
import { Avatar } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { MapPreview } from "@/features/matches/components/match-detail/map-preview";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CalendarDays,
  ExternalLink,
  Ticket,
} from "lucide-react-native";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEvent, useRegisterEvent, useCancelRegistration } from "@/hooks/use-event";
import { formatFullDate, formatEventTime } from "@/lib/format";

interface EventDetailContentProps {
  eventId: string;
}

export function EventDetailContent({ eventId }: EventDetailContentProps) {
  const scheme = useColorScheme();
  const { data: event, isLoading } = useEvent(eventId);
  const registerMutation = useRegisterEvent();
  const cancelMutation = useCancelRegistration();

  if (isLoading || !event) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const status = event.userRegistrationStatus;
  const isMutating = registerMutation.isPending || cancelMutation.isPending;

  const handleRegister = () => {
    if (!event.isFree && event.paymentLink) {
      Linking.openURL(event.paymentLink);
    }
    registerMutation.mutate(eventId);
  };

  const handleCancel = () => {
    Alert.alert(
      "Annuler l'inscription",
      "Voulez-vous vraiment annuler votre inscription ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: () => cancelMutation.mutate(eventId),
        },
      ],
    );
  };

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {event.coverImage ? (
            <Image
              source={{ uri: event.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: semanticColors.skeleton[scheme] }]}>
              <CalendarDays size={48} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
            </View>
          )}
          {/* Title */}
          <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
            {event.name}
          </Text>

          {/* Date & time */}
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.accentGreen} strokeWidth={2} />
            <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
              {formatFullDate(event.startDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.accentGreen} strokeWidth={2} />
            <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
              {formatEventTime(event.startDate, event.endDate)}
            </Text>
          </View>

          {/* Participants */}
          <View style={styles.infoRow}>
            <Users size={16} color={colors.accentGreen} strokeWidth={2} />
            <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
              {event.participantCount} inscrit{event.participantCount !== 1 ? "s" : ""}
              {event.maxParticipants ? ` / ${event.maxParticipants} places` : ""}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

          {/* Pricing */}
          {!event.isFree && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                Tarif
              </Text>
              <GlassView style={styles.pricingCard}>
                <View style={styles.infoRow}>
                  <Ticket size={16} color={colors.accentGreen} strokeWidth={2} />
                  <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                    {event.price != null ? `${event.price} €` : "Payant"}
                  </Text>
                </View>
                {event.paymentLink ? (
                  status === "registered" ? (
                    <Pressable onPress={() => Linking.openURL(event.paymentLink!)}>
                      <View style={[styles.payButton, { backgroundColor: colors.accentGreen }]}>
                        <Text style={styles.payButtonText}>
                          {event.paymentLink.toLowerCase().includes("lydia") ? "Payer avec Lydia" : "Payer"}
                        </Text>
                        <ExternalLink size={16} color="#FFFFFF" strokeWidth={2} />
                      </View>
                    </Pressable>
                  ) : (
                    <Text style={[styles.payHint, { color: semanticColors.labelTertiary[scheme] }]}>
                      Le lien de paiement s'ouvrira au moment de l'inscription.
                    </Text>
                  )
                ) : null}
              </GlassView>
            </View>
          )}

          {/* Host */}
          {event.organizationName ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                Organisateur
              </Text>
              <GlassView style={styles.hostCard}>
                <View style={styles.hostRow}>
                  <Avatar
                    imageUrl={event.organizationLogo}
                    name={event.organizationName}
                    size={40}
                  />
                  <View style={styles.hostInfo}>
                    <Text style={[styles.hostName, { color: semanticColors.labelPrimary[scheme] }]}>
                      {event.organizationName}
                    </Text>
                  </View>
                </View>
              </GlassView>
            </View>
          ) : null}

          {/* Location */}
          <LocationSection event={event} />

          {/* Description */}
          {event.description && event.description.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                A propos
              </Text>
              <GlassView style={styles.descriptionCard}>
                <Text style={[styles.descriptionText, { color: semanticColors.labelSecondary[scheme] }]}>
                  {event.description}
                </Text>
              </GlassView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: semanticColors.cardBackground[scheme] },
        ]}
      >
        {status === null || status === "cancelled" ? (
          <Button
            label={!event.isFree && event.paymentLink ? "S'inscrire et payer" : "S'inscrire"}
            onPress={handleRegister}
            disabled={isMutating}
            loading={isMutating}
          />
        ) : status === "registered" ? (
          <Button
            label="Annuler l'inscription"
            variant="destructive"
            onPress={handleCancel}
            disabled={isMutating}
            loading={isMutating}
          />
        ) : status === "waitlisted" ? (
          <Button
            label="Sur liste d'attente"
            disabled
          />
        ) : null}
      </View>
    </>
  );
}

function LocationSection({ event }: { event: NonNullable<ReturnType<typeof useEvent>["data"]> }) {
  const scheme = useColorScheme();
  const displayAddress = event.address || event.organizationAddress || null;
  const displayLat = event.latitude ?? event.organizationLatitude ?? null;
  const displayLng = event.longitude ?? event.organizationLongitude ?? null;
  const isOrgFallback = !event.address && !!event.organizationAddress;

  if (!displayAddress) return null;

  const openInMaps = () => {
    const encodedAddress = encodeURIComponent(displayAddress);
    const url =
      displayLat != null && displayLng != null
        ? Platform.select({
            ios: `maps:?ll=${displayLat},${displayLng}&q=${encodedAddress}`,
            default: `geo:${displayLat},${displayLng}?q=${encodedAddress}`,
          })
        : Platform.select({
            ios: `maps:?q=${encodedAddress}`,
            default: `geo:0,0?q=${encodedAddress}`,
          });
    Linking.openURL(url);
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
        Lieu
      </Text>
      <Pressable onPress={openInMaps}>
        <GlassView style={styles.locationCard}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.accentGreen} strokeWidth={2} />
            <Text
              style={[styles.infoText, { color: semanticColors.labelSecondary[scheme], flex: 1 }]}
              numberOfLines={2}
            >
              {displayAddress}
            </Text>
            <ExternalLink size={14} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
          </View>
          {isOrgFallback && (
            <Text style={[styles.orgFallbackText, { color: semanticColors.labelTertiary[scheme] }]}>
              Adresse du club
            </Text>
          )}
        </GlassView>
      </Pressable>
      {displayLat != null && displayLng != null && (
        <Pressable onPress={openInMaps}>
          <MapPreview
            latitude={displayLat}
            longitude={displayLng}
            title={event.name}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  coverPlaceholder: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  section: {
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  hostCard: {
    padding: spacing.card,
    borderRadius: radii.md,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationCard: {
    padding: spacing.card,
    borderRadius: radii.md,
    gap: 4,
  },
  orgFallbackText: {
    fontSize: 12,
    marginLeft: 26,
  },
  descriptionCard: {
    padding: spacing.card,
    borderRadius: radii.md,
  },
  pricingCard: {
    padding: spacing.card,
    borderRadius: radii.md,
    gap: 12,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  payHint: {
    fontSize: 13,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
