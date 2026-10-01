import { View, StyleSheet } from "react-native";
import { CircleDot, Square, Sparkles } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { onboardingColors } from "../theme";
import { SelectableCard } from "./selectable-card";
import type { Sport } from "@/types/common";

type SportOption = "tennis" | "padel" | "both";

interface SportStepProps {
  selectedSports: Sport[];
  onSelectOption: (option: SportOption) => void;
  firstName: string;
  clubName: string | null;
}

function optionFor(selectedSports: Sport[]): SportOption | null {
  if (selectedSports.length === 2) return "both";
  if (selectedSports[0] === "tennis") return "tennis";
  if (selectedSports[0] === "padel") return "padel";
  return null;
}

export function SportStep({ selectedSports, onSelectOption, firstName, clubName }: SportStepProps) {
  const selected = optionFor(selectedSports);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.Text entering={FadeIn.delay(100).duration(400)} style={styles.title}>
          {firstName ? `${firstName}, quel sport pratiques-tu ?` : "Quel sport pratiques-tu ?"}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(250).duration(400)} style={styles.subtitle}>
          {clubName
            ? `On a hâte de te voir sur les terrains de ${clubName}.`
            : "Tu pourras toujours changer plus tard."}
        </Animated.Text>
      </View>

      <View style={styles.cards}>
        <SelectableCard
          label="Tennis"
          subtitle="Balle jaune"
          icon={CircleDot}
          height={88}
          selected={selected === "tennis"}
          onPress={() => onSelectOption("tennis")}
        />
        <SelectableCard
          label="Padel"
          subtitle="Entre 4 murs"
          icon={Square}
          height={88}
          selected={selected === "padel"}
          onPress={() => onSelectOption("padel")}
        />
        <SelectableCard
          label="Les deux"
          subtitle="Tennis et padel"
          icon={Sparkles}
          height={88}
          selected={selected === "both"}
          onPress={() => onSelectOption("both")}
        />
      </View>
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
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: onboardingColors.fg,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: onboardingColors.fgDim,
    lineHeight: 22,
  },
  cards: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
