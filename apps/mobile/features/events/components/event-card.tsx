import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, ArrowUpRight, CalendarDays } from "lucide-react-native";
import { BlurSurface } from "@/components/ui/blur-surface";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEventParticipants } from "@/hooks/use-event";
import { formatShortDate, formatTime } from "@/lib/format";
import { colors, semanticColors, radii, spacing, glass, eventCategoryColors } from "@/constants/theme";
import type { EventSummary, MyEvent, EventCategory } from "@/types/event";

type EventCardVariant = "large" | "compact";

interface EventCardProps {
  event: EventSummary | MyEvent;
  variant: EventCardVariant;
  onPress?: () => void;
}

const CARD_SIZES = {
  large: { width: 300, height: 400 },
  compact: { width: 160, height: 220 },
} as const;

// Not wired to real data yet — `category` has no backing column (see events-feed-section.tsx's
// design-gap notes). Falls back to a neutral cover and hides the category pill entirely.
const CATEGORY_LABELS: Record<EventCategory, string> = {
  tournament: "Tournoi",
  party: "Soirée",
  camp: "Stage",
};

export function EventCard({ event, variant, onPress }: EventCardProps) {
  const scheme = useColorScheme();
  const size = CARD_SIZES[variant];
  const category = event.category ?? undefined;

  const { data: participants } = useEventParticipants(event.id, {
    limit: 3,
    enabled: variant === "large",
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width: size.width, height: size.height },
        pressed && styles.pressed,
      ]}
    >
      <Cover coverImage={event.coverImage} category={category} />

      {category ? (
        <BlurSurface intensity={40} style={[styles.categoryPill, { borderRadius: radii.xl }]}>
          <Text style={styles.categoryPillText}>{CATEGORY_LABELS[category]}</Text>
        </BlurSurface>
      ) : null}

      <PriceBadge isFree={event.isFree} price={event.price} scheme={scheme} />

      <BlurSurface
        intensity={40}
        style={[
          styles.infoPanel,
          variant === "compact" && styles.infoPanelCompact,
          { borderRadius: radii.lg },
        ]}
      >
        <Text
          style={[
            variant === "large" ? styles.titleLarge : styles.titleCompact,
            { color: semanticColors.labelPrimary[scheme] },
          ]}
          numberOfLines={variant === "large" ? 2 : 1}
        >
          {event.name}
        </Text>

        <View style={styles.dateRow}>
          <Calendar size={14} color={colors.accentGreen} strokeWidth={2} />
          <Text style={[styles.dateText, { color: semanticColors.labelSecondary[scheme] }]} numberOfLines={1}>
            {formatShortDate(event.startDate)} · {formatTime(event.startDate)}
          </Text>
        </View>

        {variant === "large" ? (
          <View style={styles.bottomRow}>
            <View style={styles.registeredRow}>
              <AvatarStack avatars={(participants ?? []).map((p) => ({ imageUrl: p.userImage, name: p.userName }))} size={22} />
              <Text style={[styles.registeredText, { color: semanticColors.labelSecondary[scheme] }]}>
                {event.maxParticipants
                  ? `${event.participantCount}/${event.maxParticipants} inscrits`
                  : `${event.participantCount} inscrits`}
              </Text>
            </View>
            <BlurSurface intensity={50} borderColor={glass.pillBorder[scheme]} style={styles.actionButton}>
              <ArrowUpRight size={20} color={semanticColors.labelPrimary[scheme]} strokeWidth={2} />
            </BlurSurface>
          </View>
        ) : (
          <Text style={[styles.compactMeta, { color: semanticColors.labelSecondary[scheme] }]} numberOfLines={1}>
            {event.isFree ? "Gratuit" : event.price != null ? `${event.price} €` : "Payant"} ·{" "}
            {event.participantCount} inscrit{event.participantCount !== 1 ? "s" : ""}
          </Text>
        )}
      </BlurSurface>
    </Pressable>
  );
}

function Cover({ coverImage, category }: { coverImage: string | null; category?: EventCategory }) {
  if (coverImage) {
    return <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />;
  }

  if (category === "tournament") {
    const { from, to } = eventCategoryColors.tournament;
    return (
      <LinearGradient colors={[from, to]} style={StyleSheet.absoluteFill}>
        <CoverPlaceholderIcon />
      </LinearGradient>
    );
  }

  const flatColor =
    category === "party" ? eventCategoryColors.party : category === "camp" ? eventCategoryColors.camp : `${colors.accentGreen}26`;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: flatColor }]}>
      <CoverPlaceholderIcon />
    </View>
  );
}

function CoverPlaceholderIcon() {
  return (
    <View style={styles.coverPlaceholder}>
      <CalendarDays size={32} color="rgba(255,255,255,0.85)" strokeWidth={1.5} />
    </View>
  );
}

function PriceBadge({
  isFree,
  price,
  scheme,
}: {
  isFree: boolean;
  price: number | null;
  scheme: "light" | "dark";
}) {
  const label = isFree ? "Gratuit" : price != null ? `${price} €` : "Payant";

  return (
    <View
      style={[
        styles.priceBadge,
        { backgroundColor: isFree ? semanticColors.cardBackground[scheme] : colors.accentGreen },
      ]}
    >
      <Text
        style={[
          styles.priceBadgeText,
          { color: isFree ? semanticColors.labelPrimary[scheme] : "#FFFFFF" },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.9,
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPill: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  priceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.xl,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoPanel: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    padding: spacing.card,
    gap: 8,
  },
  infoPanelCompact: {
    padding: 12,
    gap: 4,
  },
  titleLarge: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    // Fixed to exactly 2 lines' worth regardless of the actual title length, so every card's
    // blurred panel is the same height — a 1-line title just leaves reserved space below it.
    height: 44,
  },
  titleCompact: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    height: 18,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  compactMeta: {
    fontSize: 12,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  registeredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  registeredText: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 1,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
