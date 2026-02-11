import { Pressable, Text } from "@/tw";
import {
  ActivityIndicator,
  type PressableProps,
} from "react-native";
import { cn } from "@/lib/cn";
import { lightImpact } from "@/lib/haptics";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outlined"
  | "destructive"
  | "cardRow"
  | "glass";

interface ButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  variant?: ButtonVariant;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; disabledContainer: string; disabledText: string }
> = {
  primary: {
    container: "bg-primary dark:bg-primary-dark h-button rounded-sm items-center justify-center",
    text: "text-white font-sans-semibold text-base",
    disabledContainer: "bg-border/30 dark:bg-border-dark/30",
    disabledText: "text-label-tertiary dark:text-label-tertiary-dark",
  },
  secondary: {
    container:
      "bg-bg-primary dark:bg-bg-primary-dark h-button rounded-sm items-center justify-center border border-border-subtle",
    text: "text-label-primary dark:text-label-primary-dark font-sans-semibold text-base",
    disabledContainer: "opacity-50",
    disabledText: "",
  },
  outlined: {
    container:
      "bg-bg-primary dark:bg-bg-primary-dark h-button rounded-sm items-center justify-center border border-border-subtle",
    text: "text-label-primary dark:text-label-primary-dark font-sans-medium text-base",
    disabledContainer: "opacity-50",
    disabledText: "",
  },
  destructive: {
    container:
      "bg-bg-primary dark:bg-bg-primary-dark h-button rounded-sm items-center justify-center border border-destructive/50 dark:border-destructive-dark/50",
    text: "text-destructive dark:text-destructive-dark font-sans-semibold text-base",
    disabledContainer: "opacity-50",
    disabledText: "",
  },
  cardRow: {
    container:
      "bg-bg-card dark:bg-bg-card-dark rounded-md px-card py-3.5 items-start justify-center",
    text: "text-label-primary dark:text-label-primary-dark font-sans text-base",
    disabledContainer: "opacity-50",
    disabledText: "",
  },
  glass: {
    container:
      "bg-primary/20 dark:bg-primary-dark/20 rounded-full px-4 py-2.5 items-center justify-center",
    text: "text-primary dark:text-primary-dark font-sans-medium text-base",
    disabledContainer: "opacity-50",
    disabledText: "",
  },
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        "w-full",
        styles.container,
        isDisabled && styles.disabledContainer,
        className
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      onPressIn={(e) => {
        lightImpact();
        props.onPressIn?.(e);
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#34C759"}
          size="small"
        />
      ) : (
        <Text
          className={cn(
            styles.text,
            isDisabled && styles.disabledText
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
