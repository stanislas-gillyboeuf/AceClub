import { View, Text } from "@/tw";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "primary" | "orange" | "destructive";

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: {
    bg: "bg-bg-secondary dark:bg-bg-secondary-dark",
    text: "text-label-primary dark:text-label-primary-dark",
  },
  primary: {
    bg: "bg-primary/15 dark:bg-primary-dark/15",
    text: "text-primary dark:text-primary-dark",
  },
  orange: {
    bg: "bg-accent-orange/15",
    text: "text-accent-orange",
  },
  destructive: {
    bg: "bg-destructive/15 dark:bg-destructive-dark/15",
    text: "text-destructive dark:text-destructive-dark",
  },
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View className={cn("px-2.5 py-1 rounded-full", styles.bg, className)}>
      <Text className={cn("text-xs font-sans-medium", styles.text)}>
        {children}
      </Text>
    </View>
  );
}
