import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { Trash2 } from "lucide-react-native";
import { colors } from "@/constants/theme";

interface DeleteRightActionProps {
  drag: SharedValue<number>;
  onPress: () => void;
}

export function DeleteRightAction({ drag, onPress }: DeleteRightActionProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 68 }],
  }));

  return (
    <Animated.View style={[styles.deleteAction, animatedStyle]}>
      <Pressable onPress={onPress} style={styles.deleteActionInner}>
        <Trash2 size={20} color="#FFFFFF" strokeWidth={1.5} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    width: 68,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionInner: {
    width: 68,
    height: "100%",
    backgroundColor: colors.red500,
    justifyContent: "center",
    alignItems: "center",
  },
});
