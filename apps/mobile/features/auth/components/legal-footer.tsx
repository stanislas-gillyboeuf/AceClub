import { View, Text, Pressable, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { onboardingColors } from "@/features/onboarding/theme";

interface LegalFooterProps {
  paddingBottom: number;
}

/** CGU/confidentialité footer shared by sign-in and sign-up — same copy/links on both. */
export function LegalFooter({ paddingBottom }: LegalFooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom }]}>
      <Text style={styles.text}>En continuant, tu acceptes nos</Text>
      <View style={styles.links}>
        <Pressable onPress={() => WebBrowser.openBrowserAsync("https://ace-club.app/terms")} hitSlop={12}>
          <Text style={styles.link}>CGU</Text>
        </Pressable>
        <Text style={styles.text}> et </Text>
        <Pressable onPress={() => WebBrowser.openBrowserAsync("https://ace-club.app/privacy")} hitSlop={12}>
          <Text style={styles.link}>Politique de confidentialité</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  text: {
    fontSize: 12,
    color: onboardingColors.fgDim,
  },
  links: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  link: {
    fontSize: 12,
    color: onboardingColors.fg,
    textDecorationLine: "underline",
  },
});
