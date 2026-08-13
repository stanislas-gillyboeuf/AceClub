import { View, Text, Pressable, ScrollView, StyleSheet, type GestureResponderEvent, type TextStyle, type ViewStyle } from "react-native";
import { courtColors, courtFontMono } from "../theme";
import { SURFACE_LABELS } from "../lib/court-filters";
import type { BoardCourt, BoardHourCell } from "@/types/court";

const LABEL_COL_WIDTH = 100;
const HOUR_COL_WIDTH = 50;
const HEADER_HEIGHT = 34;
const ROW_HEIGHT = 54;

interface BookingBoardProps {
  courts: BoardCourt[];
  fullMode: boolean;
  onSelectFree: (court: BoardCourt, hour: number) => void;
  onSelectBooked: (court: BoardCourt, cell: BoardHourCell, event: GestureResponderEvent) => void;
}

export function BookingBoard({ courts, fullMode, onSelectFree, onSelectBooked }: BookingBoardProps) {
  if (courts.length === 0) return null;
  const hours = courts[0].hours.map((h) => h.hour);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelColumn}>
        <View style={[styles.corner, { height: HEADER_HEIGHT }]}>
          <Text style={styles.cornerText}>COURT</Text>
        </View>
        {courts.map((court) => (
          <View key={court.id} style={[styles.courtLabel, { height: ROW_HEIGHT }]}>
            <Text style={styles.courtName} numberOfLines={1}>
              {court.name}
            </Text>
            <Text style={styles.courtTag} numberOfLines={1}>
              {courtTag(court)}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.hourRow}>
            {hours.map((h) => (
              <View key={h} style={[styles.hourHead, { width: HOUR_COL_WIDTH, height: HEADER_HEIGHT }]}>
                <Text style={styles.hourHeadText}>{h}h</Text>
              </View>
            ))}
          </View>
          {courts.map((court) => (
            <View key={court.id} style={[styles.cellRow, { height: ROW_HEIGHT }]}>
              {court.hours.map((cell) => (
                <Cell
                  key={cell.hour}
                  cell={cell}
                  fullMode={fullMode}
                  onPress={(e) =>
                    cell.status === "free" || cell.status === "mine"
                      ? onSelectFree(court, cell.hour)
                      : cell.status === "booked"
                        ? onSelectBooked(court, cell, e)
                        : undefined
                  }
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function courtTag(court: BoardCourt): string {
  const parts: string[] = [];
  if (court.surface) parts.push(SURFACE_LABELS[court.surface]);
  if (court.indoor) parts.push("Couvert");
  return parts.join(" · ");
}

interface CellProps {
  cell: BoardHourCell;
  fullMode: boolean;
  onPress: (event: GestureResponderEvent) => void;
}

function Cell({ cell, fullMode, onPress }: CellProps) {
  const interactive = cell.status === "free" || cell.status === "mine" || cell.status === "booked";

  let content: string | null = null;
  let cellStyle: ViewStyle = styles.cellBase;
  let textStyle: TextStyle = styles.textOnChartreuse;

  if (cell.status === "free") {
    content = `${cell.hour}h`;
    cellStyle = styles.cellFree;
    textStyle = styles.textOnChartreuse;
  } else if (cell.status === "mine") {
    content = fullMode ? "VOUS" : `${cell.hour}h`;
    cellStyle = styles.cellMine;
    textStyle = styles.textChartreuse;
  } else if (cell.status === "booked") {
    if (fullMode) {
      content = "●";
      cellStyle = cell.bookedAsClub ? styles.cellBookedClub : styles.cellBookedFull;
      textStyle = cell.bookedAsClub ? styles.textAmber : styles.textRust;
    }
  } else if (cell.status === "past" && fullMode) {
    content = `${cell.hour}h`;
    cellStyle = styles.cellPast;
    textStyle = styles.textFaint;
  }

  return (
    <View style={styles.cellWrap}>
      <Pressable
        disabled={!interactive}
        onPress={onPress}
        style={[styles.cell, cellStyle, { width: HOUR_COL_WIDTH - 8 }]}
      >
        {content && <Text style={[styles.cellText, textStyle]}>{content}</Text>}
        {cell.status === "booked" && !fullMode && <View style={styles.quietDot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: courtColors.lineQuiet,
    borderRadius: 14,
    overflow: "hidden",
  },
  labelColumn: {
    width: LABEL_COL_WIDTH,
    backgroundColor: courtColors.ink800,
    borderRightWidth: 1,
    borderRightColor: courtColors.lineQuiet,
  },
  corner: {
    justifyContent: "flex-end",
    paddingBottom: 9,
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: courtColors.lineQuiet,
  },
  cornerText: {
    fontFamily: courtFontMono,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: courtColors.chalkFaint,
  },
  courtLabel: {
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: courtColors.lineQuiet,
  },
  courtName: {
    fontWeight: "700",
    fontSize: 14.5,
    color: courtColors.chalk,
  },
  courtTag: {
    fontFamily: courtFontMono,
    fontSize: 9,
    textTransform: "uppercase",
    color: courtColors.chalkFaint,
  },
  hourRow: {
    flexDirection: "row",
    backgroundColor: courtColors.ink800,
  },
  hourHead: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: courtColors.lineQuiet,
  },
  hourHeadText: {
    fontFamily: courtFontMono,
    fontSize: 11.5,
    fontWeight: "600",
    color: courtColors.chalkDim,
  },
  cellRow: {
    flexDirection: "row",
    backgroundColor: courtColors.ink800,
  },
  cellWrap: {
    width: HOUR_COL_WIDTH,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: courtColors.lineQuiet,
  },
  cell: {
    flex: 1,
    alignSelf: "stretch",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cellBase: {},
  cellFree: {
    backgroundColor: courtColors.chartreuse,
  },
  cellMine: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1.5,
    borderColor: courtColors.chartreuse,
  },
  cellBookedFull: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.rustDim,
  },
  cellBookedClub: {
    backgroundColor: courtColors.ink700,
    borderWidth: 1,
    borderColor: courtColors.amberDim,
  },
  cellPast: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: courtColors.lineQuiet,
  },
  cellText: {
    fontFamily: courtFontMono,
    fontSize: 11.5,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  textOnChartreuse: { color: courtColors.ink900 },
  textChartreuse: { color: courtColors.chartreuse },
  textRust: { color: courtColors.rust },
  textAmber: { color: courtColors.amber },
  textFaint: { color: courtColors.chalkFaint },
  quietDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: courtColors.line,
  },
});
