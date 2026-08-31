import { useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, type GestureResponderEvent, type TextStyle, type ViewStyle } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme, type ColorScheme } from "@/hooks/use-color-scheme";
import { bookingGreen } from "../theme";
import { SURFACE_LABELS } from "../lib/court-filters";
import type { BoardCourt, BoardHourCell } from "@/types/court";

const LABEL_COL_WIDTH = 100;
const HOUR_COL_WIDTH = 50;
const HEADER_HEIGHT = 34;
const ROW_HEIGHT = 54;

interface BookingBoardProps {
  courts: BoardCourt[];
  /** When set, the board auto-scrolls horizontally to this hour on mount/update (used for "today"). */
  scrollToHour?: number;
  onSelectFree: (court: BoardCourt, hour: number) => void;
  onSelectBooked: (court: BoardCourt, cell: BoardHourCell, event: GestureResponderEvent) => void;
}

export function BookingBoard({ courts, scrollToHour, onSelectFree, onSelectBooked }: BookingBoardProps) {
  const scheme = useColorScheme();
  const scrollRef = useRef<ScrollView>(null);
  const hours = courts[0]?.hours.map((h) => h.hour) ?? [];

  useEffect(() => {
    if (scrollToHour == null || hours.length === 0) return;
    const index = Math.max(hours.indexOf(scrollToHour), 0);
    scrollRef.current?.scrollTo({ x: index * HOUR_COL_WIDTH, animated: false });
    // Re-run whenever the board's court data identity changes (new day/sport fetched) while targeting "today".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToHour, courts]);

  if (courts.length === 0) return null;

  return (
    <View style={[styles.wrap, { borderColor: semanticColors.borderColor[scheme] }]}>
      <View
        style={[
          styles.labelColumn,
          { backgroundColor: semanticColors.cardBackground[scheme], borderRightColor: semanticColors.divider[scheme] },
        ]}
      >
        <View style={[styles.corner, { height: HEADER_HEIGHT, borderBottomColor: semanticColors.divider[scheme] }]}>
          <Text style={[styles.cornerText, { color: semanticColors.labelTertiary[scheme] }]}>COURT</Text>
        </View>
        {courts.map((court) => (
          <View
            key={court.id}
            style={[styles.courtLabel, { height: ROW_HEIGHT, borderBottomColor: semanticColors.divider[scheme] }]}
          >
            <Text style={[styles.courtName, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
              {court.name}
            </Text>
            <Text style={[styles.courtTag, { color: semanticColors.labelTertiary[scheme] }]} numberOfLines={1}>
              {courtTag(court)}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.hourRow, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
            {hours.map((h) => (
              <View
                key={h}
                style={[
                  styles.hourHead,
                  { width: HOUR_COL_WIDTH, height: HEADER_HEIGHT, borderBottomColor: semanticColors.divider[scheme] },
                ]}
              >
                <Text style={[styles.hourHeadText, { color: semanticColors.labelSecondary[scheme] }]}>{h}h</Text>
              </View>
            ))}
          </View>
          {courts.map((court) => (
            <View
              key={court.id}
              style={[styles.cellRow, { height: ROW_HEIGHT, backgroundColor: semanticColors.cardBackground[scheme] }]}
            >
              {court.hours.map((cell) => (
                <Cell
                  key={cell.hour}
                  cell={cell}
                  scheme={scheme}
                  borderColor={semanticColors.divider[scheme]}
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
  scheme: ColorScheme;
  borderColor: string;
  onPress: (event: GestureResponderEvent) => void;
}

function Cell({ cell, scheme, borderColor, onPress }: CellProps) {
  const interactive = cell.status === "free" || cell.status === "mine" || cell.status === "booked";

  let content: string | null = null;
  let cellStyle: ViewStyle = {};
  let textStyle: TextStyle = { color: colors.white };

  if (cell.status === "free") {
    content = `${cell.hour}h`;
    cellStyle = { backgroundColor: bookingGreen.bright };
    textStyle = { color: bookingGreen.onBright };
  } else if (cell.status === "mine") {
    content = "VOUS";
    cellStyle = { backgroundColor: semanticColors.systemGray6[scheme], borderWidth: 1.5, borderColor: bookingGreen.bright };
    textStyle = { color: bookingGreen.dim };
  } else if (cell.status === "booked") {
    content = "●";
    const accent = cell.bookedAsClub ? colors.accentOrange : colors.red500;
    cellStyle = { backgroundColor: semanticColors.systemGray6[scheme], borderWidth: 1, borderColor: accent };
    textStyle = { color: accent };
  } else if (cell.status === "past") {
    content = `${cell.hour}h`;
    cellStyle = { borderWidth: 1, borderStyle: "dashed", borderColor };
    textStyle = { color: semanticColors.labelTertiary[scheme] };
  }

  return (
    <View style={[styles.cellWrap, { borderBottomColor: borderColor }]}>
      <Pressable
        disabled={!interactive}
        onPress={onPress}
        style={[styles.cell, cellStyle, { width: HOUR_COL_WIDTH - 8 }]}
      >
        {content && <Text style={[styles.cellText, textStyle]}>{content}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  labelColumn: {
    width: LABEL_COL_WIDTH,
    borderRightWidth: 1,
  },
  corner: {
    justifyContent: "flex-end",
    paddingBottom: 9,
    paddingLeft: 12,
    borderBottomWidth: 1,
  },
  cornerText: {
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  courtLabel: {
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  courtName: {
    fontWeight: "700",
    fontSize: 14.5,
  },
  courtTag: {
    fontSize: 9,
    textTransform: "uppercase",
  },
  hourRow: {
    flexDirection: "row",
  },
  hourHead: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  hourHeadText: {
    fontSize: 11.5,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  cellRow: {
    flexDirection: "row",
  },
  cellWrap: {
    width: HOUR_COL_WIDTH,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    alignSelf: "stretch",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 11.5,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
