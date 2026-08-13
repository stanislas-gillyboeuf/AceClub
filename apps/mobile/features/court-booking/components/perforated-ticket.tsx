import { View, Text, StyleSheet } from "react-native";
import { courtColors, courtFontMono } from "../theme";
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
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const isPadel = booking.sport === "padel";
  const isPast = start.getTime() < Date.now();
  const filledCount = 1 + booking.participants.filter((p) => p.name).length;
  const deadlineHour = Math.max(start.getHours() - PADEL_TEAM_COMPLETION_WINDOW_HOURS, 0);

  const tag = [booking.surface ? SURFACE_LABELS[booking.surface] : null, booking.indoor ? "Couvert" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.ticket}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>AceClub · Billet {isPadel ? "Padel" : "Tennis"}</Text>
        <Text style={styles.courtName}>{booking.courtName.toUpperCase()}</Text>
        {!!tag && <Text style={styles.tag}>{tag}</Text>}

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Jour</Text>
            <Text style={styles.gridValue}>{dayFormatter.format(start)}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Heure</Text>
            <Text style={styles.gridValue}>{`${start.getHours()}h–${end.getHours()}h`}</Text>
          </View>
          <View style={[styles.gridItem, styles.gridItemFull]}>
            <Text style={styles.gridLabel}>{isPadel ? "Équipe" : "Joueurs"}</Text>
            {isPadel ? (
              <View style={styles.roster}>
                <View style={styles.rosterSlot}>
                  <View style={[styles.rosterCircle, styles.rosterCircleYou]}>
                    <Text style={styles.rosterCircleYouText}>VOUS</Text>
                  </View>
                  <Text style={styles.rosterLabel}>Vous</Text>
                </View>
                {booking.participants.map((p, i) => (
                  <View key={i} style={styles.rosterSlot}>
                    <View style={[styles.rosterCircle, p.name ? styles.rosterCircleFilled : styles.rosterCircleEmpty]}>
                      <Text style={p.name ? styles.rosterCircleFilledText : styles.rosterCircleEmptyText}>
                        {p.name ? initials(p.name) : "?"}
                      </Text>
                    </View>
                    <Text style={styles.rosterLabel} numberOfLines={1}>
                      {p.name ? p.name.split(" ")[0] : "Libre"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.gridValue}>
                Vous{booking.participants[0]?.name ? `, ${booking.participants[0].name}` : ""}
              </Text>
            )}
          </View>
        </View>

        {isPadel && !isPast && (
          <View style={[styles.statusBanner, filledCount < 4 ? styles.statusPending : styles.statusComplete]}>
            <View style={[styles.statusDot, { backgroundColor: filledCount < 4 ? courtColors.amber : courtColors.chartreuse }]} />
            <Text style={styles.statusText}>
              {filledCount < 4 ? (
                <>
                  <Text style={styles.statusBold}>{filledCount}/4 joueurs</Text> — complète l&apos;équipe avant{" "}
                  <Text style={styles.statusBold}>{deadlineHour}h</Text>, sinon le court est automatiquement libéré.
                </>
              ) : (
                <Text style={styles.statusBold}>Équipe complète</Text>
              )}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.perforation} />

      <View style={styles.stub}>
        <View style={styles.barcode} />
        <Text style={styles.code}>N° {booking.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.note}>Présente ce billet à l&apos;accueil. Retrouve-le dans Mes réservations.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: courtColors.ink800,
    borderWidth: 1,
    borderColor: courtColors.line,
    borderRadius: 18,
    overflow: "hidden",
  },
  top: {
    padding: 24,
    paddingTop: 26,
  },
  eyebrow: {
    fontFamily: courtFontMono,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: courtColors.chartreuseDim,
  },
  courtName: {
    fontWeight: "800",
    fontSize: 32,
    lineHeight: 34,
    color: courtColors.chartreuse,
    marginTop: 6,
  },
  tag: {
    fontFamily: courtFontMono,
    fontSize: 12,
    color: courtColors.chalkDim,
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
    fontFamily: courtFontMono,
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: courtColors.chalkFaint,
    marginBottom: 4,
  },
  gridValue: {
    fontWeight: "800",
    fontSize: 15.5,
    color: courtColors.chalk,
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
  rosterCircleYou: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1.5,
    borderColor: courtColors.chartreuse,
  },
  rosterCircleYouText: {
    fontFamily: courtFontMono,
    fontSize: 9,
    fontWeight: "600",
    color: courtColors.chartreuse,
  },
  rosterCircleFilled: {
    backgroundColor: courtColors.chartreuse,
  },
  rosterCircleFilledText: {
    fontFamily: courtFontMono,
    fontSize: 11,
    fontWeight: "600",
    color: courtColors.ink900,
  },
  rosterCircleEmpty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: courtColors.line,
  },
  rosterCircleEmptyText: {
    fontFamily: courtFontMono,
    fontSize: 11,
    color: courtColors.chalkFaint,
  },
  rosterLabel: {
    fontSize: 9,
    color: courtColors.chalkFaint,
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
  statusPending: {
    backgroundColor: "rgba(227,178,60,0.08)",
    borderWidth: 1,
    borderColor: courtColors.amberDim,
  },
  statusComplete: {
    backgroundColor: "rgba(215,255,63,0.06)",
    borderWidth: 1,
    borderColor: courtColors.chartreuseDim,
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
    color: courtColors.chalkDim,
    lineHeight: 17,
  },
  statusBold: {
    color: courtColors.chalk,
    fontWeight: "700",
  },
  perforation: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderTopColor: courtColors.line,
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
    backgroundColor: courtColors.chalkDim,
    opacity: 0.4,
    borderRadius: 3,
  },
  code: {
    fontFamily: courtFontMono,
    fontSize: 13,
    letterSpacing: 1.2,
    color: courtColors.chalkDim,
  },
  note: {
    fontSize: 11,
    color: courtColors.chalkFaint,
    textAlign: "center",
    maxWidth: 280,
  },
});
