import { StyleSheet, Text, View } from "react-native";
import { WifiOff } from "lucide-react-native";
import { colors } from "@/constants/theme";

export default function OfflineScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <WifiOff size={40} color={colors.accentGreen} />
      </View>
      <Text style={styles.title}>Hors connexion</Text>
      <Text style={styles.subtitle}>
        Pas d'accès à Internet. L'application reprendra automatiquement dès
        que la connexion sera rétablie.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
    backgroundColor: colors.white,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.black,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: colors.gray500,
    maxWidth: 320,
    lineHeight: 20,
  },
});
