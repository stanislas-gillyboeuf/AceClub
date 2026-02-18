import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { Building2, CheckCircle2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { Organization } from "@/types/organization";

interface VenueTileProps {
  organization: Organization;
  isSelected: boolean;
  onPress: () => void;
}

export function VenueTile({
  organization,
  isSelected,
  onPress,
}: VenueTileProps) {
  const scheme = useColorScheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
      ]}
    >
      <GlassView
        style={styles.tile}
        tintColor={isSelected ? colors.accentGreen : undefined}
      >
        {organization.logo ? (
          <Image
            source={{ uri: organization.logo }}
            style={styles.logo}
          />
        ) : (
          <View
            style={[
              styles.logoPlaceholder,
              { backgroundColor: `${colors.accentGreen}26` },
            ]}
          >
            <Building2 size={18} color={colors.accentGreen} strokeWidth={2} />
          </View>
        )}

        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              { color: semanticColors.labelPrimary[scheme] },
            ]}
            numberOfLines={1}
          >
            {organization.name}
          </Text>
          {organization.address ? (
            <Text
              style={[
                styles.address,
                { color: semanticColors.labelSecondary[scheme] },
              ]}
              numberOfLines={1}
            >
              {organization.address}
            </Text>
          ) : null}
        </View>

        {isSelected && (
          <CheckCircle2
            size={22}
            color={colors.accentGreen}
            fill={colors.accentGreen}
            strokeWidth={0}
          />
        )}
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.md,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: radii.md,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
  },
  address: {
    fontSize: 12,
  },
});
