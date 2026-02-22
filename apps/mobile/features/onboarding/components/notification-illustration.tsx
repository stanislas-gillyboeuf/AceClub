import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

const memojis = [
  require("@/assets/images/memojis/ed-black.png"),
  require("@/assets/images/memojis/francis.png"),
  require("@/assets/images/memojis/george.png"),
];

const notifications = [
  {
    name: "Thomas",
    time: "2 min",
    message: "On se fait un match demain soir ?",
  },
  {
    name: "Julie",
    time: "15 min",
    message: "Super partie ! On remet ca quand tu veux",
  },
  {
    name: "Marc",
    time: "1h",
    message: "Nouveau joueur dans ton club, va voir !",
  },
];

export function NotificationIllustration() {
  return (
    <View style={styles.phone}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <View style={styles.signalBar} />
          <View style={[styles.signalBar, { height: 8 }]} />
          <View style={[styles.signalBar, { height: 10 }]} />
          <View style={[styles.signalBar, { height: 12 }]} />
          <View style={styles.batteryIcon} />
        </View>
      </View>

      {/* Notifications */}
      {notifications.map((notif, index) => (
        <View key={index}>
          <View style={styles.notifRow}>
            <Image source={memojis[index]} style={styles.avatar} />
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifName}>{notif.name}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifMessage} numberOfLines={1}>
                {notif.message}
              </Text>
            </View>
          </View>
          {index < notifications.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    width: 260,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    alignSelf: "center",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statusTime: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray400,
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  signalBar: {
    width: 3,
    height: 6,
    borderRadius: 1,
    backgroundColor: colors.gray300,
  },
  batteryIcon: {
    width: 18,
    height: 9,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    marginLeft: 4,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gray100,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  notifName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
  },
  notifTime: {
    fontSize: 12,
    color: colors.gray400,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.gray500,
    lineHeight: 17,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginLeft: 44,
  },
});
