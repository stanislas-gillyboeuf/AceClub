import { View, Text, ActivityIndicator, StyleSheet, type ViewStyle } from "react-native";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface LoaderStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  error?: string | null;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonVariant?: "spinner" | "rows";
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function LoaderState({
  isLoading,
  isEmpty,
  error,
  emptyIcon = "MessageSquare",
  emptyTitle = "Aucun résultat",
  emptyDescription,
  skeletonVariant = "spinner",
  children,
  containerStyle,
}: LoaderStateProps) {
  const scheme = useColorScheme();

  if (isLoading) {
    if (skeletonVariant === "rows") {
      return (
        <View style={[styles.rows, containerStyle]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.rowSkeleton}>
              <Skeleton width={44} height={44} borderRadius={10} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="60%" height={16} borderRadius={4} />
                <Skeleton width="80%" height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={[styles.center, containerStyle]}>
        <ActivityIndicator size="large" color={colors.accentGreen} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, containerStyle]}>
        <Text style={[styles.errorText, { color: semanticColors.labelSecondary[scheme] }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  rows: {
    gap: 12,
    paddingVertical: 8,
  },
  rowSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
});
