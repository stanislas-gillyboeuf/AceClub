import { View, StyleSheet, Platform } from "react-native";
import { colors } from "@/constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeIn } from "react-native-reanimated";

interface BirthdateStepProps {
  dateOfBirth: Date;
  onDateChange: (date: Date) => void;
}

const now = new Date();
export const MIN_AGE = 13;
export const MAX_AGE = 100;
const maxDate = new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate());
const minDate = new Date(now.getFullYear() - MAX_AGE, now.getMonth(), now.getDate());

export function BirthdateStep({ dateOfBirth, onDateChange }: BirthdateStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={styles.title}
        >
          Quelle est ta date de naissance ?
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(250).duration(400)}
          style={styles.subtitle}
        >
          {`Tu dois avoir au moins ${MIN_AGE} ans pour utiliser AceClub.`}
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeIn.delay(400).duration(400)}
        style={styles.pickerContainer}
      >
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            if (selectedDate) onDateChange(selectedDate);
          }}
          maximumDate={maxDate}
          minimumDate={minDate}
          locale="fr-FR"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.37,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.gray500,
    lineHeight: 22,
  },
  pickerContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
