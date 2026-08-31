import { View, Text, StyleSheet } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SURFACE_LABELS } from "../lib/court-filters";
import { PADEL_TEAM_COMPLETION_WINDOW_HOURS } from "../lib/constants";
import type { BookingDetail } from "@/types/court";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });

interface PerforatedTicketProps {
  booking: BookingDetail;
}

export function PerforatedTicket({ booking }: PerforatedTicketProps) {
  const scheme = useColorScheme();
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const isPadel = booking.sport === "padel";
  const isPast = start.getTime() < Date.now();
  const filledCount = 1 + booking.participants.filter((p) => p.name).length;
  const deadlineHour = Math.max(start.getHours() - PADEL_TEAM_COMPLETION_WINDOW_HOURS, 0);
  const teamComplete = filledCount >= 4;

  const tag = [booking.surface ? SURFACE_LABELS[booking.surface] : null, booking.indoor ? "Couvert" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      style={[
        styles.ticket,
        { backgroundColor: semanticColors.cardBackground[scheme], borderColor: semanticColors.borderColor[scheme] },
      ]}
    >
      <View style={styles.top}>
        <Text style={[styles.eyebrow, { color: colors.accentGreen }]}>
          AceClub · Billet {isPadel ? "Padel" : "Tennis"}
        </Text>
        <Text style={[styles.courtName, { color: colors.accentGreen }]}>{booking.courtName.toUpperCase()}</Text>
        {!!tag && <Text style={[styles.tag, { color: semanticColors.labelSecondary[scheme] }]}>{tag}</Text>}

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: semanticColors.labelTertiary[scheme] }]}>Jour</Text>
            <Text style={[styles.gridValue, { color: semanticColors.labelPrimary[scheme] }]}>
              {dayFormatter.format(start)}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: semanticColors.labelTertiary[scheme] }]}>Heure</Text>
            <Text style={[styles.gridValue, { color: semanticColors.labelPrimary[scheme] }]}>{`${start.getHours()}h–${end.getHours()}h`}</Text>
          </View>
          <View style={[styles.gridItem, styles.gridItemFull]}>
            <Text style={[styles.gridLabel, { color: semanticColors.labelTertiary[scheme] }]}>
              {isPadel ? "Équipe" : "Joueurs"}
            </Text>
            {isPadel ? (
              <View style={styles.roster}>
                <View style={styles.rosterSlot}>
                  <View style={[styles.rosterCircle, { backgroundColor: semanticColors.systemGray6[scheme], borderWidth: 1.5, borderColor: colors.accentGreen }]}>
                    <Text style={[styles.rosterCircleText, { color: colors.accentGreen }]}>VOUS</Text>
                  </View>
                  <Text style={[styles.rosterLabel, { color: semanticColors.labelTertiary[scheme] }]}>Vous</Text>
                </View>
                {booking.participants.map((p, i) => (
                  <View key={i} style={styles.rosterSlot}>
                    <View
                      style={[
                        styles.rosterCircle,
                        p.name
                          ? { backgroundColor: colors.accentGreen }
                          : { borderWidth: 1.5, borderStyle: "dashed", borderColor: semanticColors.borderColor[scheme] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rosterCircleText,
                          { color: p.name ? colors.white : semanticColors.labelTertiary[scheme] },
                        ]}
                      >
                        {p.name ? initials(p.name) : "?"}
                      </Text>
                    </View>
                    <Text style={[styles.rosterLabel, { color: semanticColors.labelTertiary[scheme] }]} numberOfLines={1}>
                      {p.name ? p.name.split(" ")[0] : "Libre"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.gridValue, { color: semanticColors.labelPrimary[scheme] }]}>
                Vous{booking.participants[0]?.name ? `, ${booking.participants[0].name}` : ""}
              </Text>
            )}
          </View>
        </View>

        {isPadel && !isPast && (
          <View
            style={[
              styles.statusBanner,
              teamComplete
                ? { backgroundColor: `${colors.accentGreen}14`, borderWidth: 1, borderColor: `${colors.accentGreen}55` }
                : { backgroundColor: `${colors.accentOrange}14`, borderWidth: 1, borderColor: `${colors.accentOrange}55` },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: teamComplete ? colors.accentGreen : colors.accentOrange }]} />
            <Text style={[styles.statusText, { color: semanticColors.labelSecondary[scheme] }]}>
              {teamComplete ? (
                <Text style={[styles.statusBold, { color: semanticColors.labelPrimary[scheme] }]}>Équipe complète</Text>
              ) : (
                <>
                  <Text style={[styles.statusBold, { color: semanticColors.labelPrimary[scheme] }]}>
                    {filledCount}/4 joueurs
                  </Text>{" "}
                  — complète l&apos;équipe avant{" "}
                  <Text style={[styles.statusBold, { color: semanticColors.labelPrimary[scheme] }]}>{deadlineHour}h</Text>
                  , sinon le court est automatiquement libéré.
                </>
              )}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.perforation, { borderTopColor: semanticColors.divider[scheme] }]} />

      <View style={styles.stub}>
        <View style={[styles.barcode, { backgroundColor: semanticColors.labelTertiary[scheme] }]} />
        <Text style={[styles.code, { color: semanticColors.labelSecondary[scheme] }]}>
          N° {booking.id.slice(-8).toUpperCase()}
        </Text>
        <Text style={[styles.note, { color: semanticColors.labelTertiary[scheme] }]}>
          Présente ce billet à l&apos;accueil. Retrouve-le dans Mes réservations.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  top: {
    padding: 24,
    paddingTop: 26,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  courtName: {
    fontWeight: "800",
    fontSize: 32,
    lineHeight: 34,
    marginTop: 6,
  },
  tag: {
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridItem: {
    width: "45%",
  },
  gridItemFull: {
    width: "100%",
  },
  gridLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  gridValue: {
    fontWeight: "800",
    fontSize: 15.5,
  },
  roster: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  rosterSlot: {
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  rosterCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rosterCircleText: {
    fontSize: 10,
    fontWeight: "600",
  },
  rosterLabel: {
    fontSize: 9,
    textAlign: "center",
  },
  statusBanner: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 5,
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  statusBold: {
    fontWeight: "700",
  },
  perforation: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    marginHorizontal: 24,
  },
  stub: {
    padding: 24,
    paddingTop: 20,
    alignItems: "center",
    gap: 12,
  },
  barcode: {
    width: "100%",
    height: 38,
    opacity: 0.35,
    borderRadius: 3,
  },
  code: {
    fontSize: 13,
    letterSpacing: 1.2,
    fontVariant: ["tabular-nums"],
  },
  note: {
    fontSize: 11,
    textAlign: "center",
    maxWidth: 280,
  },
});
