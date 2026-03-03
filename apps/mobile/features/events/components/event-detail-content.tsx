import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
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
          {event.address && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                Lieu
              </Text>
              <GlassView style={styles.locationCard}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={colors.accentGreen} strokeWidth={2} />
                  <Text
                    style={[styles.infoText, { color: semanticColors.labelSecondary[scheme], flex: 1 }]}
                    numberOfLines={2}
                  >
                    {event.address}
                  </Text>
                </View>
              </GlassView>
              {event.latitude != null && event.longitude != null && (
                <MapPreview
                  latitude={event.latitude}
                  longitude={event.longitude}
                  title={event.name}
                />
              )}
            </View>
          )}

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
            label="S'inscrire"
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
  },
  descriptionCard: {
    padding: spacing.card,
    borderRadius: radii.md,
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
