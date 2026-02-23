import { View, Image, StyleSheet } from "react-native";

export function NotificationIllustration() {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require("@/assets/images/onboarding/notification-illustration.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
